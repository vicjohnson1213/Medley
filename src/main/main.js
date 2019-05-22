
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;
const { autoUpdater } = require("electron-updater");

const menu = require('./menu');
const noteSvc = require('./note-service');
const utils = require('./utils');

let mainWindow;

app.on('ready', () => {
    console.log(app.getVersion());
    autoUpdater.checkForUpdatesAndNotify();
    utils.verifySetup().then(createMainWindow);
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
}

function registerIPC() {
    noteSvc.batchImportComplete.on('complete', () => getNotes());

    ipcMain.on('getNotes', () => {
        noteSvc.getNotes()
            .then(notes => mainWindow.webContents.send('getNotesResponse', notes));
    });

    ipcMain.on('loadNote', (event, note) => {
        noteSvc.loadNote(note)
            .then(content => mainWindow.webContents.send('loadNoteResponse', content))
            .catch(() => mainWindow.webContents.send('errorLoadingNote'));
    });

    ipcMain.on('saveNote', (event, note) => {
        noteSvc.saveNote(note);
    });

    ipcMain.on('createNoteRequest', (event, name) => {
        noteSvc.createNote(name)
            .then((newNote) => mainWindow.webContents.send('noteCreated', newNote))
            .catch(() => mainWindow.webContents.send('errorCreatingNote'));
    });

    ipcMain.on('deleteNoteRequest', (event, note) => {
        noteSvc.deleteNote(note);
    });

    ipcMain.on('addTagToNoteRequest', (event, tag, note) => {
        noteSvc.addTagToNote(tag, note);
    });

    ipcMain.on('deleteTagFromNoteRequest', (event, tag, note) => {
        noteSvc.deleteTagFromNote(tag, note);
    });
}
