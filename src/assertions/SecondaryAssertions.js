/** @module assertions/secondary */
var TestRunInfo = require('../TestRunInfo').TestRunInfo;
var joinArguments = require('../utils/joinArguments');
var check = require('check-types');
var spawn = require('child_process').spawn;

// returns total execution time
function timeCode(code, n) {
	check.verifyFunction(code, 'missing code to time');
	check.verifyPositiveNumber(n, 'incorrect number of times to execute', n);
	var start = new Date();
	var k = n;
	for(; k > 0; k -= 1) {
		code();
	}
	var end = new Date();
	return end - start;
}

var SecondaryAssertions = {
	sameResults: function (f1, f2, inputs, message) {
		check.verifyFunction(f1, 'missing first function');
		check.verifyFunction(f2, 'missing second function');
		check.verifyArray(inputs, 'inputs should be a array');
		if (!check.isString(message)) {
			message = f1.name + ' vs ' + f2.name;
		}
		console.assert(inputs.length > 0, 'empty inputs array');
		inputs.forEach(function (args) {
			gt.equal(f1.call(null, args), f2.call(null, args),
				message + ' with inputs ' + args.join(' '));
		});
	}, 

	deferCall: function(fn) {
		check.verifyFunction(fn, 'expected a function');
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return fn.apply(null, args);
		};
	},

	faster: function (name, code, n, limitMs) {
		check.verifyString(name, 'name should be a string');
		check.verifyFunction(code, 'missing function code');
		if (check.isPositiveNumber(n) && !limitMs) {
			limitMs = n;
			n = 1;
		}
		check.verifyPositiveNumber(n, 'incorrect number of times to execute', n);
		check.verifyPositiveNumber(limitMs, 'missing limit ms', limitMs);

		var time = timeCode(code, n);
		gt.ok(time < limitMs, name + ' ' + n + ' time(s) took ' 
			+ time + 'ms exceeded ' + limitMs + 'ms limit');
	},

	fasterThan: function (name, f1, f2, n) {
		check.verifyString(name, 'name should be a string');
		check.verifyFunction(f1, 'missing first function');
		check.verifyFunction(f2, 'missing second function');
		if (!check.isPositiveNumber(n)) {
			n = 1;
		}
		var time1 = timeCode(f1, n);
		var time2 = timeCode(f2, n);
		gt.ok(time1 < time2, name + ' first function is slower than second, ' +
			time1 + 'ms vs ' + time2 + 'ms on ' + n + ' runs');
	},

	defined: function (value) {
		var message = joinArguments(arguments, 1);
		this.ok(typeof value !== 'undefined', message);
	},

	undefined: function (value) {
		var message = joinArguments(arguments, 1);
		this.equal(typeof value, 'undefined', message);
	},

	null: function (value) {
		var message = joinArguments(arguments, 1);
		this.equal(value, null, message);
	},

	func: function (f) {
		var message = joinArguments(arguments, 1);
		console.log(message);
		this.equal(typeof f, 'function', message);
	},

	object: function (o) {
		var message = joinArguments(arguments, 1);
		this.equal(typeof o, 'object', message);
	},

	array: function (array) {
		var message = joinArguments(arguments, 1) || 'checking if ' + array + ' is an array';
		this.ok(Array.isArray(array), message);
	},

	arity: function (f, n, message) {
		check.verifyObject(TestRunInfo, 'missing test run info');
		check.verifyObject(TestRunInfo._currentTest, "current test is undefined");
		this.func(f, message);
		if (TestRunInfo._currentTest.expected) {
			TestRunInfo._currentTest.expected += 1;
		}
		this.equal(f.length, n, message);
	},

	exec: function (command, args, expectedExitCode, message) {
		check.verifyObject(TestRunInfo._currentTest, "current test is undefined");
		check.verifyString(command, 'command should be a string');
		console.assert(expectedExitCode >= 0, 'invalid expected exit code', expectedExitCode);
		// throw new Error('gt.exec is not implemented yet');
		var program = spawn(command, args);
		program.stdout.setEncoding('utf-8');
		program.stdout.on('data', function (data) {
			console.log('exec:', data.trim());
		});
		program.on('exit', function (code) {
			console.log('exec exit code:', code);
			gt.equal(code, expectedExitCode, message);
			gt.start();
		});
	},

	raisesAssertion: function (code, message) {
		this.raises(code, 'AssertionError', message);
	},

	raisesReference: function (code, message) {
		this.raises(code, 'ReferenceError', message);
	}
};

SecondaryAssertions.secondary = function () {
	var names = Object.keys(SecondaryAssertions);
	return names;
};

module.exports = SecondaryAssertions;