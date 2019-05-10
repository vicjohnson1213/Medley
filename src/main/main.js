const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;

let mainWindow;

app.on('ready', createMainWindow);

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Markdown Editor'
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
}

function getNotes() {
    buildTree(path.join(process.env.HOME, '.mdedit'))
            .then((tree) => mainWindow.webContents.send('getNotesResponse', tree));
}

function buildTree(dir) {
    return new Promise((res, rej) => {
        fs.readdir(dir)
            .then(files => Promise.all(files.map(f => path.join(dir, f)).map(buildTreeP)))
            .then(res);
    });
}

function buildTreeP(dir) {
    return new Promise((res, rej) => {
        fs.stat(dir).then(stats => {
            if (stats.isFile()) {
                res({
                    Name: path.basename(dir),
                    Path: dir
                });
            } else if (stats.isDirectory()) {
                fs.readdir(dir).then(files => {
                    const children = files
                        .map(f => path.join(dir, f))
                        .map(f => buildTreeP(f));

                    Promise.all(children).then(resoloved => {
                        res({
                            Name: path.basename(dir),
                            Path: dir,
                            Children: resoloved
                        });
                    });
                });
            }
        });
    });
}

function createMenu() {
    const template = [{
        label: 'File',
        submenu: [
            { label: 'New Note' }
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