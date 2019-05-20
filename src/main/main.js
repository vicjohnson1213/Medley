
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;
const { autoUpdater } = require("electron-updater");

const menu = require('./menu');
const noteSvc = require('./note-service');
const constants = require('./constants');
const utils = require('./utils');

let mainWindow;

app.on('ready', () => {
    autoUpdater.checkForUpdatesAndNotify();
    verifySetup().then(createMainWindow);
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        title: 'Medley',
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../../dist/index.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    const menuTemplate = menu.createMenuTemplate(app, mainWindow);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    registerIPC();
    noteSvc.batchImportComplete.on('complete', () => getNotes());
}

function registerIPC() {
    ipcMain.on('getNotes', () => {
        getNotes();
    });

    ipcMain.on('loadNote', (event, filePath) => {
        fs.readFile(filePath, 'utf-8')
            .then(content => mainWindow.webContents.send('loadNoteResponse', content))
            .catch((err) => console.error(err));
    });

    ipcMain.on('saveNote', (event, note) => {
        noteSvc.saveNote(note);
    });

    ipcMain.on('createNoteRequest', (event, name) => {
        noteSvc.createNote(name)
            .then((newNote) => mainWindow.webContents.send('noteCreated', newNote));
    });

    ipcMain.on('deleteNoteRequest', (event, note) => {
        deleteNote(note);
    });

    ipcMain.on('addTagToNoteRequest', (event, tag, note) => {
        addTagToNote(tag, note);
    });

    ipcMain.on('deleteTagFromNoteRequest', (event, tag, note) => {
        deleteTagFromNote(tag, note);
    });
}

function getNotes() {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const notes = manifest.Notes.map(note => {
        return {
            Name: note.Name,
            Path: note.Path,
            Tags: note.Tags
        }
    });

    mainWindow.webContents.send('getNotesResponse', notes);
}


function deleteNote(note) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const idx = manifest.Notes.findIndex(n => n.Path === note.Path);
    manifest.Notes.splice(idx, 1);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2))
        .then(() => fs.unlink(note.Path));
}

function addTagToNote(tag, note) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const wholeNote = manifest.Notes.find(n => n.Path === note.Path);
    wholeNote.Tags.push(tag);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}

function deleteTagFromNote(tag, note) {
    const manifest = utils.requireUncached(constants.MANIFEST_FILE);
    const wholeNote = manifest.Notes.find(n => n.Path === note.Path);
    const tagIdx = wholeNote.Tags.indexOf(tag);
    wholeNote.Tags.splice(tagIdx, 1);
    fs.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}

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
