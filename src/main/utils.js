
const fs = require('fs').promises;

const constants = require('./constants');

module.exports.requireUncached = (module) => {
    delete require.cache[require.resolve(module)];
    return require(module);
}

module.exports.verifySetup = verifySetup;
function verifySetup() {
    return fs.mkdir(constants.MEDLEY_DIR)
        .then(() => Promise.all([verifyManifest(), verifyNotesDir()]))
        .catch(() => Promise.all([verifyManifest(), verifyNotesDir()]))
        .catch(() => {}); 

    function verifyManifest() {
        const manifestTemplate = JSON.stringify(require('./manifest-template'), ' ', 2);
        return fs.writeFile(constants.MANIFEST_FILE, manifestTemplate, { flag: 'wx' });
    }

    function verifyNotesDir() {
        return fs.mkdir(constants.NOTES_DIR);
    }
}
