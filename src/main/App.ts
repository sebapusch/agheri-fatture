import { app, BrowserWindow, session } from "electron";
import { Sequelize } from "sequelize";
import initSequelize from './sequelize';
import { join } from 'path';
import { Controller } from "./controller/Controller";
import UserController from "./controller/ClientController";
import InvoiceController from "./controller/InvoiceController";

export type AppSettings = {
    configFilePath: string,
    window: {
      preloadPath: string,
      env: string,
      url: string,
      indexFilePath: string,
    },
};

const controllers = [
  UserController,
  InvoiceController,
];

export default class App {

    ready: boolean = false;
    settings: AppSettings;

    electron: Electron.App;
    sequelize?: Sequelize;
    mainWindow?: BrowserWindow;
    controllers: Array<Controller>

    constructor(settings: AppSettings) {
      this.settings = settings;
      this.electron = app;
      this.controllers = [];
    }

    public async run() {
      await this.electron.whenReady();

      const sequelize = await initSequelize();

      this.sequelize = sequelize;
      this.controllers = controllers.map(C => new C(sequelize));
      this.mainWindow = this.createWindow(this.settings.window);

      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': ['script-src \'self\'']
          }
        })
      });

      this.electron.on('window-all-closed', () => {
        this.electron.quit();
      });

      this.ready = true;
    }

    private createWindow(settings: AppSettings['window']) {
        const mainWindow = new BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            preload: settings.preloadPath,
            nodeIntegration: false,
            contextIsolation: true,
          },
        });
        
        if (settings.env === 'dev') {
          
          mainWindow.loadURL(settings.url);
        } else {
          
          mainWindow.loadFile(settings.indexFilePath);
        }

        return mainWindow;
    }
}