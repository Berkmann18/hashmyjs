'use strict';
/**
 * @description JSON related module for HMJ.
 * @module
 */
/* eslint-env es6, node */

const fs = require('fs'),
  readline = require('readline'),
  clr = require('colors/safe');
const { out, info, IoError, error, EOF } = require('./utils'),
  { scanInput, OUTPUT_DEST } = require('./core');

clr.setTheme(require('./clr'));

/**
 * @description Handle JSON data.
 * @param {Object|string|Array} json JSON data
 * @param {boolean} [prettify=false] Make it pretty
 * @returns {Object|string|Array} (Stringified) JSON data
 */
const jsonHandler = (json, prettify = false) => {
  return prettify ? JSON.stringify(json, null, 2) : json;
};

/**
 * @description Print out a JSON stringified data.
 * @param {*} data Data
 * @param {boolean} prettify Prettify or not
 */
const outJson = (data, prettify = false) => out(JSON.stringify(data, null, prettify * 2));

/**
 * @description Write to a file (while prettifying the content).
 * @param {string} filename File name
 * @param {string[]} data Lines to write to the file
 * @throws {Error} No filename specified
 * @throws {IoError} Writing error
 * @public
 * @example writeToFile('output.json', [{key: 'val'}], 'json');
 */
const writeToFile = (filename, data) => {
  if (!filename) throw new Error(`No filename specified to be written to with data=${data}`);
  filename = ('' + filename).trim();
  fs.writeFile(filename, '', (err) => {
    if (err) throw new IoError(`Couldn't write in ${filename}`);
    let writer = fs.createWriteStream(filename, {
      flags: 'a'
    });

    data.forEach((line) => writer.write(`${JSON.stringify(line, null, 2)}\n`));
    info(`Successfully written the result to ${filename}`);
  });
};

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
 * readFilesSync(['input.json']);
 * @example <caption>... With specific configurations</caption>
 * readFilesSync(['input.json'], {prettify: true}); //logs {<br>  "input.json": "sha256-iTyF6rE+vAUIIWrWaC6bWt9NwI/74kpOuk4JZl9zCMM="<br>}
 * readFilesSync(['input.csv'], {outputDest: 'output.json'}); //Writes the above to output.json
 */
const readFilesSync = (files = process.argv.slice(2, process.argv.length), { prettify = false, outputDest = OUTPUT_DEST } = {}) => {
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

    let data = scanInput(inputs[i], true);

    res[files[i]] = data;
  }

  if (outputDest === 'var') return jsonHandler(res, prettify);
  else if (outputDest === 'stdout') outJson(res, prettify);
  else writeToFile(outputDest, [outJson(res, prettify)]);
};

/**
 * @description Read user's input from STDIN.
 * @param {Config} obj Configuration.
 * @return {(undefined|string)} Data or nothing
 * @see Config
 * @public
 * @example readIn();
 * @example <caption>With configurations</caption>
 * readIn({prettify: true});
 * readIn({prettify: true, outputDest: 'outputFromSTDIN.txt'});
 */
const readIn = ({ prettify = false, outputDest = OUTPUT_DEST } = {}) => {
  info('Press CTRL+D (or CMD+D or using `C` instead of `D`) to stop the STDIN reader\nType either \\$ or \\EOF in an empty line to signal an End-Of-File (this line won\'t be counted)\n');
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }),
    lines = [],
    res = null;

  return new Promise((resolve, reject) => {
    rl.on('line', (line) => {
      if (EOF(line)) {
        try {
          res = scanInput(lines, true);
        } catch (err) {
          reject(err);
        }
        const op = {STDIN: res};
        let output = (outputDest === 'var') ? jsonHandler(op, prettify) : JSON.stringify(op, null, prettify * 2);

        if (outputDest === 'stdout') out(output);
        else if (outputDest !== 'var') writeToFile(outputDest, [output]);
        resolve(output);
      } else lines.push(line);
    });
  })
};

module.exports = {
  jsonHandler,
  outJson,
  writeAsJson: writeToFile,
  readJsonFiles: readFilesSync,
  readJson: readIn
};