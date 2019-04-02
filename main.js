'use strict';

const electron = require('electron');

// Modules to control application life and create native browser window
const {app,globalShortcut, BrowserWindow,} = electron;
// require('electron-reload')(__dirname);
// const remote = require('remote')
const url = require('url');
const path = require('path');
const os = require('os')

// console.log(module)
try {
  require('electron-reloader')(module);
} catch (err) {
  console.log(err)
}

const Menu = electron.Menu
const MenuItem = electron.MenuItem

// Keep a global reference of thedsd window object, if you don't, the window will
// be closed automaticallfdfyddsddasdasdds when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  globalShortcut.register('f5', function() {
		console.log('f5 is pressed')
		mainWindow.reload()
	})
	globalShortcut.register('CommandOrControl+R', function() {
		console.log('CommandOrControl+R is pressed')
		mainWindow.reload()
	})
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
});
mainWindow.loadURL(startUrl);

  // and load the index.html of the app.
//   mainWindow.loadURL('http://localhost:3000')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
  BrowserWindow.addDevToolsExtension(
    path.join(os.homedir(), '/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0')
 )
  createWindow();
  const ctxMenu = new Menu();
  ctxMenu.append(new MenuItem({
    label:'Paste',
    role:'paste',
   
  }))

  ctxMenu.append(new MenuItem({
    label:'Copy',
    role:'copy',
   
  }))

  ctxMenu.append(new MenuItem({
    label:'Cut',
    role:'cut',
   
  }))

  mainWindow.webContents.on('context-menu',(e,params)=>{
    // console.log(e)
    ctxMenu.popup(mainWindow,params.x,params.y)
  })
  
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.