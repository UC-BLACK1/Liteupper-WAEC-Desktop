const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require("electron-updater");
const os = process.platform;
let iconPath = path.join(__dirname, 'icon.png'); // Default for Linux

if (os === 'win32') {
  iconPath = path.join(__dirname, 'icon.ico'); // Windows
} else if (os === 'darwin') {
  iconPath = path.join(__dirname, 'icon.icns'); // macOS
}

let mainWindow;
let splashScreen;

app.on('ready', () => {
  // ✅ Create the splash screen window
  splashScreen = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    icon: iconPath
  });

  splashScreen.loadFile(path.join(app.getAppPath(), 'src/splash.html')); // ✅ Fix path

  // ✅ Create the main window but keep it hidden
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // ✅ Allows loading local files
    }
  });

  mainWindow.loadFile(path.join(app.getAppPath(), 'src/Subjects.html')); // ✅ Fix path

  // ✅ Check for updates
  autoUpdater.checkForUpdatesAndNotify();

  // ✅ Show splash for at least 5 seconds, then show main window
  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      splashScreen.close();
      mainWindow.show();
    }, 5000);
  });
});

// ✅ Auto Update Events (Show Dialog Instead of Console Logs)
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
    message: "Update downloaded. The app will restart to install.",
    buttons: ["Restart Now"]
  }).then(() => {
    autoUpdater.quitAndInstall();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
