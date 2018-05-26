var sb = require('standard-bail')();
var omit = require('lodash.omit');
var queue = require('d3-queue').queue;
var callNextTick = require('call-next-tick');

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
  // id
  // mediaFilename
  // date
  // optional: caption
  // optional: isVideo
  function bufferToPersistence(cell, enc, done) {
    var stream = this;

    var newCell = omit(cell, 'buffer');

    if (cell.buffer) {
      var bufferGitPayload = {
        filePath: mediaDir + '/' + newCell.mediaFilename,
        content: cell.buffer,
        message: 'static-web-archive posting media'
      };

      var metadataGitPayload = {
        filePath: metaDir + '/' + newCell.id + '.json',
        content: JSON.stringify(newCell),
        message: 'static-web-archive posting media metadata'
      };

      // It's really important to make these updates serially so that one doesn't commit
      // between the other's sha-get and commit, thereby changing the branch tip.
      var q = queue(1);
      q.defer(fileAbstractionForBuffers.update, bufferGitPayload);
      q.defer(wait);
      q.defer(fileAbstractionForText.update, metadataGitPayload);
      q.awaitAll(sb(passPackage, done));
    } else {
      callNextTick(passPackage);
    }

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
