/* global process */

var ndjson = require('ndjson');
var through2 = require('through2');
var BufferToPersistence = require('./transforms/buffer-to-persistence');
var addHTMLFragment = require('./transforms/add-html-fragment');
var request = require('request');
var AddCellsToPagesPersistent = require('./transforms/add-cells-to-pages-persistent');
var UpdateIndexHTMLPersistent = require('./transforms/update-index-html-persistent');
var AddSinglePagePersistent = require('./transforms/add-single-page-persistent');
var FSFile = require('./file-abstractions/fs-file');
var LocalGit = require('./file-abstractions/local-git');
var GitHubFile = require('github-file');
var cloneDeep = require('lodash.clonedeep');
var defaults = require('lodash.defaults');
var encoders = require('./base-64-encoders');
var UpdateRSSPersistent = require('./transforms/update-rss-persistent');
var compact = require('lodash.compact');

function createPostingStreamChain({
  config,
  title = 'A Static Web Archive',
  homeLink,
  footerHTML = '',
  maxEntriesPerPage,
  fileAbstractionType = 'fs',
  rootPath,
  generateRSS = true,
  rssFeedOpts = {},
  archiveBaseURL = '/'
}) {
  var baseOpts = {
    mediaDir: 'media',
    metaDir: 'meta',
    skipDelays: fileAbstractionType !== 'GithubFile'
  };

  if (fileAbstractionType === 'GitHubFile') {
    let gitOpts = {
      branch: 'gh-pages',
      gitRepoOwner: config.gitRepoOwner,
      gitToken: config.gitToken,
      repo: config.repo,
      request,
      shouldSetUserAgent: true
    };
    let fileAbstractionForText = GitHubFile(
      defaults(cloneDeep(gitOpts), {
        encodeInBase64: encoders.encodeTextInBase64,
        decodeFromBase64: encoders.decodeFromBase64ToText
      })
    );
    baseOpts.fileAbstraction = fileAbstractionForText;
    baseOpts.fileAbstractionForText = fileAbstractionForText;
    baseOpts.fileAbstractionForBuffers = GitHubFile(
      defaults(cloneDeep(gitOpts), {
        encodeInBase64: encoders.encodeInBase64,
        decodeFromBase64: encoders.decodeFromBase64
      })
    );
  } else {
    let fileAbstraction;
    if (fileAbstractionType === 'LocalGit') {
      fileAbstraction = LocalGit({ rootPath });
    } else {
      fileAbstraction = FSFile({
        rootPath
      });
    }
    baseOpts.fileAbstraction = fileAbstraction;
    baseOpts.fileAbstractionForText = fileAbstraction;
    baseOpts.fileAbstractionForBuffers = fileAbstraction;
  }
  if (!rssFeedOpts.title) {
    rssFeedOpts.title = title;
  }
  var bufferToPersistence = BufferToPersistence(baseOpts);
  var addCellsToPagesPersistent = AddCellsToPagesPersistent(
    defaults({ maxEntriesPerPage }, baseOpts)
  );
  var updateIndexHTMLPersistent = UpdateIndexHTMLPersistent(
    defaults({ title, footerHTML, homeLink }, baseOpts)
  );
  var addSinglePagePersistent = AddSinglePagePersistent(
    defaults({ title, footerHTML, homeLink }, baseOpts)
  );

  var bufferToPersistenceStream = createStreamWithTransform(
    bufferToPersistence,
    logError
  );
  var addHTMLFragmentStream = createStreamWithTransform(
    addHTMLFragment,
    logError
  );
  var updatePagesStream = createStreamWithTransform(
    addCellsToPagesPersistent,
    logError
  );
  var updateIndexHTMLPersistentStream = createStreamWithTransform(
    updateIndexHTMLPersistent,
    logError
  );
  var addSinglePagePersistentStream = createStreamWithTransform(
    addSinglePagePersistent,
    logError
  );

  var updateRSSPersistentStream;

  if (generateRSS) {
    let rssDelay = 0;
    if (fileAbstractionType === 'GitHubFile') {
      // I know it's more complex than this, but the GitHub API
      // kinda sucks.
      rssDelay = 5000;
    }
    updateRSSPersistentStream = createStreamWithTransform(
      UpdateRSSPersistent({
        rssFeedOpts,
        archiveBaseURL,
        fileAbstraction: baseOpts.fileAbstraction,
        delay: rssDelay
      }),
      logError
    );
  }

  pipeEmUp(
    compact([
      bufferToPersistenceStream,
      addHTMLFragmentStream,
      addSinglePagePersistentStream,
      updatePagesStream,
      updateIndexHTMLPersistentStream,
      updateRSSPersistentStream,
      ndjson.stringify(),
      process.stdout
    ])
  );

  return bufferToPersistenceStream;
}

function pipeEmUp(streams) {
  var piped;
  for (var i = 0; i < streams.length; ++i) {
    if (!piped) {
      piped = streams[i];
    } else {
      piped = piped.pipe(streams[i]);
    }
  }
  return piped;
}

function createStreamWithTransform(transform, errorCallback) {
  var stream = through2({ objectMode: true }, transform);
  stream.on('error', errorCallback);
  return stream;
}

function logError(error) {
  console.log(error);
}

module.exports = createPostingStreamChain;
