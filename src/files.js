'use strict';
/**
 * @description File reader
 * @module
 */
/* eslint-env es6, node */

const fs = require('fs'),
  clr = require('colors/safe');
const {OUTPUT_DEST, OUTPUT_FORMAT, scanInput, csvHandler, jsonHandler, writeToFile } = require('./core'),
  {IoError, out, error } = require('./utils');

clr.setTheme(require('./clr'));

/**
 * @description Synchronously read files and scan them.
 * @param {string[]} [files] Array of file paths
 * @param {Config} obj Configuration
 * @see Config
 * @return {(undefined|string[]|{...string})} Data or nothing
 * @public
 * @example <caption>Reading from the CLI</caption>
 * readFilesSync();
 * @example <caption>Reading from specific files</caption>
 * readFilesSync(['output.txt']);
 * @example <caption>... With specific configurations</caption>
 * readFilesSync(['input.json'], {prettify: true, outputFormat: 'json'}); //logs {<br>  "output.json": "sha256-iTyF6rE+vAUIIWrWaC6bWt9NwI/74kpOuk4JZl9zCMM="<br>}
 * readFilesSync(['input.csv'], {outputDest: 'output.json', outputFormat: 'json'}); //Writes the above to output.json
 */
const readFilesSync = (files = process.argv.slice(2, process.argv.length), { prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  let inputs = [],
    res = {};

  for (let i = 0, len = files.length; i < len; ++i) {
    try {
      inputs.push(fs.readFileSync(files[i]));
    } catch (err) {
      if (err.code === 'ENOENT') {
        error(`File "${files[i]}" Not Found!`);
        return err.message;
      } else throw err;
    }

    res[files[i]] = scanInput(inputs[i], true);
  }

  return processFileData(res, {prettify, outputDest, outputFormat});
};

/**
 * @description Process read files and do something with it (based on the configuration).
 * @param {{string: string}} res Data read from the files
 * @param {Config} obj Configuration
 * @see Config
 * @returns {undefined|string|Object|Array}
 */
const processFileData = (res, { prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  const AS_CSV = outputFormat === 'csv',
    AS_JSON = outputFormat === 'json';

  if (AS_JSON) {
    switch (outputDest) {
    case 'stdout':
      return out(JSON.stringify(res, null, prettify * 2));
    case 'var':
      return jsonHandler(res, prettify);
    default:
      return writeToFile(outputDest, [JSON.stringify(res, null, prettify * 2)]);
    }
  }

  let result = [];
  if (AS_CSV) {
    for (let file in res) {
      let csv = csvHandler(file, res[file], prettify);
      (outputDest === 'stdout') ? out(csv) : result.push(csv);
    }
  } else {
    for (let file in res) {
      (outputDest === 'stdout') ? out(`- ${file}: ${res[file]}`) : result.push(res[file]);
    }
  }
  return (outputDest === 'var') ? result : writeToFile(outputDest, result);
};

module.exports = readFilesSync;