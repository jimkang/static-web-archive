/* global __dirname */

var test = require('tape');
var FSFile = require('../file-abstractions/fs-file');
var establishLastPageIndex = require('../establish-last-page-index');
var randomId = require('idmaker').randomId;

var assertNoError = require('assert-no-error');

var fileAbstraction;

fileAbstraction = FSFile({
  rootPath: `${__dirname}/file-abstractions/test-root`
});

var indexFileLocation = 'indexes/' + randomId(4);

console.log('indexFileLocation:', indexFileLocation);

test('Get index when no index file exists yet', noIndexYetTest);
test('Get index when index file exists', indexExistsTest);

function noIndexYetTest(t) {
  establishLastPageIndex(fileAbstraction, indexFileLocation, checkResult);

  function checkResult(error, index) {
    assertNoError(t.ok, error, 'No error while establishing index.');
    t.equal(index, 0, 'An index of 0 is established.');
    t.end();
  }
}

function indexExistsTest(t) {
  fileAbstraction.update(
    { filePath: indexFileLocation, content: '4' },
    runEstablish
  );

  function runEstablish(error) {
    assertNoError(t.ok, error, 'No error while updating file.');
    establishLastPageIndex(fileAbstraction, indexFileLocation, checkResult);
  }

  function checkResult(error, index) {
    assertNoError(t.ok, error, 'No error while establishing index.');
    t.equal(index, 4, 'Index is correct.');
    t.end();
  }
}
