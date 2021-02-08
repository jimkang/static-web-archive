var sanitizeHtml = require('sanitize-html');

var titleRefRegex = /_TITLE_REF/g;
var footerRegex = /_FOOTER_REF/g;

function getHeader({
  title,
  homeLink = '',
  headerExtraHTML = '',
  indexOnlyExtraHTML = '',
  headExtraHTML = '',
  previewKeyCell,
  previewURL
}) {
  var titleHTML = title;
  if (homeLink) {
    titleHTML = `<a href="${homeLink}">${title}</a>`;
  }

  var previewTags = '';
  if (previewKeyCell) {
    previewTags = getPreviewTags({
      homeLink,
      previewKeyCell,
      title,
      previewURL
    });
  }

  return `<html>
  <head>
    <title>_TITLE_REF</title>
    <link rel="stylesheet" href="app.css"></link>
    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    <meta charset="utf-8">
    ${previewTags}
    ${headExtraHTML}
  </head>
  <body>

  <div class="annotation hidden warning">
  </div>

  <h1>_TITLE_REF</h1>
  ${headerExtraHTML}
  ${indexOnlyExtraHTML}

  <section class="media">
    <ul class="media-list">`.replace(titleRefRegex, titleHTML);
}

function getFooter({ previousIndexHTML, footerHTML }) {
  return `</ul>
  </section>

  <div class="previous-indexes">${previousIndexHTML}</div>

  _FOOTER_REF

  </body>
  </html>`.replace(footerRegex, footerHTML);
}

function getPreviewTags({ homeLink, previewKeyCell, title, previewURL }) {
  var previewInfo = {
    url: previewURL || homeLink + '/' + previewKeyCell.id + '.html',
    title: sanitizeHtml(title, { allowedTags: [] }),
    description: previewKeyCell.altText || previewKeyCell.caption || ''
  };

  previewInfo.description = sanitizeHtml(previewInfo.description, {
    allowedTags: []
  });

  if (previewKeyCell.mediaFilename) {
    const mediaURL = `${homeLink}/media/${previewKeyCell.mediaFilename}`;
    if (previewKeyCell.isVideo) {
      previewInfo.video = mediaURL;
    } else if (previewKeyCell.isAudio) {
      previewInfo.audio = mediaURL;
    } else {
      previewInfo.image = mediaURL;
    }
  }

  var mediaPreviewTag = '';
  if (previewInfo.image) {
    mediaPreviewTag = `<meta property="og:image" content="${previewInfo.image}">`;
  } else if (previewInfo.video) {
    mediaPreviewTag = `<meta property="og:video" content="${previewInfo.video}">`;
  } else if (previewInfo.audio) {
    mediaPreviewTag = `<meta property="og:audio" content="${previewInfo.audio}">`;
  }

  return `<meta property="og:url" content="${previewInfo.url}"/>
    <meta property="og:title" content="${previewInfo.title}"/>
    <meta property="og:description" content="${previewInfo.description}"/>
    <meta property="og:site_name" content="${title}"/>
    ${mediaPreviewTag}`;
}

module.exports = {
  getHeader: getHeader,
  getFooter: getFooter
};
