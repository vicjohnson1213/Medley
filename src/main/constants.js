const os = require('os');
const path = require('path');

define('HOME', os.homedir());
define('MEDLEY_DIR', path.join(module.exports.HOME, '.medley'));
define('NOTES_DIR', path.join(module.exports.MEDLEY_DIR, 'notes'));
define('MANIFEST_FILE', path.join(module.exports.MEDLEY_DIR, 'manifest.json'));

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}