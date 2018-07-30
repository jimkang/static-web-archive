/* global __dirname */
var test = require('tape');
var assertNoError = require('assert-no-error');
var UpdateRSS = require('../update-rss');
var getFileAbstraction = require('./fixtures/get-file-abstraction-for-env');
var fileAbstraction = getFileAbstraction(__dirname + '/rss-test-archive-root');
var fs = require('fs');

test('Test updating RSS', updateRSSTest);

function updateRSSTest(t) {
  var correctRSSText = removeLastBuildDate(
    fs.readFileSync(__dirname + '/fixtures/correct.rss', { encoding: 'utf8' })
  );

  var updateRSS = UpdateRSS({
    rssFeedOpts: {
      title: 'RSS weblog'
    },
    archiveBaseURL: 'https://smidgeo.com/notes/deathmtn',
    fileAbstraction
  });
  updateRSS(checkRSS);

  function checkRSS(error) {
    assertNoError(t.ok, error, 'No error while updating RSS.');
    var rssText = removeLastBuildDate(
      fs.readFileSync(__dirname + '/rss-test-archive-root/rss/index.rss', {
        encoding: 'utf8'
      })
    );
    t.equals(rssText, correctRSSText, 'RSS file is correct.');
    t.end();
  }
}

function removeLastBuildDate(text) {
  var lines = text.split('\n');
  return lines.filter(isNotLastBuildDate).join('\n');
}

function isNotLastBuildDate(line) {
  return line.indexOf('<lastBuildDate>') === -1;
}
