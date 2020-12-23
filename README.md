static-web-archive
==================

A module that maintains a static web archive that you can add to piece by piece. Handles text, video, and image posts.
(Formerly [static-web-archive-on-git](https://github.com/jimkang/static-web-archive-on-git).

Requires a version of Node that supports ES 6.

Installation
------------

    npm install static-web-archive

Usage
-----

The idea here is that you have a root directory containing your lightweight static weblog, and you have a program that you want to update it programmatically.

So, in your program, you create an instance of this module like so:

    var StaticWebArchive = require('static-web-archive');
    var staticWebStream = StaticWebArchive({
      title: 'Vape bot archives',
      footerHTML: `<div>Bottom of page</div>`,
      headerExtraHTML: '<div>Get ready to see some vaping!</div>',
      headExtraHTML: '<link rel="whatever">https://a.thing</link>',
      rootPath: '/usr/share/nginx/html/weblog',
      maxEntriesPerPage: 25
    })

Then, when the program has a new post, get it into the archive like so:

    staticWebStream.write({
      id: 'my-unique-post-id-a',
      date: new Date().toISOString(),
      mediaFilename: 'smidgeo_headshot.jpg',
      caption: 'Smidgeo!',
      buffer: <The buffer containing the appropriate image>
    });

Or:

    staticWebStream.write({
      id: 'my-unique-post-id-b',
      date: new Date().toISOString(),
      isVideo: true,
      mediaFilename: 'pbDLD37qZWDBGBHW.mp4',
      caption: 'A window.',
      buffer: <The buffer containing the appropriate video>
    });

Then, when you're all done, you close the stream like so:

    staticWebStream.end(handleError);

    function handleError(error) {
      if (error) {
        console.log('Aw dag, there was an error shutting things down!', error);
      }
    }

After the above runs, in the rootDir, there will be:

- An `index.html` that contains the latest n posts. If there are more than n total entries, there will be a `1.html`, a `2.html`, and so forth containing previous entries. The footer of each will link to previous pages.
- HTML files in the root directory for each individual post.
- The HTML files refer to an `app.css`. It's up to you to add that to your web archive repo. [Here's one I use for one of my archives.](https://github.com/jimkang/static-web-archive/blob/master/meta/app.css)
- A `/media/` directory containing the given media files.
- A `/meta` directory containing line-delimited JSON that has the contents of the posts and a `last-page.txt` file that tells this module what the last page is so that it knows which index to update.

You can also look at `tests/integration/post-through-chain-test.js` to get an idea.

The other alternative is the `fileAbstractionType` `LocalGit`. This will make a commit for each file you update. It is far more reliable than `GitHubFile`. The thing you have to do, however, is set up `rootPath` as a git repo. e.g. `git init` etc.

RSS
---

If you want to generate an RSS feed for the lastest page of cells, you can provide the following opts to the constructor:

- `generateRSS`: Set it to true to generate RSS.
- `rssFeedOpts`: Opts to pass to the [rss module](https://github.com/dylang/node-rss#feedoptions) constructor. If you don't set anything here, it'll just set the title to the title of the archive.
- `archiveBaseURL`: This will be used to create links to your archive in the RSS entries.

Modifying entries
-----

If you want to modify the entries that go on a single-entry page (e.g. add extra tags, content, etc.), pass a function in the `modSingleEntryPageFragmentFn' opt that takes a `cell` containing information about the entry and an `innerFragment` that is a string that is the HTML that static-web-archive planned to generate for the entry. Your function should return a string that is the modified entry HTML. e.g.:

    modSingleEntryPageFragmentFn({ cell, innerFragment }) {
      return `${innerFragment}
<a href="https://smidgeo.com/thing/${cell.id}.html">Extra link</a>`;
    }

To modify entries for index pages, provide n `modIndexPageFragmentFn` like this:

    modIndexPageFragmentFn({ cell, fragment }) {
      const lastLiPos = fragment.lastIndexOf('</li>');
      return (
        fragment.slice(0, lastLiPos) +
        `<a href="https://smidgeo.com/thing/${cell.id}.html">Extra link on index page</a> </li>`
      );
    }

Tests
-----

Create a `config.js` file in the project root that looks like this:

    module.exports = {
      rootPath: 'tests/test-archive-root'
    };

Set up a git test directory with `make set-up-test-git-dir`.
Run tests with `make test`.

Development
----

- Please run Prettier (you can use `make prettier`) before each commit.
- Same with `eslint .`.
- Favor callbacks over promises in this repo. If you do use promises, please catch all rejections and bubble them up.

License
-------

The MIT License (MIT)

Copyright (c) 2018 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
