
import {
  app,
  BrowserWindow,
  session,
} from 'electron';

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  electronApp,
  optimizer,
  is,
} from '@electron-toolkit/utils';

import {
  registerIpcHandlers,
  unregisterIpcHandlers,
} from './ipc';

import {
  setTrustedRenderer,
  clearTrustedRenderer,
} from './ipc/validate-sender';

let mainWindow: BrowserWindow | null = null;

const getRendererUrl = (): string => {
  const developmentUrl = process.env['ELECTRON_RENDERER_URL'];

  if (is.dev && developmentUrl) {
    return new URL(developmentUrl).href;
  }

  return pathToFileURL(
    join(__dirname, '../renderer/index.html'),
  ).href;
};

const createWindow = (): void => {
  if (mainWindow) {
    return;
  }

  const rendererUrl = getRendererUrl();

  const window = new BrowserWindow({
    width: 1000,
    height: 760,

    minWidth: 640,
    minHeight: 560,

    title: 'Smart VPN',
    backgroundColor: '#E8F6FF',

    show: false,
    autoHideMenuBar: true,

    webPreferences: {
      preload: join(
        __dirname,
        '../preload/index.js',
      ),

      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,

      allowRunningInsecureContent: false,
      webviewTag: false,
      devTools: is.dev,
    },
  });

  mainWindow = window;

  setTrustedRenderer(
    window.webContents.id,
    rendererUrl,
  );

  window.once('ready-to-show', () => {
    window.show();
  });

  window.on('closed', () => {
    clearTrustedRenderer();
    mainWindow = null;
  });

  window.webContents.setWindowOpenHandler(() => ({
    action: 'deny',
  }));

  window.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  window.webContents.on('will-frame-navigate', (event) => {
    event.preventDefault();
  });

  window.webContents.on('will-redirect', (event) => {
    event.preventDefault();
  });

  void window.loadURL(rendererUrl);
};

const focusMainWindow = (): void => {
  if (!mainWindow) {
    if (app.isReady()) {
      createWindow();
    }

    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
};

const initializeApplication = async (): Promise<void> => {
  await app.whenReady();

  electronApp.setAppUserModelId(
    'com.smartvpn.desktop',
  );

  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    },
  );

  session.defaultSession.setPermissionCheckHandler(
    () => false,
  );

  if (is.dev) {
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
  }

  registerIpcHandlers();

  createWindow();

  app.on('activate', () => {
    focusMainWindow();
  });
};

const hasSingleInstanceLock =
  app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    focusMainWindow();
  });

  void initializeApplication();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  unregisterIpcHandlers();
  clearTrustedRenderer();
});
