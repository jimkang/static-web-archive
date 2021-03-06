var callNextTick = require('call-next-tick');
var waterfall = require('async-waterfall');
var queue = require('d3-queue').queue;
var makeIndexHTMLFromPageSpec = require('../make-index-html-from-page-spec');
var template = require('../page-template');

var sb = require('standard-bail')();

function UpdateIndexHTMLPersistent({
  htmlDir,
  title,
  homeLink,
  footerHTML,
  headerExtraHTML,
  indexOnlyExtraHTML,
  headExtraHTML,
  fileAbstraction,
  modFragmentFn // ({ cell, fragment }) => string
}) {
  return updateIndexHTMLPersistent;

  function updateIndexHTMLPersistent(cell, enc, updateDone) {
    var stream = this;
    var htmlPackages = cell.updatedPages.map(makeIndexHTMLFromPage);

    var q = queue(1);
    htmlPackages.forEach(queueHTMLUpdate);
    q.awaitAll(sb(passResults, updateDone));

    function makeIndexHTMLFromPage(page) {
      return makeIndexHTMLFromPageSpec({
        mostRecentPageIndex: cell.newLastPageIndex,
        header: template.getHeader({
          title,
          homeLink,
          headerExtraHTML,
          indexOnlyExtraHTML,
          headExtraHTML,
          previewKeyCell: cell,
          previewURL: homeLink
        }),
        footer: template.getFooter({
          previousIndexHTML: getPreviousIndexHTML(page),
          footerHTML
        }),
        pageSpec: page,
        modFragmentFn
      });
    }

    function queueHTMLUpdate(htmlPackage) {
      q.defer(updateGitWithPackage, htmlPackage);
    }

    function updateGitWithPackage(htmlPackage, done) {
      waterfall([updateFilePersistent, addIndexHTMLToCell], done);

      function updateFilePersistent(done) {
        var filePath = '';
        if (htmlDir) {
          filePath = htmlDir + '/';
        }
        filePath += htmlPackage.filename;

        fileAbstraction.update(
          {
            filePath,
            content: htmlPackage.content,
            message: 'static-web-archive posting updating index HTML'
          },
          done
        );
      }

      function addIndexHTMLToCell(content, done) {
        if (!cell.indexesHTML) {
          cell.indexesHTML = [];
        }
        cell.indexesHTML.push(htmlPackage);
        callNextTick(done);
      }
    }

    function passResults() {
      stream.push(cell);
      updateDone();
    }
  }
}

function getPreviousIndexHTML(page) {
  var previousIndexHTML = '';
  for (var i = page.index; i > 0; --i) {
    let previousIndex = i - 1;
    if (previousIndexHTML.length > 0) {
      previousIndexHTML += ' | \n';
    }
    previousIndexHTML += `<a href="${previousIndex}.html">${previousIndex}</a>`;
  }
  return previousIndexHTML;
}

module.exports = UpdateIndexHTMLPersistent;
