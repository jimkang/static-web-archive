function getPageCells({ pageIndex, metaDir, fileAbstraction }, done) {
  fileAbstraction.get(`${metaDir}/${pageIndex}.json`, decideResult);

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

module.exports = getPageCells;
