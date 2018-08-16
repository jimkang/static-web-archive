var git = require('isomorphic-git');
var fs = require('fs-extra');
var to = require('await-to-js').to;
var path = require('path');
var sb = require('standard-bail')();
var defaults = require('lodash.defaults');

function LocalGit({ rootPath, encoding = 'utf8' }) {
  var baseGitOpts = { fs, dir: rootPath };

  return {
    get,
    update
  };

  function get(filePath, done) {
    var fullPath = path.join(rootPath, filePath);
    fs.pathExists(fullPath, sb(decide, done));

    function decide(exists) {
      if (exists) {
        fs.readFile(
          path.join(rootPath, filePath),
          { encoding },
          sb(wrapContent, done)
        );
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
      fs.writeFile(fullPath, content, sb(addToGit, passError));
    }

    async function addToGit() {
      let error;
      [error] = await to(
        git.add(defaults({ filepath: filePath }, baseGitOpts))
      );
      if (error) {
        passError(error);
        return;
      }
      let commitOpts = defaults(
        {
          author: {
            name: 'static-web-archive',
            email: 'static-web-archive@smidgeo.com'
          },
          message: 'An update from static-web-archive.'
        },
        baseGitOpts
      );
      [error] = await to(git.commit(commitOpts));

      if (error) {
        passError(error);
      } else {
        done(null, {});
      }
    }

    function passError(error) {
      done(error, {});
    }
  }
}

module.exports = LocalGit;
