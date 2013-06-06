var tests = [
'./basic/tests',
'./basic/exceptionTests',
'./amd/fooTests',
'./altAsserrionSyntax/tests',
'./arrays/test',
'./faster/test',
'./fluent/foo',
'./funcAndArity/test',
'./expect/test',
'./extend/test',
'./basic/definedUndefined',
'./basic/null',
'./basic/empty'
];

var coffeeTests = [
'./coffee/coffeeTestsCoffee/tests.coffee',
'./coffee/coffeeTestsJs/tests.coffee',
'./coffee/jsTestsCoffee/tests.js'
];

var adapterTests = [
'./doh/fooTests',
'./dohDefine/fooTests',
'./gtAndQUnit/gtTests',
'./gtAndQUnit/qunitTests'
];

var moreTests = [
'./lodash/totalLength',
'./moduleSetupTeardown/test',
'./namedTest/foo',
'./overrideGt/test',
'./qunit/foo',
'./reporting/tests.coffee',
'./skipTest/tests'
];

var jsUnityTests = [
'./jsUnity/foo',
'./jsUnity/fooTests'
];

var weirdTests = [
// broken on purpose to show console hiding
'./silent/fooTest'
];

var asyncTests = [
'./async/test',
'./async/timeoutTests',
'./exec/tests'
];

tests.forEach(require);
coffeeTests.forEach(require);
adapterTests.forEach(require);
moreTests.forEach(require);
jsUnityTests.forEach(require);
asyncTests.forEach(require);