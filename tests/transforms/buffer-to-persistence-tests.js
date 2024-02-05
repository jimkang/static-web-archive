/* global __dirname */

var test = require('tape');
var fs = require('fs');
var StreamTestBed = require('through-stream-testbed');
var FSFile = require('../../file-abstractions/fs-file');

// This is a transform function that gets a video buffer, given an object containing a video url.
var BufferToPersistence = require('../../transforms/buffer-to-persistence');

const videoBasePath = __dirname + '/../fixtures/videos/';
const imageBasePath = __dirname + '/../fixtures/images/';

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
  },
  {
    id: '849617052130213889',
    caption: '',
    date: 'Wed Apr 05 13:37:45 +0000 2017',
    mediaFilenames: ['DPL17.mp4', 'wily-overhead.png'],
    buffers: [fs.readFileSync(videoBasePath + 'DPL17ys0-inDTwQW.mp4'), fs.readFileSync(imageBasePath + 'wily-overhead.png')]
  },
  {
    id: '849617052130213890',
    caption: 'Two media files',
    date: 'Wed Apr 05 13:37:45 +0000 2017',
    mediaFiles: [{ filename: 'coffee.mp4', mimeType: 'video/mp4' }, { filename: 'wily.png', mimeType: 'image/png'}],
    buffers: [fs.readFileSync(videoBasePath + 'DPL17ys0-inDTwQW.mp4'), fs.readFileSync(imageBasePath + 'wily-overhead.png')]
  },
];

// TODO: Check for files under file-abstractions dir.

var bufferToPersistence;
var fileAbstraction = FSFile({
  rootPath: `${__dirname}/../file-abstractions/test-root`
});
bufferToPersistence = BufferToPersistence({
  fileAbstractionForText: fileAbstraction,
  fileAbstractionForBuffers: fileAbstraction,
  mediaDir: 'video/files',
  metaDir: 'video/meta'
});

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
