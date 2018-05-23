/* global __dirname */
var test = require('tape');
var assertNoError = require('assert-no-error');
var FSFile = require('../../file-abstractions/fs-file');
var randomId = require('idmaker').randomId;

var defaultCtorOpts = {
  rootPath: `${__dirname}/test-root`,
  encoding: 'utf8'
};

var testCases = [
  {
    filePath: 'directory-a/' + randomId(14) + '.txt',
    content: 'Hello, here is some content: ' + randomId(20)
  },
  {
    filePath: 'directory-b/subdirectory-' + randomId(5) + '/' + randomId(14) + '.txt',
    content: 'Hello, here is some content: ' + randomId(20)
  },
  {
    filePath: 'directory-a/' + randomId(14) + '.txt',
    content: 'Hello, here is some content: ' + randomId(20)
  },
];

testCases.forEach(runUpdateTest);
testCases.forEach(runGetTest);

function runGetTest(testCase) {
  test('Getting ' + testCase.filePath, getFileTest);

  function getFileTest(t) {
    var getFile = FSFile(defaultCtorOpts).get;
    getFile(testCase.filePath, checkRetrievedFile);

    function checkRetrievedFile(error, result) {
      assertNoError(t.ok, error, 'No error from getFile.');
      t.equal(result.content, testCase.content, 'Content is correct.');
      console.log('Please head over to tests/file-abstractions/test-root and manually inspect the files created by these tests.');
      t.end();
    }
  }
}

function runUpdateTest(testCase) {
  test('Updating ' + testCase.filePath, updateTest);

  function updateTest(t) {
    var updateFile = FSFile(defaultCtorOpts).update;
    updateFile(testCase, checkResult);

    function checkResult(error, commit) {
      assertNoError(t.ok, error, 'No error from updateFile.');
      t.end();
    }
  }
}

