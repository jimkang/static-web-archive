var sb = require('standard-bail')();
var omit = require('lodash.omit');
var queue = require('d3-queue').queue;

function BufferToPersistence({
  mediaDir,
  metaDir,
  fileAbstractionForText,
  fileAbstractionForBuffers,
  skipDelays = false
}) {
  return bufferToPersistence;

  // Expected in a cell:
  // buffer
  // buffers
  // id
  // mediaFilename
  // mediaFilenames
  // date
  // optional: caption
  // optional: isVideo
  function bufferToPersistence(cell, enc, done) {
    var stream = this;

    var newCell = omit(cell, 'buffer', 'buffers');

    var buffers = [];
    var filenames = [];

    if (cell.buffers) {
      buffers = cell.buffers;
    }
    if (cell.buffer) {
      buffers.push(cell.buffer);
    }

    if (cell.mediaFilenames) {
      filenames = cell.mediaFilenames;
    }
    if (cell.mediaFiles) {
      filenames = cell.mediaFiles.map(mf => mf.filename);
    }
    if (cell.mediaFilename) {
      filenames.push(cell.mediaFilename);
    }

    var bufferGitPayloads = buffers.map((buffer, i) => ({
      filePath: mediaDir + '/' + filenames[i],
      content: buffer,
      message: 'static-web-archive posting media'
    }));

    var metadataGitPayload = {
      filePath: metaDir + '/' + newCell.id + '.json',
      content: JSON.stringify(newCell),
      message: 'static-web-archive posting media metadata'
    };

    // It's really important to make these updates serially so that one doesn't commit
    // between the other's sha-get and commit, thereby changing the branch tip.
    var q = queue(1);
 
    if (buffers && buffers.length > 0) {
      bufferGitPayloads.forEach(bufferGitPayload => q.defer(fileAbstractionForBuffers.update, bufferGitPayload));
      q.defer(wait);
    }

    q.defer(fileAbstractionForText.update, metadataGitPayload);
    q.awaitAll(sb(passPackage, done));

    function passPackage() {
      newCell.postedToPersistence = true;
      stream.push(newCell);
      done();
    }
  }

  function wait(done) {
    setTimeout(done, skipDelays ? 0 : 2000);
  }
}

module.exports = BufferToPersistence;
