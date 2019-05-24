const fs = require('fs');

const constants = require('./constants');

module.exports.requireUncached = (module) => {
    delete require.cache[require.resolve(module)];
    return require(module);
}

module.exports.verifySetup = verifySetup;
function verifySetup() {
    return new Promise((resolve) => {
        fs.mkdir(constants.MEDLEY_DIR, () => {
            verifyAll().then(resolve);
        });
    });
    

    function verifyAll() {
        return Promise.all([
            verifyManifest(),
            verifySettings(),
            verifyNotesDir(),
            verifyImagesDir()
        ]);
    }

    function verifyManifest() {
        return new Promise(resolve => {
            const manifestTemplate = JSON.stringify(require('./templates/manifest-template'), ' ', 2);
            fs.writeFile(constants.MANIFEST_FILE, manifestTemplate, { flag: 'wx' }, (err) => {
                resolve();
            });
        })
    }

    function verifySettings() {
        return new Promise(resolve => {
            const settingsTemplate = JSON.stringify(require('./templates/settings.template'), ' ', 2);
            fs.writeFile(constants.SETTINGS_FILE, settingsTemplate, { flag: 'wx' }, (err) => {
                resolve();
            });
        });
    }

    function verifyNotesDir() {
        return new Promise(resolve => {
            fs.mkdir(constants.NOTES_DIR, () => {
                resolve();
            });
        });
    }

    function verifyImagesDir() {
        return new Promise(resolve => {
            fs.mkdir(constants.IMAGES_DIR, () => {
                resolve();
            });
        });
    }
}
