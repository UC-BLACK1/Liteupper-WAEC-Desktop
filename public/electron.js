const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require("electron-updater");

const os = process.platform;
let iconPath = path.resolve(__dirname, 'assets', 'icon.png'); // Default for Linux

if (os === 'win32') {
  iconPath = path.resolve(__dirname, 'assets', 'icon.ico'); // Windows
} else if (os === 'darwin') {
  iconPath = path.resolve(__dirname, 'assets', 'icon.icns'); // macOS
}

let mainWindow;
let splashScreen;

app.whenReady().then(() => {
  // ✅ Create splash screen
  splashScreen = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    icon: iconPath
  });

  splashScreen.loadFile(path.join(app.getAppPath(), 'src/splash.html'));

  // ✅ Create main window (hidden initially)
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false
    }
  });

  mainWindow.loadFile(path.join(app.getAppPath(), 'src/Subjects.html'));

  // ✅ Check for updates
  autoUpdater.checkForUpdatesAndNotify();

  // ✅ Show main window after splash screen
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      splashScreen.close();
      mainWindow.show();
    }, 5000);
  });
});

// ✅ Auto Update Events
autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Available",
    message: "A new update is available. Downloading now...",
    buttons: ["OK"]
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Ready",
    message: "Update downloaded. Restart now to install the update.",
    buttons: ["Restart Now", "Later"]
  }).then((result) => {
    if (result.response === 0) { // "Restart Now" clicked
      autoUpdater.quitAndInstall();
    }
  });
});

// ✅ Handle Update Errors
autoUpdater.on("error", (error) => {
  dialog.showMessageBox({
    type: "error",
    title: "Update Error",
    message: `An error occurred while updating: ${error.message}`,
    buttons: ["OK"]
  });
});

// ✅ Quit app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
