/* global __dirname, process */

var test = require('tape');
var fs = require('fs');
var StreamTestBed = require('through-stream-testbed');
var config = require('../../config');
var request = require('request');
var FSFile = require('../../file-abstractions/fs-file');
var GitHubFile = require('github-file');
var cloneDeep = require('lodash.clonedeep');
var defaults = require('lodash.defaults');
var encoders = require('../../base-64-encoders');

// This is a transform function that gets a video buffer, given an object containing a video url.
var BufferToPersistence = require('../../transforms/buffer-to-persistence');

const videoBasePath = __dirname + '/../fixtures/videos/';

var cells = [
  {
    id: '849617236574826497',
    caption: 'Tv2',
    date: 'Wed Apr 05 13:38:28 +0000 2017',
    mediaFilename: 'buffer-to-persistence-test.mp4',
    videoBufferInfo: {
      bitrate: 832000,
      content_type: 'video/mp4',
      url:
        'http://jimkang.com/static-web-archive/tests/fixtures/videos/pbDLD37qZWDBGBHW.mp4'
    },
    buffer: fs.readFileSync(videoBasePath + 'pbDLD37qZWDBGBHW.mp4')
  },
  {
    id: '849617052130213888',
    caption: '',
    date: 'Wed Apr 05 13:37:45 +0000 2017',
    mediaFilename: 'DPL17.mp4',
    videoBufferInfo: {
      bitrate: 832000,
      content_type: 'video/mp4',
      url:
        'http://jimkang.com/static-web-archive/tests/fixtures/videos/DPL17ys0-inDTwQW.mp4'
    },
    buffer: fs.readFileSync(videoBasePath + 'DPL17ys0-inDTwQW.mp4')
  },
  {
    id: '12039472034',
    caption: 'No buffer at all.',
    date: 'Wed Apr 06 13:37:45 +0000 2017'
  }
];

var bufferToPersistence;

if (process.env.ABSTRACTION === 'GitHubFile') {
  var gitFileOpts = {
    branch: 'master',
    gitRepoOwner: config.githubTest.gitRepoOwner,
    gitToken: config.githubTest.gitToken,
    repo: config.githubTest.repo,
    request,
    shouldSetUserAgent: true
  };

  var fileAbstractionForBuffers = GitHubFile(
    defaults(cloneDeep(gitFileOpts), {
      encodeInBase64: encoders.encodeInBase64,
      decodeFromBase64: encoders.decodeFromBase64
    })
  );
  var fileAbstractionForText = GitHubFile(
    defaults(cloneDeep(gitFileOpts), {
      encodeInBase64: encoders.encodeTextInBase64,
      decodeFromBase64: encoders.decodeFromBase64ToText
    })
  );

  bufferToPersistence = BufferToPersistence({
    fileAbstractionForBuffers,
    fileAbstractionForText,
    mediaDir: 'video/files',
    metaDir: 'video/meta'
  });
} else {
  var fileAbstraction = FSFile({
    rootPath: `${__dirname}/../file-abstractions/test-root`
  });
  bufferToPersistence = BufferToPersistence({
    fileAbstractionForText: fileAbstraction,
    fileAbstractionForBuffers: fileAbstraction,
    mediaDir: 'video/files',
    metaDir: 'video/meta',
    skipDelays: true
  });
}

test(
  'Test bufferToPersistence',
  StreamTestBed({
    transformFn: bufferToPersistence,
    inputItems: cells,
    checkCollectedStreamOutput: checkGitResults,
    checkOutputItem: checkGitResult
  })
);

function checkGitResults(t, resultCells) {
  t.equal(
    resultCells.length,
    cells.length,
    'There is a git result object for each buffer object.'
  );
}

function checkGitResult(t, cell) {
  t.ok(cell.id, 'There is a id.');
  t.equal(typeof cell.caption, 'string', 'There is a caption.');
  t.ok(cell.date, 'There is a date.');
}
