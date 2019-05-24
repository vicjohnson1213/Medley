const path = require('path');
const electron = require('electron');

define('HOME', electron.app.getPath('home'));
define('USER_DATA', electron.app.getPath('userData'));
define('MEDLEY_DIR', path.join(module.exports.USER_DATA, 'medley'));
define('NOTES_DIR', path.join(module.exports.MEDLEY_DIR, 'notes'));
define('IMAGES_DIR', path.join(module.exports.MEDLEY_DIR, 'images'));
define('MANIFEST_FILE', path.join(module.exports.MEDLEY_DIR, 'manifest.json'));

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}