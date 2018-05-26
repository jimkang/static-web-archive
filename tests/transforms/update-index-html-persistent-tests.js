/* global process */
var test = require('tape');
var StreamTestBed = require('through-stream-testbed');
var UpdateIndexHTMLPersistent = require('../../transforms/update-index-html-persistent');
var getFileAbstractforEnv = require('../fixtures/get-file-abstraction-for-env');

var cells = [
  {
    newLastPageIndex: 0,
    updatedPages: [
      {
        index: 0,
        cells: [
          {
            date: '2017-04-18T13:34:01.000Z',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:34:01.000Z'</div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/34U_5EzYg4Bvy88n.mp4'></video>\n  <div class='media-caption entry-meta'></div>\n</li>"
          },
          {
            date: '22017-04-18T13:42:24.000Z',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:42:24.000Z'</div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/QBytlk6nvVUhhrT1.mp4'></video>\n  <div class='media-caption entry-meta'>Short protestor</div>\n</li>"
          }
        ]
      }
    ]
  },

  {
    newLastPageIndex: 1,
    updatedPages: [
      {
        index: 1,
        cells: [
          {
            date: '2017-04-18T21:33:38.000Z',
            htmlFragment:
              '<li class="pane">\n  <div class="time-stamp entry-meta"><time datetime="2017-04-18T21:33:38.000Z"</div>\n  <video controls loop="true" preload="metadata" src="../testapp/videos/ik17VrjkklDF-Q19.mp4"></video>\n  <div class="media-caption entry-meta">Christmas in April</div>\n</li>'
          }
        ]
      },
      {
        index: 0,
        cells: [
          {
            date: '2017-04-18T13:26:20.000Z',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:26:20.000Z'</div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/undefined'></video>\n  <div class='media-caption entry-meta'>Not how mashups are made, guy.</div>\n</li>"
          },
          {
            date: '2017-04-18T13:34:01.000Z',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:34:01.000Z'</div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/34U_5EzYg4Bvy88n.mp4'></video>\n  <div class='media-caption entry-meta'></div>\n</li>"
          },
          {
            date: '2017-04-18T13:42:24.000Z',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:42:24.000Z'</div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/QBytlk6nvVUhhrT1.mp4'></video>\n  <div class='media-caption entry-meta'>Short protestor</div>\n</li>"
          }
        ]
      }
    ]
  }
];

var updateIndexHTMLPersistent = UpdateIndexHTMLPersistent({
  htmlDir: 'video',
  title: 'update-index-html test page',
  footerHTML: '<footer>the bottom</footer>',
  fileAbstraction: getFileAbstractforEnv(),
  skipDelays: process.env.ABSTRACTION !== 'GitHubFile'
});

test(
  'Test creating index pages for cells to index in git',
  StreamTestBed({
    transformFn: updateIndexHTMLPersistent,
    inputItems: cells,
    checkCollectedStreamOutput: checkResults,
    checkOutputItem: checkResult
  })
);

function checkResults(t, resultCells) {
  t.equal(
    resultCells.length,
    cells.length,
    'There is a git result object for each cell.'
  );
  console.log('Look at the repo to verify the correct updates were committed.');
}

function checkResult(t, resultCell) {
  t.ok(resultCell.indexesHTML.length > 0, 'There is at least one index html.');
  console.log(resultCell.indexesHTML);
}
