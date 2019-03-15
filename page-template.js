var titleRefRegex = /_TITLE_REF/g;
var footerRegex = /_FOOTER_REF/g;

function getHeader(title, homeLink, headerExtraHTML) {
  var titleHTML = title;
  if (homeLink) {
    titleHTML = `<a href="${homeLink}">${title}</a>`;
  }

  return `<html>
  <head>
    <title>_TITLE_REF</title>
    <link rel="stylesheet" href="app.css"></link>
    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    <meta charset="utf-8">
  </head>
  <body>

  <div class="annotation hidden warning">
  </div>

  <h1>_TITLE_REF</h1>
  ${headerExtraHTML}

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

module.exports = {
  getHeader: getHeader,
  getFooter: getFooter
};
