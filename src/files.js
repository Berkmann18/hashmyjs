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
 * @param {Config} obj Configuration.
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
    res = {},
    fileLines = [];

  const TO_STDOUT = outputDest === 'stdout',
    TO_VAR = outputDest === 'var',
    AS_CSV = outputFormat === 'csv';

  for (let i = 0, len = files.length; i < len; ++i) {
    try {
      inputs.push(fs.readFileSync(files[i]));
    } catch (err) {
      if (err.code === 'ENOENT') {
        error(`File "${files[i]}" Not Found!`);
        return err.message;
      } else throw err;
    }

    let data = scanInput(inputs[i], true);

    res[files[i]] = data;
    if (TO_STDOUT) {
      if (outputFormat === 'text') out(`${i > 0 ? '\n' : ''}- ${files[i]}: ${data}`);
      else if (AS_CSV) out(csvHandler(files[i], data, prettify));
    } else if (!TO_VAR) {
      if (AS_CSV) fileLines.push(csvHandler(files[i], data, prettify));
      else fileLines.push(`- ${files[i]}: ${data}`);
    }
  }

  if (outputFormat === 'json') return asJson(res, outputDest, prettify);

  if (TO_VAR) {
    let result = [];
    if (AS_CSV) {
      for (let file in res) result.push(csvHandler(file, res[file], prettify));
      return result;
    }
    for (let file in res) result.push(res[file]);
    return result;
  } else writeToFile(outputDest, fileLines);
};

/**
 * Process data from read files that would come out in JSON.
 * @param {Object} res Result from {@link readFilesSync} to process
 * @param {string} [outputDest='stdout'] Destination of the output
 * @returns {Object|string|Array|undefined} JSON data or nothing
 */
const asJson = (res, outputDest = 'stdout', prettify = false) => {
  switch (outputDest) {
    case 'stdout':
      return out(JSON.stringify(res, null, prettify * 2));
    case 'var':
      return jsonHandler(res, prettify);
    default: //file
      return writeToFile(outputDest, [JSON.stringify(res, null, prettify * 2)])
  }
};

module.exports = readFilesSync;