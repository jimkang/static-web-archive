var sb = require('standard-bail')();

function establishLastPageIndex(
  fileAbstraction,
  indexFileLocation,
  establishDone
) {
  fileAbstraction.get(indexFileLocation, sb(inspectResponse, establishDone));

  function inspectResponse(result) {
    if (!result.content || result.length < 1) {
      // It doesn't exist, so create it.
      fileAbstraction.update(
        {
          filePath: indexFileLocation,
          content: '0',
          message: 'static-web-archive posting last page index'
        },
        sb(passZero, establishDone)
      );
    } else {
      establishDone(null, parseInt(result.content, 10));
    }
  }

  function passZero() {
    establishDone(null, 0);
  }
}

module.exports = establishLastPageIndex;
