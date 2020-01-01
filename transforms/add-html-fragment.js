var callNextTick = require('call-next-tick');
var getHTMLFragmentFromCell = require('@jimkang/get-html-fragment-from-cell');

// Expected from an incoming cell:
// id
// caption
// optional: isVideo
// optional: mediaFilename
function addHTMLFragment(cell, enc, done) {
  // TODO: Use var for media dir in fragment below.
  cell.htmlFragment = getHTMLFragmentFromCell({ mediaDir: 'media' }, cell);
  this.push(cell);
  callNextTick(done);
}

module.exports = addHTMLFragment;
