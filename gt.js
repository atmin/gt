// #! /usr/bin/env node
try {
	var log = require("custom-logger");
} catch (err) {
	console.error(err);
	console.error('could not load custom logger, have you forgot to run npm install?');
	process.exit(-1);
}

var optimist = require("optimist");
global.args = optimist.usage("JS unit testing and coverage in a single shot.\nUsage: $0")
		.default({
			log: 1,
			report: 0,
			help: 0,
			cover: "cover",
			xml: null
		}).alias('l', 'log').alias('r', 'report').alias('h', 'help').alias('c', 'cover')
		.string("cover").string("xml")
		.describe('l', "log level, 0 - debug, 1 - normal, 2 - warnings, 3 - errors only")
		.describe('r', "report level, 0 - all test results, 1 - skip passed tests")
		.describe("cover", "output folder with coverage")
		.describe("xml", "output JUnit xml filename")
		.argv;

if (!module.parent) {
	if (args.h || args.help || !args._.length) {
		optimist.showHelp();
		process.exit(0);
	}
}

// var coverage = require("./lib/coverage");

var logMode = (typeof args.l === "number" ? args.l : 1);
log["new"]({
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

log.debug("module dir name", __dirname);
var currDirname = process.cwd();
log.debug("working dir name", currDirname);

var sure = require('./sure');
console.assert(sure, 'loaded sure');
console.log(sure);

/*
var Reporter = require("./src/Reporter").Reporter;
var JUnitReporter = require("./src/JUnitReporter").Reporter;

log.debug("importing test collection module");
var TestCollection = require("./src/TestCollection").TestCollection;
console.assert(TestCollection, "TestCollection is undefined");

log.debug("importing test runner module");
var TestRunner = require("./src/TestRunner").TestRunner;
console.assert(TestRunner, "cannot find TestRunner");

log.debug("binding methods to preserve original object information in global invocations");
console.assert(typeof Function.prototype.bind === "function", "bind is unavailable!");

global.test = TestCollection.add.bind(TestCollection);
global.moduleName = TestCollection.module.bind(TestCollection);

global.deepEqual = global.equal = TestRunner.equal.bind(TestRunner);
global.ok = TestRunner.ok.bind(TestRunner);
global.expect = TestRunner.expect.bind(TestRunner);
global.raises = TestRunner.raises.bind(TestRunner);
global.notDeepEqual = function () {
	return !global.deepEqual(arguments);
};

function installCoverage(testModules) {
	var verboseCoverageHook = false;
	coverage.hookRequire(verboseCoverageHook);

	var path = require("path");
	for (var k = 0; k < testModules.length; k += 1) {
		var testModuleName = testModules[k];
		testModuleName = path.resolve(testModuleName);
		log.log("will add code coverage for", testModuleName);
		testModules[k] = testModuleName;
		coverage.addInstrumentCandidate(testModuleName);
	}
}

installCoverage(args._);
*/

sure.init();
sure.collect();

/*
TestCollection.collectTests(args._);
console.log();
*/

/*
TestRunner._tests = TestCollection.getAllTests();
console.assert(Array.isArray(TestRunner._tests), "could not get all tests");
TestRunner.runTests();

console.log();
*/
sure.run();
var failed = sure.report();
process.exit(failed);