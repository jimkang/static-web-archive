/* global __dirname, process */

var test = require('tape');
var createPostingStreamChain = require('../../create-posting-stream-chain');
var config = require('../../config');
var fs = require('fs');
var randomId = require('idmaker').randomId;
require('longjohn');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  }
];

test('Should be able to post to stream and get HTML into git', chainTest);
test('Should be able to update via stream', updateTest);

function chainTest(t) {
  var postingStreamChain = createPostingStreamChain({
    config: config.githubTest,
    fileAbstractionType: process.env.ABSTRACTION || 'fs',
    rootPath: `${__dirname}/../file-abstractions/test-root`,
    generateRSS: true,
    archiveBaseURL: 'https://smidgeo.com/notes/deathmtn',
    headerExtraHTML: '<div>Get ready to read a weblog!</div>'
  });
  postingStreamChain.on('error', logError);
  testPackages.forEach(writeToStream);
  postingStreamChain.end(t.end);

  function writeToStream(package) {
    postingStreamChain.write(package);
  }
}

function updateTest(t) {
  testPackages[0].mediaFilename = 'wily-overhead.png';
  testPackages[0].caption = 'Now it is Wily!';
  testPackages[0].buffer = fs.readFileSync(
    __dirname + '/../fixtures/images/wily-overhead.png'
  );

  testPackages[2].caption = 'Updated text.';

  rl.question(
    'Check initial posts, then type "go" (or anything really) when you are ready to test updating them. Then, check the update to make sure posts are updated in-place.\n',
    continueTest
  );

  function continueTest() {
    rl.close();
    chainTest(t);
  }
}

function logError(error) {
  console.log(error);
}
