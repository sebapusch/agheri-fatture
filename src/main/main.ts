import { app } from 'electron';
import { join } from 'path';
import App from './App';

const appPath = app.getAppPath();
const rendererPort = process.argv[2] ?? 8080;

const settings = {
  configFilePath: join(appPath, 'static', 'settings.json'),
  window: {
    preloadPath: join(appPath, 'preload.js'),
    env: process.env.NODE_ENV === 'development' ? 'dev' : 'prod',
    url: `http://localhost:${rendererPort}`,
    indexFilePath: join(appPath, 'renderer', 'index.html'),
  },
};

const application = new App(settings);

try {
  application.run();
} catch (e) {
  console.log(e);
}

export { application };