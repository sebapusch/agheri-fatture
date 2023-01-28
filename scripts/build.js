const Path = require('path');
const Chalk = require('chalk');
const Vite = require('vite');
const FileSystem = require('fs');
const compileTs = require('./private/tsc');

function buildRenderer() {
    return Vite.build({
        configFile: Path.join(__dirname, '..', 'vite.config.js'),
        base: './',
        mode: 'production'
    });
}

function buildMain() {
    const mainPath = Path.join(__dirname, '..', 'src', 'main');
    return compileTs(mainPath);
}

function copyIcon() {
    FileSystem.cp(
      Path.join(__dirname, '..', 'icon.png'),
      Path.join(__dirname, '..', 'build', 'icon.png'),
      () => {},
    );
}

FileSystem.rmSync(Path.join(__dirname, '..', 'build'), {
    recursive: true,
    force: true,
})

console.log(Chalk.blueBright('Transpiling renderer & main...'));

copyIcon();
Promise.allSettled([
    buildRenderer(),
    buildMain(),
]).then(() => {
    console.log(Chalk.greenBright('Renderer & main successfully transpiled! (ready to be built with electron-builder)'));
});
