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
 * @description JSON specialised {@link processFileData}.
 * @param {{string: string}} data Data to process
 * @param {string} [outputDest=OUTPUT_DEST] Destination of the output
 * @param {boolean} [prettify=false] Prettify the output
 * @returns {undefined|string|Object|Array} Processed JSON result
 */
const processJsonData = (data, outputDest = OUTPUT_DEST, prettify = false) => {
  switch (outputDest) {
  case 'stdout':
    return out(JSON.stringify(data, null, prettify * 2));
  case 'var':
    return jsonHandler(data, prettify);
  default:
    return writeToFile(outputDest, [JSON.stringify(data, null, prettify * 2)]);
  }
};

/**
 * @description Process read files and do something with it (based on the configuration).
 * @param {{string: string}} data Data read from the files
 * @param {Config} obj Configuration
 * @see Config
 * @returns {undefined|string|Object|Array} Processed result
 */
const processFileData = (data, { prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  if (outputFormat === 'json') return processJsonData(data, outputDest, prettify);

  let result = [];
  if (outputFormat === 'csv') {
    for (let file in data) {
      let csv = csvHandler(file, data[file], prettify);
      (outputDest === 'stdout') ? out(csv) : result.push(csv);
    }
  } else {
    for (let file in data) {
      (outputDest === 'stdout') ? out(`- ${file}: ${data[file]}`) : result.push(data[file]);
    }
  }
  return (outputDest === 'var') ? result : writeToFile(outputDest, result);
};

module.exports = readFilesSync;