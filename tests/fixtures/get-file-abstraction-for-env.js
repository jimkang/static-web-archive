/* global __dirname, process */

var FSFile = require('../../file-abstractions/fs-file');
var GitHubFile = require('github-file');
var cloneDeep = require('lodash.clonedeep');
var defaults = require('lodash.defaults');
var encoders = require('../../base-64-encoders');
var config = require('../../config');
var request = require('request');
const defaultRootPath = `${__dirname}/../file-abstractions/test-root`;

function getFileAbstractforEnv(rootPath = defaultRootPath) {
  var fileAbstraction;

  if (process.env.ABSTRACTION === 'GitHubFile') {
    let gitFileOpts = {
      branch: 'master',
      gitRepoOwner: config.githubTest.gitRepoOwner,
      gitToken: config.githubTest.gitToken,
      repo: config.githubTest.repo,
      request,
      shouldSetUserAgent: true
    };

    fileAbstraction = GitHubFile(
      defaults(cloneDeep(gitFileOpts), {
        encodeInBase64: encoders.encodeTextInBase64,
        decodeFromBase64: encoders.decodeFromBase64ToText
      })
    );
  } else {
    fileAbstraction = FSFile({
      rootPath
    });
  }
  return fileAbstraction;
}

module.exports = getFileAbstractforEnv;
