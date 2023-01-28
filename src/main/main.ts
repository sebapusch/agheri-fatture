import { app } from 'electron';
import { join } from 'path';
const isDev = process.env.NODE_ENV === 'development';

const appPath = app.getAppPath();
const rendererPort = process.argv[2] ?? 8080;
const resourcePath = join(appPath, '..', 'resources');
const staticPath = join(appPath, 'static');
const preloadPath = isDev
  ? join(appPath, 'preload.js')
  : join(appPath, 'build', 'main', 'preload.js');

import App from './App';

const settings = {
  configFilePath: join(resourcePath, 'settings.json'),
  databasePath: join(resourcePath, 'agheri.sqlite'),
  window: {
    preloadPath,
    env: isDev ? 'dev' : 'prod',
    url: `http://localhost:${rendererPort}`,
    indexFilePath: join(appPath, 'renderer', 'index.html'),
  },
};

const application = new App(settings);

application.run();

export { application, resourcePath, staticPath };