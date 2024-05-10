import { app, BrowserWindow, ipcMain, IpcMainEvent, session, WebContents } from "electron";
import { Sequelize } from "sequelize";
import initSequelize from './sequelize';
import { Controller } from "./controller/Controller";
import UserController from "./controller/ClientController";
import InvoiceController from "./controller/InvoiceController";
import { factory } from "electron-json-config";
import Config from "electron-json-config/lib/Config";

export type AppSettings = {
    configFilePath: string,
    databasePath: string,
    window: {
      preloadPath: string,
      env: string,
      url: string,
      indexFilePath: string,
    },
};

export type Billing = {
  name: string,
  bank: string,
  iban: string,
  bic: string,
};

export type AppConfig = {
  progress_num: number,
  chromium_executable: string,
  profile: {
    name: string,
    title: string,
    address: Array<string>,
    piva: string,
    wesite: string,
    billing: Billing,
    billing_ch: Billing,
  }
};

type Response = {
  channel: string,
  success: boolean,
  content: any,
}

const controllers = [
  UserController,
  InvoiceController,
];

export default class App {

    ready: boolean = false;
    settings: AppSettings;

    config: Config;
    electron: Electron.App;
    sequelize!: Sequelize;
    mainWindow!: BrowserWindow;
    controllers: Array<Controller>

    constructor(settings: AppSettings) {
      this.settings = settings;
      this.electron = app;
      this.controllers = [];
      this.config = factory(this.settings.configFilePath);
    }

    public async run() {
      await this.electron.whenReady();

      this.sequelize = await initSequelize(this.settings.databasePath);
      this.controllers = controllers.map(C => new C(this));
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

      await this.registerConfigHandlers();

      this.ready = true;
    }

    public handle(event: string, handler: Function) {

      console.log(event)

      const response: Response = {
        success: true,
        content: null,
        channel: event,
      }

      ipcMain.on(event, async (e: IpcMainEvent, ...args) => {
        try {
          response.content = await handler(...args);
          response.success = true;

          this.respond(e.sender, response);

        } catch (error) {

          console.log(error);

          response.content = error;
          response.success = false;
          this.respond(e.sender, response);
        }
      });

    }

    private respond(sender: WebContents, response: Response)
    {
      sender.send(response.channel, response);
    }

    private createWindow(settings: AppSettings['window']) {
        const mainWindow = new BrowserWindow({
          title: 'Fatture',
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

    private async registerConfigHandlers() {
      this.handle('config.get', (key: string) => this.getConfig(key));
      this.handle('config.getAll', () => this.getAllConfig());
      this.handle('config.save', (config: AppConfig) => this.saveConfig(config));
    }

    private async saveConfig(config: AppConfig): Promise<void> {
      this.config.setBulk(config);
    }

    private async getConfig(key: string): Promise<any> {
      return this.config.get(key);
    }

    private async getAllConfig(): Promise<object> {
      return this.config.all();
    }
}