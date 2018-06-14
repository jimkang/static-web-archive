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
var GitHubFile = require('github-file');
var cloneDeep = require('lodash.clonedeep');
var defaults = require('lodash.defaults');
var encoders = require('./base-64-encoders');

function createPostingStreamChain({
  config,
  title = 'A Static Web Archive',
  footerHTML = '',
  maxEntriesPerPage,
  fileAbstractionType = 'fs',
  rootPath
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
    let fileAbstraction = FSFile({
      rootPath
    });
    baseOpts.fileAbstraction = fileAbstraction;
    baseOpts.fileAbstractionForText = fileAbstraction;
    baseOpts.fileAbstractionForBuffers = fileAbstraction;
  }
  var bufferToPersistence = BufferToPersistence(baseOpts);
  var addCellsToPagesPersistent = AddCellsToPagesPersistent(
    defaults({ maxEntriesPerPage }, baseOpts)
  );
  var updateIndexHTMLPersistent = UpdateIndexHTMLPersistent(
    defaults({ title, footerHTML }, baseOpts)
  );
  var addSinglePagePersistent = AddSinglePagePersistent(
    defaults({ title, footerHTML }, baseOpts)
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

  bufferToPersistenceStream
    .pipe(addHTMLFragmentStream)
    .pipe(addSinglePagePersistentStream)
    .pipe(updatePagesStream)
    .pipe(updateIndexHTMLPersistentStream)
    .pipe(ndjson.stringify())
    .pipe(process.stdout);

  // function updateIndexHTML(updatedPagesInfo) {
  //   console.log('updatedPagesInfo', JSON.stringify(updatedPagesInfo, null, 2));
  // }

  return bufferToPersistenceStream;
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
