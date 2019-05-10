const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs').promises;

let mainWindow;

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({ width: 800, height: 600 });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../../dist/index.html'),
        protocol: 'file',
        slashes: true
    }));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    Menu.setApplicationMenu(createMenu());
    mainWindow.webContents.openDevTools();

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
    return Menu.buildFromTemplate([{
        label: 'File',
        submenu: [
            { label: 'New Note' }
        ]
    }, {
        label: 'Reload',
        click: () => {
            console.log('reloading');
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, '../../dist/index.html'),
                protocol: 'file',
                slashes: true
            }));
        }
    }, {
        label: 'Fetch',
        click: () => {
            console.log('fetching');
            getNotes();
        }
    }]);
}