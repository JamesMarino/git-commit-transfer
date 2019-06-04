const { lstatSync, readdirSync, existsSync, renameSync } = require('fs');
const { join } = require('path');

const _isDirectory = directory => lstatSync(directory).isDirectory();
const isDirectory = ({ directory }) => _isDirectory(directory);

const directoryExists = ({ directory }) => {
    return existsSync(directory);
};

const getDirectories = ({ directory }) =>
    readdirSync(directory)
        .map(name => join(directory, name))
        .filter(_isDirectory);

const renameDirectoryTimestamp = ({ oldDirectory }) => {
    renameSync(oldDirectory, `${oldDirectory}-${Math.round(new Date().getTime() / 1000)}`);
};

module.exports = {
    isDirectory,
    getDirectories,
    directoryExists,
    renameDirectoryTimestamp,
};
