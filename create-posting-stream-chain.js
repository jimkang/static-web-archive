var through2 = require('through2');
var BufferToPersistence = require('./transforms/buffer-to-persistence');
var AddHTMLFragment = require('./transforms/add-html-fragment');
var AddCellsToPagesPersistent = require('./transforms/add-cells-to-pages-persistent');
var UpdateIndexHTMLPersistent = require('./transforms/update-index-html-persistent');
var AddSinglePagePersistent = require('./transforms/add-single-page-persistent');
var FSFile = require('./file-abstractions/fs-file');
var LocalGit = require('./file-abstractions/local-git');
var defaults = require('lodash.defaults');
var UpdateRSSPersistent = require('./transforms/update-rss-persistent');
var compact = require('lodash.compact');

function createPostingStreamChain({
  config,
  title = 'A Static Web Archive',
  homeLink,
  footerHTML = '',
  headerExtraHTML = '',
  headExtraHTML = '',
  indexOnlyExtraHTML = '',
  maxEntriesPerPage,
  fileAbstractionType = 'fs',
  rootPath,
  generateRSS = true,
  rssFeedOpts = {},
  archiveBaseURL = '/',
  skipDelays = true,
  modSingleEntryPageFragmentFn,
  modIndexPageFragmentFn,
  mediaDir,
  metaDir,
}) {
  var baseOpts = {
    mediaDir: mediaDir || 'media',
    metaDir: metaDir || 'meta',
    skipDelays,
  };
  let fileAbstraction;
  if (fileAbstractionType === 'LocalGit') {
    fileAbstraction = LocalGit({ rootPath });
  } else {
    fileAbstraction = FSFile({
      rootPath,
    });
  }
  baseOpts.fileAbstraction = fileAbstraction;
  baseOpts.fileAbstractionForText = fileAbstraction;
  baseOpts.fileAbstractionForBuffers = fileAbstraction;

  if (!rssFeedOpts.title) {
    rssFeedOpts.title = title;
  }
  var bufferToPersistence = BufferToPersistence(baseOpts);
  var addCellsToPagesPersistent = AddCellsToPagesPersistent(
    defaults({ maxEntriesPerPage }, baseOpts)
  );
  var updateIndexHTMLPersistent = UpdateIndexHTMLPersistent(
    defaults(
      {
        title,
        footerHTML,
        homeLink,
        headerExtraHTML,
        indexOnlyExtraHTML,
        headExtraHTML,
        modFragmentFn: modIndexPageFragmentFn,
      },
      baseOpts
    )
  );
  var addSinglePagePersistent = AddSinglePagePersistent(
    defaults(
      {
        title,
        footerHTML,
        homeLink,
        headerExtraHTML,
        headExtraHTML,
        modFragmentFn: modSingleEntryPageFragmentFn,
      },
      baseOpts
    )
  );

  var bufferToPersistenceStream = createStreamWithTransform(
    bufferToPersistence,
    logError
  );
  var addHTMLFragmentStream = createStreamWithTransform(
    AddHTMLFragment({ mediaDir }),
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
    updateRSSPersistentStream = createStreamWithTransform(
      UpdateRSSPersistent({
        rssFeedOpts,
        archiveBaseURL,
        fileAbstraction: baseOpts.fileAbstraction,
        delay: rssDelay,
      }),
      logRSSUpdated
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
    ])
  );

  return bufferToPersistenceStream;

  function logRSSUpdated(error) {
    if (error) {
      logError(error);
    } else if (rssFeedOpts.logging !== 'silent') {
      console.log(
        'Updated RSS for',
        config.name,
        'at',
        new Date().toISOString()
      );
    }
  }
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
