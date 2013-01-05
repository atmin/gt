// formatting results utility functions
var getLines = require('./utils').getLines;
var centerMessage = require('./utils').centerMessage;
var sprintf = require('sprintf').sprintf;
var clc = require('cli-color');
var sprintf = require('sprintf').sprintf;

var Test = require("./Test").Test;
console.assert("string" === typeof Test.PASS, "Test.PASS is undefined");

function _reportTests(tests, skipPassed) {
	console.assert(Array.isArray(tests), "tests is not an array");

	var useColors = true;
	if (typeof args !== 'undefined') {
		useColors = args.colors;
	}

	tests.forEach(function (test) {
		if (!test.hasFailed() && skipPassed) {
			return;
		}
		var message = test.formMessage();
		var status = test.status();
		console.assert("string" === typeof status, "could not get status", message);

		if (useColors) {
			var color = _statusColor(status);
			console.assert("function" === typeof color, "could not get color for test status", test.status());
			console.log(color(message));
		} else {
			console.log(message);
		}
		if (test.hasFailed() && test.stdout) {
			console.log(test.stdout);
		}
	});
}

function _report(modules, skipPassed) {
	console.assert(Array.isArray(modules), "modules is not an array");
	if (!modules.length) {
		return;
	}
	
	var lineLength = 100;
	console.log(centerMessage(lineLength, "Individual Test Results"));

	var useColors = true;
	if (typeof args !== 'undefined') {
		useColors = args.colors;
	}

	modules.forEach(function (module) {
		console.assert("string" === typeof module.name, "could not find name for module");

		var failed = module.hasFailed();
		if (useColors) {
			var color = (failed ? clc.redBright : clc.greenBright);
			console.log(color(module.name));
		} else {
			console.log(module.name);
		}

		_reportTests(module.getTests(), skipPassed);

		var good = module.getPassedTests();
		var total = module.getNumberOfTests();
		var percentage = module.passedPercentage();

		var message = sprintf("  %-60s   %3d%% (%d / %d)", '', Math.round(percentage), good, total);
		// var message = "\t\t" + Math.round(percentage) + "% (" + good + "/" + total + ")";

		if (useColors) {
			var color = (failed ? clc.redBright : clc.greenBright);
			console.log(color(message));
		} else {
			console.log(message);
		}
	});

	console.log(centerMessage(lineLength));
}

function _statusColor(status) {
	console.assert("string" === typeof status, "status is not a string", status);
	console.assert("string" === typeof Test.PASS, "Test.PASS is undefined");

	switch (status) {
	case Test.PASS:
		return clc.greenBright;
	case Test.FAIL:
		return clc.redBright.bold;
	case Test.CRASH:
		return clc.magentaBright;
	case Test.INCOMPLETE:
		return clc.yellowBright;
	default:
		return clc.orangeBright;
	}
}

exports.Reporter = {
	log: _report
};