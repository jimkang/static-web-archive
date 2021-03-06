/* global __dirname, process */

var test = require('tape');
var createPostingStreamChain = require('../../create-posting-stream-chain');
var config = require('../../test-config');
var fs = require('fs');
var randomId = require('idmaker').randomId;
require('longjohn');

var testPackages = [
  {
    id: 'test-a-' + randomId(4),
    date: new Date().toISOString(),
    mediaFilename: 'smidgeo_headshot.jpg',
    caption: 'Smidgeo!',
    altText: 'A picture of Smidgeo!',
    buffer: fs.readFileSync(
      __dirname + '/../fixtures/images/smidgeo_headshot.jpg'
    )
  },
  {
    id: 'test-b-' + randomId(4),
    date: new Date().toISOString(),
    isVideo: true,
    mediaFilename: 'pbDLD37qZWDBGBHW.mp4',
    caption: 'A window.',
    buffer: fs.readFileSync(
      __dirname + '/../fixtures/videos/pbDLD37qZWDBGBHW.mp4'
    )
  },
  {
    id: 'test-c-' + randomId(4),
    date: new Date().toISOString(),
    caption: 'Just text.'
  },
  {
    id: 'test-d-' + randomId(4),
    date: new Date().toISOString(),
    isAudio: true,
    mediaFilename: 'Minotaur02.ogg',
    caption: 'The Minotaur.',
    buffer: fs.readFileSync(__dirname + '/../fixtures/audio/Minotaur02.ogg')
  }
];

test('Should be able to post to stream and get HTML into git', chainTest);

function chainTest(t) {
  var postingStreamChain = createPostingStreamChain({
    config: config.githubTest,
    fileAbstractionType: process.env.ABSTRACTION || 'fs',
    rootPath: `${__dirname}/../file-abstractions/test-root`,
    generateRSS: true,
    archiveBaseURL: 'https://smidgeo.com/notes/deathmtn',
    headerExtraHTML: '<div>Get ready to read a weblog!</div>',
    homeLink: 'https://localhost',
    modSingleEntryPageFragmentFn({ cell, innerFragment }) {
      return `${innerFragment}
<a href="https://smidgeo.com/thing/${cell.id}.html">Extra link</a>`;
    }
  });
  postingStreamChain.on('error', logError);
  testPackages.forEach(writeToStream);
  postingStreamChain.end(t.end);

  function writeToStream(package) {
    postingStreamChain.write(package);
  }
}

function logError(error) {
  console.log(error);
}
