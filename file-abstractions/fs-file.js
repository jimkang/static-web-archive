var fs = require('fs-extra');
var path = require('path');
var sb = require('standard-bail')();

function FSFile({ rootPath, encoding = 'utf8' }) {
  return {
    get,
    update
  };

  function get(filePath, done) {
    var fullPath = path.join(rootPath, filePath);
    fs.pathExists(fullPath, sb(decide, done));

    function decide(exists) {
      if (exists) {
        fs.readFile(path.join(rootPath, filePath), { encoding }, sb(wrapContent, done));
      } else {
        wrapContent();
      }
    }

    function wrapContent(content) {
      done(null, { content });
    }
  }

  function update({ filePath, content }, done) {
    var fullPath = path.join(rootPath, filePath);
    fs.ensureFile(fullPath, sb(write, done));
    function write() {
      fs.writeFile(fullPath, content, done); 
    }
  }
}

module.exports = FSFile;
