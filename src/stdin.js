'use strict';
/**
 * @description STDIN reader.
 * @module
 */
/* eslint-env es6, node */

const readline = require('readline'),
  clr = require('colors/safe');
const {OUTPUT_DEST, OUTPUT_FORMAT, scanInput, csvHandler, jsonHandler, writeToFile } = require('./core'),
  {info, out, EOF } = require('./utils');

clr.setTheme(require('./clr'));

/**
 * @description Read user's input from STDIN.
 * @param {Config} obj Configuration.
 * @return {(undefined|string)} Data or nothing
 * @see Config
 * @public
 * @example readIn();
 * @example <caption>With configurations</caption>
 * readIn({outputFormat: 'json'});
 * readIn({prettify: true, outputDest: 'outputFromSTDIN.txt'});
 */
const readIn = ({ prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
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
        let output = `- STDIN: ${res}`; //outputFormat = 'text'
        if (outputFormat === 'json') {
          const op = {STDIN: res};
          output = (outputDest === 'var') ? jsonHandler(op, prettify) : JSON.stringify(op, null, prettify * 2);
        } else if (outputFormat === 'csv') output = csvHandler('STDIN', res, prettify);

        if (outputDest === 'stdout') out(output);
        else if (outputDest !== 'var') {
          writeToFile(outputDest, (outputFormat === 'text') ?
            output.split('\n') :output);
        } resolve(output);
      } else lines.push(line);
    });
  })
};

module.exports = readIn;