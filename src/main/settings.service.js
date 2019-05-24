const { shell } = require('electron');

const constants = require('./constants');

module.exports.editSettings = editSettings;
function editSettings() {
    shell.openItem(constants.SETTINGS_FILE);
}