
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;

const MDEDIT_DIR = path.join(process.env.HOME, '.mdedit');
const NOTES_DIR = path.join(MDEDIT_DIR, 'notes');
const MANIFEST_FILE = path.join(MDEDIT_DIR, 'manifest.json');

const utils = require('./utils');

let mainWindow;

app.on('ready', createMainWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
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

    createMenu();
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
        const manifest = require(MANIFEST_FILE);

        const parts = name.split('/');
        const noteName = parts.pop();
        const tag = parts.join('/');
        const fullName = path.extname(noteName) === '.md' ? noteName : `${noteName}.md`;
        const filepath = path.join(NOTES_DIR, fullName);
        
        manifest.Notes.push({
            Name: noteName,
            Path: filepath,
            Tags: [tag]
        });

        fs.writeFile(filepath, `# ${noteName}`, { flag: 'wx'})
            .then(() => {
                mainWindow.webContents.send('noteCreated', {
                    Name: noteName,
                    Path: filepath,
                    Tags: [tag]
                });

                return fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, ' ', 2));
            });
    });
}

function getNotes() {
    const manifest = require(MANIFEST_FILE);
    const notes = manifest.Notes.map(note => {
        return {
            Name: path.basename(note.Path, '.md'),
            Path: note.Path,
            Tags: note.Tags
        }
    });

    mainWindow.webContents.send('getNotesResponse', notes);
}

function createMenu() {
    const template = [{
        label: 'File',
        submenu: [
            {
                label: 'New Note',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    mainWindow.webContents.send('createNoteRequest');
                }
            }
        ]
    }, {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'delete' },
            { role: 'selectall' }
        ]
    }, {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click:  (item, focusedWindow) => {
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, '../../dist/index.html'),
                        protocol: 'file',
                        slashes: true
                    }));
                }
            }, {
                type: 'separator'
            }, { 
                role: 'resetzoom'
            }, { 
                role: 'zoomin'
            }, { 
                role: 'zoomout'
            }, { 
                type: 'separator'
            }, { 
                role: 'togglefullscreen'
            }
        ]
    }, {
        role: 'window',
        submenu: [
            {
                role: 'minimize'
            }, {
                role: 'close'
            }
        ]
    }, {
        label: 'Dev',
        submenu: [{
            label: 'Reload UI',
            click: () => {
                console.log('reloading');
                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, '../../dist/index.html'),
                    protocol: 'file',
                    slashes: true
                }));
            }
        }, {
            label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click: (item, focusedWindow) => {
                if (focusedWindow) {
                    focusedWindow.webContents.toggleDevTools();
                }
            }
        }]
    }, {
      role: 'help',
      submenu: [
        {
            label: 'Learn More',
            click: () => { shell.openExternal('http://electron.atom.io') }
        }
      ]
    }];

    if (process.platform === 'darwin') {
        const name = app.getName();
        template.unshift({
            label: name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ]
        });

        template[4].submenu = [
            {
              label: 'Close',
              accelerator: 'CmdOrCtrl+W',
              role: 'close'
            }, {
              label: 'Minimize',
              accelerator: 'CmdOrCtrl+M',
              role: 'minimize'
            }, {
              label: 'Zoom',
              role: 'zoom'
            }, {
              type: 'separator'
            }, {
              label: 'Bring All to Front',
              role: 'front'
            }
        ];
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}