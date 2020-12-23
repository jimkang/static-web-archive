var test = require('tape');
var StreamTestBed = require('through-stream-testbed');
var UpdateIndexHTMLPersistent = require('../../transforms/update-index-html-persistent');
var getFileAbstractforEnv = require('../fixtures/get-file-abstraction-for-env');

const testHeaderExtraHTML = '<div>Hey, this is a weblog.</div>';
const testIndexOnlyHeaderExtraHTML =
  '<div>Hey, this only goes on the index page.</div>';

var cells = [
  {
    newLastPageIndex: 0,
    updatedPages: [
      {
        index: 0,
        cells: [
          {
            id: 'index-cell-a',
            date: '2017-04-18T13:34:01.000Z',
            caption: 'Hey',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:34:01.000Z'></div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/34U_5EzYg4Bvy88n.mp4'></video>\n  <div class='media-caption entry-meta'></div>\n</li>"
          },
          {
            id: 'index-cell-x',
            date: '22017-04-18T13:42:24.000Z',
            caption: 'Yo',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:42:24.000Z'></div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/QBytlk6nvVUhhrT1.mp4'></video>\n  <div class='media-caption entry-meta'>Short protestor</div>\n</li>"
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
            id: 'index-cell-d',
            date: '2017-04-18T21:33:38.000Z',
            caption: 'Hey',
            htmlFragment:
              '<li class="pane">\n  <div class="time-stamp entry-meta"><time datetime="2017-04-18T21:33:38.000Z"></div>\n  <video controls loop="true" preload="metadata" src="../testapp/videos/ik17VrjkklDF-Q19.mp4"></video>\n  <div class="media-caption entry-meta">Christmas in April</div>\n</li>'
          }
        ]
      },
      {
        index: 0,
        cells: [
          {
            id: 'index-cell-c',
            date: '2017-04-18T13:26:20.000Z',
            caption: 'Hey',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:26:20.000Z'></div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/undefined'></video>\n  <div class='media-caption entry-meta'>Not how mashups are made, guy.</div>\n</li>"
          },
          {
            id: 'index-cell-a',
            date: '2017-04-18T13:34:01.000Z',
            caption: 'Hey',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:34:01.000Z'></div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/34U_5EzYg4Bvy88n.mp4'></video>\n  <div class='media-caption entry-meta'></div>\n</li>"
          },
          {
            id: 'index-cell-b',
            date: '2017-04-18T13:42:24.000Z',
            caption: 'Hey',
            htmlFragment:
              "<li class='pane'>\n  <div class='time-stamp entry-meta'><time datetime='2017-04-18T13:42:24.000Z'></div>\n  <video controls loop='true' preload='metadata' src='../testapp/videos/QBytlk6nvVUhhrT1.mp4'></video>\n  <div class='media-caption entry-meta'>Short protestor</div>\n</li>"
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
  headerExtraHTML: testHeaderExtraHTML,
  indexOnlyExtraHTML: testIndexOnlyHeaderExtraHTML,
  fileAbstraction: getFileAbstractforEnv(),
  homeLink: 'https://localhost',
  modFragmentFn({ cell, fragment }) {
    const lastLiPos = fragment.lastIndexOf('</li>');
    return (
      fragment.slice(0, lastLiPos) +
      `<a href="https://smidgeo.com/thing/${cell.id}.html">Extra link on index page</a> </li>`
    );
  }
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
  t.ok(
    resultCell.indexesHTML.every(hasCustomHeader),
    'All index htmls have the custom header.'
  );
  console.log(resultCell.indexesHTML);
}

function hasCustomHeader(s) {
  return s.content.indexOf(testHeaderExtraHTML) !== -1;
}
