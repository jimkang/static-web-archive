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

You can alternately persist to a GitHub repository instead of the local filesystem, but constructing the object like so:

    var staticWebStream = StaticWebArchive({
      title: 'Vape bot archives',
      footerHTML: `<div>Bottom of page</div>`,
      rootPath: '/usr/share/nginx/html/weblog',
      maxEntriesPerPage: 25,
      fileAbstractionType: 'GitHubFile',
      config: {
        gitRepoOwner: 'jimkang',
        gitToken: 'Your GitHub token',
        repo: 'the-archive-repo'
      }
    })

Tests
-----

Run tests with `make test`.

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
