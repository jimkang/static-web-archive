var test = require('tape');
var StreamTestBed = require('through-stream-testbed');
var AddSinglePagePersistent = require('../../transforms/add-single-page-persistent');
var randomId = require('idmaker').randomId;
var getFileAbstractforEnv = require('../fixtures/get-file-abstraction-for-env');

var cell = {
  id: randomId(8),
  caption: randomId(8),
  htmlFragment: `<div>test fragment ${randomId(8)}</div>`
};

var addSinglePagePersistent = AddSinglePagePersistent({
  htmlDir: 'video',
  title: 'Single page test',
  footerHTML: '<footer>Single page footer</footer>',
  fileAbstraction: getFileAbstractforEnv()
});

test(
  'Test adding single video page to index in git',
  StreamTestBed({
    transformFn: addSinglePagePersistent,
    inputItems: [cell],
    checkCollectedStreamOutput: checkGitResults,
    checkOutputItem: checkGitResult
  })
);

function checkGitResults(t, resultCells) {
  t.equal(resultCells.length, 1, 'There is a git result object for each cell.');
  console.log('Look at the repo to verify the correct updates were committed.');
}

function checkGitResult(t, resultCell) {
  t.ok(resultCell.postedSingleVideoPage, 'postedSingleVideoPage flag is set.');
}
