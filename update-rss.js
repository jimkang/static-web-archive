var waterfall = require('async-waterfall');
var getPageCells = require('./get-page-cells');
var sb = require('standard-bail')();
var RSS = require('rss');

// rssFeedOpts are options to be passed through to the RSS module instance.
function UpdateRSS({
  rssDir = 'rss',
  rssFeedOpts,
  rssFilename = 'index.rss',
  archiveBaseURL,
  metaDir = 'meta',
  mediaDir = 'media',
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
          // There is no most recent page.
          console.error('There is no recent page to make RSS entries for.');
          done();
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
          description: cell.caption,
          url: `${archiveBaseURL}/${cell.id}.html`,
          guid: cell.id,
          date: cell.date
        };
        if (cell.mediaFilename) {
          item.enclosure = {
            url: `${archiveBaseURL}/${mediaDir}/${cell.mediaFilename}`
          };
        }
        feed.item(item);
      }
    }
  }
}

module.exports = UpdateRSS;