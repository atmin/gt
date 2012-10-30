var log = require("custom-logger");

var args = require("optimist").argv,
	help = "run just tests:\n\tnode gt <test module1, module2, ...> \n\
run tests and coverage:\n\tistanbul cover gt <test module> \n\
example:\n\tnode gt tests.js \n\
options: \n\
\t-l <log level>, from 0 (debug) - 3 (errors only) \n\
\t-r <reporter level>, 0 (all tests) - 1 (failed tests only)";

if (args.h || args.help || !args._.length) {
	console.log(help);
	process.exit(0);
}

var logMode = (typeof args.l === "number" ? args.l : 1);
var reporterLevel = (typeof args.r === "number" ? args.r : 0);

log.new({
	debug: { level: 0, event: "debug", color: "yellow" },
	log: { level: 1, event: "log" },
	warn: { level: 2, event: "warn", color: "orange" },
	error: { level: 3, event: "error", color: "red" }
});

log.config({
	level: logMode
});
log.debug("log level", logMode);
global.log = log;

log.debug("dir name", __dirname); 

log.debug("importing test reporter module, level", reporterLevel);
switch (reporterLevel) {
case 0:
	log.debug("using standard reporter of all tests");
	var Reporter = require("./src/Reporter").Reporter;
	break;
case 1:
	log.debug("using reporter of failed tests only");
	var Reporter = require("./src/FailedTestsReporter").Reporter;
	break;
default:
	log.debug("using standard reporter of all tests");
	var Reporter = require("./src/Reporter").Reporter;
}
console.assert(Reporter, "Reporter is undefined, level", reporterLevel);

log.debug("importing test collection module");
var TestCollection = require("./src/TestCollection").TestCollection;
console.assert(TestCollection, "TestCollection is undefined");

log.debug("importing test runner module");
var TestRunner = require("./src/TestRunner").TestRunner;
console.assert(TestRunner, "cannot find TestRunner");

log.debug("binding methods to preserve original object information in global invocations");
console.assert(typeof Function.prototype.bind === "function", "bind is unavailable!");
global.test = TestCollection.add.bind(TestCollection);
global.moduleName = TestRunner.module.bind(TestRunner);
global.equal = TestRunner.equal.bind(TestRunner);
global.ok = TestRunner.ok.bind(TestRunner);
global.expect = TestRunner.expect.bind(TestRunner);
global.raises = TestRunner.raises.bind(TestRunner);

for (var k = 0; k < args._.length; k += 1) {
	var testModuleName = args._[k];
	log.debug("loading module with unit tests", testModuleName);
	try {
		require(testModuleName);
	} catch (errors) {
		console.error(errors);
		console.log();
		console.log(help);
		process.exit(1);
	}
}
log.debug("loaded", TestCollection.getNumberOfTests(), "tests from '" + testModuleName + "'");
console.log();

// todo: replace with mixin
TestRunner._tests = TestCollection._tests;
TestRunner.runTests();

console.log();
var failedTestNumber = Reporter.log(TestCollection._tests);
console.assert(typeof failedTestNumber === "number", "reporter has not returned number of failed tests");
process.exit(failedTestNumber);