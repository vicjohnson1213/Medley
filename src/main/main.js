const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const url = require('url');

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
    }]);
}