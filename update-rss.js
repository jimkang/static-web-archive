var waterfall = require('async-waterfall');
var getPageCells = require('./get-page-cells');
var sb = require('standard-bail')();
var RSS = require('rss');

var mediaSrcRegex = / src="media\//g;

// rssFeedOpts are options to be passed through to the RSS module instance.
function UpdateRSS({
  rssDir = 'rss',
  rssFeedOpts,
  rssFilename = 'index.rss',
  archiveBaseURL,
  metaDir = 'meta',
  fileAbstraction
}) {
  const lastPagePath = metaDir + '/last-page.txt';

  return updateRSS;

  function updateRSS(updateRSSDone) {
    waterfall(
      [getLastPageIndex, getLastPage, convertCellsToRSS],
      updateRSSDone
    );

    function getLastPageIndex(done) {
      fileAbstraction.get(lastPagePath, sb(inspectResponse, done));

      function inspectResponse(result) {
        if (!result.content || result.length < 1) {
          let error = new Error(
            'There is no recent page to make RSS entries for.'
          );
          error.name = 'NoRecentPageError';
          done(error);
        } else {
          done(null, parseInt(result.content, 10));
        }
      }
    }

    function getLastPage(pageIndex, done) {
      getPageCells({ pageIndex, metaDir, fileAbstraction }, done);
    }

    function convertCellsToRSS(cells, done) {
      var feed = new RSS(rssFeedOpts);
      cells.forEach(addItem);
      fileAbstraction.update(
        {
          filePath: `${rssDir}/${rssFilename}`,
          content: feed.xml({ indent: true })
        },
        done
      );

      function addItem(cell) {
        var item = {
          description: cell.htmlFragment.replace(
            mediaSrcRegex,
            ` src="${archiveBaseURL}/media/`
          ),
          url: `${archiveBaseURL}/${cell.id}.html`,
          guid: cell.id,
          date: cell.date
        };
        feed.item(item);
      }
    }
  }
}

module.exports = UpdateRSS;
