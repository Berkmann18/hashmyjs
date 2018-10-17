'use strict';
/**
 * @description Text related module for HMJ.
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
 * @description Write to a file (while prettifying the content).
 * @param {string} filename File name
 * @param {string[]} data Lines to write to the file
 * @throws {Error} No filename specified
 * @throws {IoError} Writing error
 * @public
 * @example writeToFile('output.txt', ['Lorem ipsum dolore sit amet']);
 */
const writeToFile = (filename, data) => {
  if (!filename) throw new Error(`No filename specified to be written to with data=${data}`);
  filename = ('' + filename).trim();
  fs.writeFile(filename, '', (err) => {
    if (err) throw new Error(`Couldn't write in ${filename}`);
    let writer = fs.createWriteStream(filename, {
      flags: 'a'
    });

    data.forEach((line) => writer.write(`${line}\n`));
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
 * readFilesSync(['input.txt']);
 * @example <caption>... With specific configurations</caption>
 * readFilesSync(['input.json'], {prettify: true}); //logs '- intput.json: sha256-iTyF6rE+vAUIIWrWaC6bWt9NwI/74kpOuk4JZl9zCMM='
 * readFilesSync(['input.csv'], {outputDest: 'output.xt'}); //Writes the above to output.txt
 */
const readFilesSync = (files = process.argv.slice(2, process.argv.length), { prettify = false, outputDest = OUTPUT_DEST } = {}) => {
  let inputs = [],
    res = {},
    fileLines = [];

  const TO_STDOUT = outputDest === 'stdout',
    TO_VAR = outputDest === 'var';

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
    if (TO_STDOUT) out(`${i > 0 ? '\n' : ''}- ${files[i]}: ${data}`);
    else if (!TO_VAR) fileLines.push(`- ${files[i]}: ${data}`);
  }

  if (TO_VAR) {
    let result = [];
    for (let file in res) result.push(res[file]);
    return result;
  } else writeToFile(outputDest, fileLines);
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
        let output = `- STDIN: ${res}`;

        if (outputDest === 'stdout') out(output);
        else if (outputDest !== 'var') writeToFile(outputDest, output.split('\n'));
        resolve(output);
      } else lines.push(line);
    });
  })
};

module.exports = {
  writeAsTxt: writeToFile,
  readTxtFiles: readFilesSync,
  readTxt: readIn
};