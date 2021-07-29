var callNextTick = require('call-next-tick');
var getHTMLFragmentFromCell = require('@jimkang/get-html-fragment-from-cell');

function AddHTMLFragment({ mediaDir = 'media' }) {
  return addHTMLFragment;
  // Expected from an incoming cell:
  // id
  // caption
  // optional: isVideo
  // optional: mediaFilename
  function addHTMLFragment(cell, enc, done) {
    cell.htmlFragment = getHTMLFragmentFromCell({ mediaDir }, cell);
    this.push(cell);
    callNextTick(done);
  }
}

module.exports = AddHTMLFragment;
