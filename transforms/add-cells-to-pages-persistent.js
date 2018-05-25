var callNextTick = require('call-next-tick');
var establishLastPageIndex = require('../establish-last-page-index');
var waterfall = require('async-waterfall');
var curry = require('lodash.curry');
var queue = require('d3-queue').queue;
var AddCellsToPages = require('../add-cells-to-pages');

function AddCellsToPagesPersistent({
  metaDir,
  fileAbstraction,
  maxEntriesPerPage,
  skipDelays = false
}) {
  var addCellsToPages = AddCellsToPages({
    maxEntriesPerPage
  });
  const lastPagePath = metaDir + '/last-page.txt';

  return addCellsToPagesPersistent;

  function addCellsToPagesPersistent(cellToAdd, enc, addCellsDone) {
    var lastPageIndex;
    var updatedPagesPackage;

    // TODO: Think about rewriting as stream-like chain.
    waterfall(
      [
        curry(establishLastPageIndex)(fileAbstraction, lastPagePath),
        saveLastPageIndex,
        getLastPage,
        addCells,
        prePageUpdateDelay,
        updatePagesPersistent,
        postPageUpdateDelay,
        updateLastPageIndex,
        postIndexUpdateDelay,
        passResults
      ],
      addCellsDone
    );

    function saveLastPageIndex(theLastPageIndex, done) {
      lastPageIndex = theLastPageIndex;
      callNextTick(done);
    }

    function getLastPage(done) {
      fileAbstraction.get(
        metaDir + '/' + lastPageIndex + '.json',
        decideResult
      );

      function decideResult(error, package) {
        if (error) {
          done(error);
        } else if (package.content) {
          done(null, JSON.parse(package.content));
        } else {
          done(null, []);
        }
      }
    }

    function addCells(lastPageCells, done) {
      updatedPagesPackage = addCellsToPages({
        currentLastPage: { index: lastPageIndex, cells: lastPageCells },
        cellsToAdd: [cellToAdd]
      });
      callNextTick(done);
    }

    function updatePagesPersistent(done) {
      var q = queue(1);
      updatedPagesPackage.updatedPages.forEach(queuePageUpdate);
      q.awaitAll(done);

      function queuePageUpdate(page) {
        q.defer(updatePagePersistent, page);
      }
    }

    function updatePagePersistent(page, done) {
      var filePath = metaDir + '/' + page.index + '.json';

      fileAbstraction.update(
        {
          filePath: filePath,
          content: JSON.stringify(page.cells),
          message: 'static-web-archive posting page cell metadata'
        },
        passAfterDelay
      );

      function passAfterDelay(error, pagePersistentPackage) {
        setTimeout(passPageUpdatePackage, skipDelays ? 0 : 1000);

        function passPageUpdatePackage() {
          done(error, pagePersistentPackage);
        }
      }
    }

    function updateLastPageIndex(pagesPersistentPackages, done) {
      fileAbstraction.update(
        {
          filePath: lastPagePath,
          content: '' + updatedPagesPackage.newLastPageIndex
        },
        done
      );
    }

    function passResults(done) {
      callNextTick(done, null, updatedPagesPackage);
    }
  }

  // Sometimes, a commit does not "take" completely even though the API responds.
  // Then, you can end up getting the SHA for a file just *before* it updates from
  // that last commit. So: wait.
  function postPageUpdateDelay(pagesPersistentPackages, done) {
    setTimeout(
      () => done(null, pagesPersistentPackages),
      skipDelays ? 0 : 2000
    );
  }

  function prePageUpdateDelay(done) {
    setTimeout(done, skipDelays ? 0 : 2000);
  }

  function postIndexUpdateDelay(content, done) {
    setTimeout(done, skipDelays ? 0 : 2000);
  }
}

module.exports = AddCellsToPagesPersistent;
