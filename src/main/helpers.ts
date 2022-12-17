import { readFileSync, writeFileSync } from "original-fs";
import { join } from 'path';

const path = join(__dirname, 'static', 'settings.json');
const settingsObj = JSON.parse(readFileSync(path).toString());

function settings(key: string): any {

    const keys = key.split('.');
    let theSetting = settingsObj;

    for (const k of keys) {

        if (false === theSetting.hasOwnProperty(k)) {
            return null;
        }

        theSetting = theSetting[k];
    }

    return theSetting;    
}

function setSettings(key: string, value: any)
{
    recursiveObj(settingsObj, key, value);
    writeFileSync(path, JSON.stringify(settingsObj));
}


function recursiveObj(obj: object, key: string, value: any)
{
    const keys = key.split('.');
    const currentKey = keys[0];

    if (keys.length === 1) {
        obj[currentKey] = value;

    } else {
        obj[currentKey] = recursiveObj(obj[currentKey] ?? {}, key.substring(key.indexOf(".") + 1), value);
    }

    return obj;
}


export { settings, setSettings };