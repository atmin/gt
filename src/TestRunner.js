var TestRunner = {
	init: function (config) {
		console.assert(config, 'missing config');
		this._currentTest = null;
		this._tests = null;
		this.config = config;
	},

	bufferMessage: function () {
		var msg = [].slice.call(arguments).join('');
		this.buffered.push(msg);
	},

	hideConsole: function () {
		this._log = console.log;
		this._warn = console.warn;
		this._error = console.error;
		this.buffered = [];
		console.log = console.warn = console.error = this.bufferMessage.bind(this);
	},

	restoreConsole: function () {
		console.log = this._log;
		console.warn = this._warn;
		console.error = this._error;
		return this.buffered.join('\n');
	},

	runTests: function () {
		console.assert(this._tests, "runner has no test collection");

		var k;
		for (k = 0; k < this._tests.length; k += 1) {
			var test = this._tests[k];
			console.assert(test, "could not get test");
			test.check();
			this._currentTest = test;

			try {
				if (!this.config.output) {
					this.hideConsole();
				} else {
					log.info("starting test '" + test.name + "'");
				}
				test.code();
			} catch (errors) {
				console.error("crash in test '" + test.name + "'\n", errors);
				test.hasCrashed = true;
			}
			finally {
				if (!this.config.output) {
					test.stdout = this.restoreConsole();
				}
			}
			log.debug("finished test '" + test.name + "'", this._currentTest.assertions + " assertions,", this._currentTest.broken, "broken");
			this._afterTest();
		}
	},

	// hooks to be used by the unit tests
	equal: function (a, b, message) {
		this._beforeAssertion();

		if (a !== b) {
			this._brokenAssertion(a + " !== " + b + ", " + message);
		}
	},

	ok: function (condition, message) {
		this._beforeAssertion();

		if (!condition) {
			this._brokenAssertion("'" + condition + "' failed, " + message);
		}
	},

	expect: function (numberOfAssertions) {
		console.assert(this._currentTest !== undefined, "current test is undefined");
		console.assert(numberOfAssertions >= 0, "invalid number of expected assertion", numberOfAssertions, "test", this._currentTest.name);
		this._currentTest.expected = numberOfAssertions;
	},

	func: function (f, message) {
		this.equal(typeof f, 'function', message);
	},

	arity: function (f, n, message) {
		console.assert(this._currentTest, "current test is undefined");
		this.func(f, message);
		if (this._currentTest.expected) {
			this._currentTest.expected++;
		}
		this.equal(f.length, n, message);
	},

	raises: function (code, expectedExceptionType, message) {
		console.assert(this._currentTest !== undefined, "current test is undefined");
		var typeName = null;
		if (!message && typeof expectedExceptionType === 'string') {
			message = expectedExceptionType;
			expectedExceptionType = null;
		} else {
			console.assert(expectedExceptionType !== undefined, "undefined expected exception type, message:", message);
			typeName = expectedExceptionType.name;
		}
		console.assert(typeof message === "string", "message should be a string");
		this._beforeAssertion();

		try {
			code();
		} catch (error) {
			if (!typeName) {
				// caught some exception, nothing specific was expected
				return;
			}
			if (expectedExceptionType === typeof error) {
				return;
			}
			if (error.name === expectedExceptionType) {
				return;
			}
			if (error.name === typeName) {
				return;
			}
			var caughtType = error.name || typeof error;
			this._brokenAssertion("expected exception of type '" + typeName + "', caught '" + caughtType + "' '" + message + "'");
			return;
		}
		if (typeName) {
			this._brokenAssertion("exception of type '" + typeName + "' not thrown, '" + message + "'");
		} else {
			this._brokenAssertion("exception NOT thrown, '" + message + "'");
		}
	},

	raisesAssertion: function (code, message) {
  	this.raises(code, 'AssertionError', message);
  },

	// collecting errors during unit test run
	_currentTest: undefined,

	_afterTest: function () {
		this._currentTest = undefined;
	},

	_beforeAssertion: function () {
		console.assert(this._currentTest !== undefined, "current test is undefined");
		this._currentTest.assertions += 1;
	},

	_brokenAssertion: function (message) {
		console.assert(this._currentTest !== undefined, "current test is undefined");
		this._currentTest.broken += 1;
		var msg = "ERROR in '" + this._currentTest.name + "', " + message;
		console.error(msg);
		this._currentTest.errorMessage(msg);
	}
};

exports.TestRunner = TestRunner;