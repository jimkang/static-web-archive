var UpdateRSS = require('../update-rss');

// A transform wrapper for UpdateRSS.
function UpdateRSSPersistent({
  fileAbstraction,
  rssFeedOpts,
  archiveBaseURL,
  delay = 0
}) {
  var updateRSS = UpdateRSS({
    rssFeedOpts,
    archiveBaseURL,
    fileAbstraction
  });

  return updateRSSPersistent;

  // The weird thing about this is that this transform does not care about the cell
  // passed to it at all. It's going to pass it through, but it's going to do its
  // RSS-updating thing based on the cells in the persistent last page.
  // This is another point in favor of refactoring to not use the stream model.
  function updateRSSPersistent(cell, enc, updateDone) {
    setTimeout(() => updateRSS(updateDone), delay);
  }
}

module.exports = UpdateRSSPersistent;
