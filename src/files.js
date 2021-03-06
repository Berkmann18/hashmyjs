'use strict';
/**
 * @description File reader
 * @module
 */
/* eslint-env es6, node */

const fs = require('fs'),
  { out, error } = require('nclr');
const { OUTPUT_DEST, OUTPUT_FORMAT, scanInput, csvHandler, jsonHandler, writeToFile } = require('./core');

/**
 * @description Read files and scan them.
 * @param {string[]} [files] Array of file paths
 * @param {Config} obj Configuration
 * @see Config
 * @return {Promise<(undefined|string[]|{...string})>} Data or nothing
 * @public
 * @example <caption>Reading from the CLI</caption>
 * readFiles();
 * @example <caption>Reading from specific files</caption>
 * readFiles(['output.txt']);
 * @example <caption>... With specific configurations</caption>
 * readFiles(['input.json'], {prettify: true, outputFormat: 'json'}); //logs {<br>  "output.json": "sha256-iTyF6rE+vAUIIWrWaC6bWt9NwI/74kpOuk4JZl9zCMM="<br>}
 * readFiles(['input.csv'], {outputDest: 'output.json', outputFormat: 'json'}); //Writes the above to output.json
 */
const readFiles = (
  files = process.argv.slice(2, process.argv.length),
  {
    prettify = false,
    outputDest = OUTPUT_DEST,
    outputFormat = OUTPUT_FORMAT
  } = {}
) => {
  let inputs = [],
    res = {};

  return new Promise((resolve, reject) => {
    for (let i = 0, len = files.length; i < len; ++i) {
      try {
        inputs.push(fs.readFileSync(files[i]));
      } catch (err) {
        error(`File "${files[i]}" Not Found!`);
        reject(err);
      }

      res[files[i]] = scanInput(inputs[i], true);
    }

    resolve(processFileData(res, { prettify, outputDest, outputFormat }));
  });

};

/**
 * @description JSON specialised {@link processFileData}.
 * @param {{string: string}} data Data to process
 * @param {{string, boolean}} [config={outputDest=OUTPUT_DEST, prettify=false}] Configuration with output destination
 * and whether or not it prettifies the output
 * @returns {boolean|(string|Object|Array)|Promise} Processed JSON result
 */
const processJsonData = (data, { outputDest = OUTPUT_DEST, prettify = false } = {}) => {
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
 * @returns {Promise<undefined|string|Object|Array>} Processed result
 */
const processFileData = (data, { prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  return new Promise((resolve) => {
    if (outputFormat === 'json') {
      resolve(processJsonData(data, { outputDest, prettify }));
      return; //Only here because it doesn't stop here
    }
    let result = [];
    const TO_STDOUT = outputDest === 'stdout';

    if (outputFormat === 'csv') {
      for (let file in data) {
        let csv = csvHandler(file, data[file], prettify);
        TO_STDOUT ? out(csv) : result.push(csv);
      }
    } else {
      for (let file in data) {
        TO_STDOUT ? out(`- ${file}: ${data[file]}`) : result.push(data[file]);
      }
    }
    if (TO_STDOUT) resolve();
    resolve((outputDest === 'var') ? result : writeToFile(outputDest, result));
  });
};

module.exports = readFiles;
