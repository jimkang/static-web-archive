var template = require('../page-template');
var sb = require('standard-bail')();

function AddSinglePagePersistent({
  htmlDir,
  title,
  homeLink,
  footerHTML,
  headerExtraHTML,
  fileAbstraction,
  skipDelays = false
}) {
  return addSinglePagePersistent;

  function addSinglePagePersistent(cellToAdd, enc, addCellsDone) {
    var html =
      template.getHeader(title, homeLink, headerExtraHTML) +
      '\n' +
      cellToAdd.htmlFragment +
      '\n' +
      template.getFooter({ previousIndexHTML: '', footerHTML });

    var filePath = '';
    if (htmlDir) {
      filePath = htmlDir + '/';
    }
    filePath += cellToAdd.id + '.html';

    fileAbstraction.update(
      {
        filePath: filePath,
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
