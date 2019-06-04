const { lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const _isDirectory = directory => lstatSync(directory).isDirectory();
const isDirectory = ({ directory }) => _isDirectory(directory);

const getDirectories = ({ directory }) =>
    readdirSync(directory)
        .map(name => join(directory, name))
        .filter(_isDirectory);

module.exports = {
    isDirectory,
    getDirectories,
};
