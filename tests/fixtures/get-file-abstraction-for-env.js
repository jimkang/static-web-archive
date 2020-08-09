/* global __dirname, process */

var FSFile = require('../../file-abstractions/fs-file');
var LocalGit = require('../../file-abstractions/local-git');
const defaultRootPath = `${__dirname}/../file-abstractions/test-root`;

function getFileAbstractforEnv(rootPath = defaultRootPath) {
  var fileAbstraction;

  if (process.env.ABSTRACTION === 'LocalGit') {
    fileAbstraction = LocalGit({
      rootPath
    });
  } else {
    fileAbstraction = FSFile({
      rootPath
    });
  }
  return fileAbstraction;
}

module.exports = getFileAbstractforEnv;
