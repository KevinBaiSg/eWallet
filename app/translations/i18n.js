const path = require("path");
const electron = require('electron');
const fs = require('fs');

let loadedLanguage;
const app = electron.app ? electron.app : electron.remote.app;

module.exports = i18n;

// function i18n() {
// 	if(fs.existsSync(path.join(__dirname, `${app.getLocale()}.js`))) {
// 		loadedLanguage = JSON.parse(
// 		  fs.readFileSync(path.join(__dirname, `${app.getLocale()}.js`),
//         'utf8'))
// 	}
// 	else {
// 		// loadedLanguage = JSON.parse(
// 		//   fs.readFileSync(path.join(__dirname, 'en.js'), 'utf8'))
//     loadedLanguage = JSON.parse(
//       fs.readFileSync(path.join(__dirname, 'zh.js'), 'utf8'))
// 	}
// }

function i18n() {
  if(fs.existsSync(path.join(__dirname, 'app.asar', `${app.getLocale()}.js`))) {
    loadedLanguage = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'app.asar', `${app.getLocale()}.js`),
        'utf8'))
  }
  else {
    // loadedLanguage = JSON.parse(
    //   fs.readFileSync(path.join(__dirname, 'en.js'), 'utf8'))
    loadedLanguage = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'app.asar', 'zh.js'), 'utf8'))
  }
}

i18n.prototype.__ = (phrase) => {
	let translation = loadedLanguage[phrase];
  if(translation === undefined) {
    translation = phrase
  }
	return translation
};
