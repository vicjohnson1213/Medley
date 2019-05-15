
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const fs = require('fs').promises;

const menu = require('./menu');

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

const MDEDIT_DIR = path.join(process.env.HOME, '.mdedit');
const NOTES_DIR = path.join(MDEDIT_DIR, 'notes');
const MANIFEST_FILE = path.join(MDEDIT_DIR, 'manifest.json');

let mainWindow;

app.on('ready', createMainWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        title: 'Markdown Editor',
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

    const menuTemplate = menu.createMenuTemplate(app, mainWindow);
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    registerIPC();
    registerShortcuts();
}

function registerShortcuts() {
}

function registerIPC() {
    ipcMain.on('getNotes', (event, args) => {
        getNotes();
    });

    ipcMain.on('loadNote', (event, filePath) => {
        fs.readFile(filePath, 'utf-8')
            .then(content => mainWindow.webContents.send('loadNoteResponse', content))
            .catch((err) => console.error(err));
    });

    ipcMain.on('saveNote', (event, note) => {
        fs.writeFile(note.Path, note.Content);
    });

    ipcMain.on('createNoteRequest', (event, name) => {
        createNote(name);
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
    const manifest = requireUncached(MANIFEST_FILE);
    const notes = manifest.Notes.map(note => {
        return {
            Name: note.Name,
            Path: note.Path,
            Tags: note.Tags
        }
    });

    mainWindow.webContents.send('getNotesResponse', notes);
}

function createNote(name, attempt) {
    attempt = attempt || 0;

    const manifest = requireUncached(MANIFEST_FILE);

    const parts = name.split('/').map(p => p.trim());
    const noteName = parts.pop();
    const tag = parts.join('/');
    const filename = noteName + (attempt > 0 ? ` (${attempt})` : '');
    const fullName = `${filename}.md`;
    const filepath = path.join(NOTES_DIR, fullName);

    const newNote = {
        Name: noteName,
        Path: filepath,
        Tags: tag.length ? [tag] : []
    };

    manifest.Notes.push(newNote);

    fs.writeFile(filepath, '', { flag: 'wx' })
        .then(() => {
            mainWindow.webContents.send('noteCreated', newNote);
            return fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
        }).catch(err => {
            if (err.code === 'EEXIST') {
                return createNote(name, attempt + 1);
            }

            console.error(err);
        });
}

function deleteNote(note) {
    const manifest = requireUncached(MANIFEST_FILE);
    const idx = manifest.Notes.findIndex(n => n.Path === note.Path);
    manifest.Notes.splice(idx, 1);
    fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, ' ', 2))
        .then(() => fs.unlink(note.Path));
}

function addTagToNote(tag, note) {
    const manifest = requireUncached(MANIFEST_FILE);
    const wholeNote = manifest.Notes.find(n => n.Path === note.Path);
    wholeNote.Tags.push(tag);
    fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}

function deleteTagFromNote(tag, note) {
    const manifest = requireUncached(MANIFEST_FILE);
    const wholeNote = manifest.Notes.find(n => n.Path === note.Path);
    const tagIdx = wholeNote.Tags.indexOf(tag);
    wholeNote.Tags.splice(tagIdx, 1);
    fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
}