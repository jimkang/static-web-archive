var template = require('../page-template');
var sb = require('standard-bail')();

function AddSinglePagePersistent({
  htmlDir,
  title,
  homeLink,
  footerHTML,
  headerExtraHTML,
  headExtraHTML,
  modFragmentFn, // ({ cell, innerFragment }) => string
  fileAbstraction,
  skipDelays = false
}) {
  return addSinglePagePersistent;

  function addSinglePagePersistent(cellToAdd, enc, addCellsDone) {
    var filePath = '';
    if (htmlDir) {
      filePath = htmlDir + '/';
    }

    const filename = cellToAdd.id + '.html';
    filePath += filename;

    var fragmentFromCell = cellToAdd.htmlFragment;
    if (modFragmentFn) {
      fragmentFromCell = modFragmentFn({
        cell: cellToAdd,
        innerFragment: fragmentFromCell
      });
    }

    var html =
      template.getHeader({
        title,
        homeLink,
        headerExtraHTML,
        headExtraHTML,
        previewKeyCell: cellToAdd
      }) +
      '\n' +
      fragmentFromCell +
      '\n' +
      template.getFooter({ previousIndexHTML: '', footerHTML });

    fileAbstraction.update(
      {
        filePath,
        content: html,
        message: 'static-web-archive posting single entry HTML'
      },
      sb(passResultsAfterDelay, addCellsDone)
    );

    function passResultsAfterDelay() {
      setTimeout(passResults, skipDelays ? 0 : 2000);
    }

    function passResults() {
      cellToAdd.postedSingleVideoPage = true;
      addCellsDone(null, cellToAdd);
    }
  }
}

module.exports = AddSinglePagePersistent;
