var pluck = require('lodash.pluck');

function makeIndexHTMLFromPageSpec({
  mostRecentPageIndex,
  header,
  footer,
  pageSpec,
  modFragmentFn // ({ cell, fragment }) => string
}) {
  var filename = pageSpec.index + '.html';
  if (pageSpec.index === mostRecentPageIndex) {
    filename = 'index.html';
  }

  var sortedCells = pageSpec.cells.sort(compareCellsByDateDesc);
  var cellFragments = pluck(sortedCells, 'htmlFragment');
  if (modFragmentFn) {
    cellFragments = sortedCells.map(modifyFragment);
  }

  return {
    filename,
    content: header + '\n' + cellFragments.join('\n') + '\n' + footer + '\n'
  };

  function modifyFragment(cell) {
    return modFragmentFn({ cell, fragment: cell.htmlFragment });
  }
}

function compareCellsByDateDesc(a, b) {
  return new Date(a.date) > new Date(b.date) ? -1 : 1;
}

module.exports = makeIndexHTMLFromPageSpec;
