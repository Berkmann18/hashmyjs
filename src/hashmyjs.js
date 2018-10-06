'use strict';
/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}.
 * @author Maximilian Berkmann
 * @module hashmyjs
 */
/* eslint-env es6, node */

/**
 * Configuration
 * @typedef {Object} Config
 * @property {boolean} [prettify=false] Prettify the output
 * @property {string} [outputDest=OUTPUT_DEST] Output destination (stdout, var, <i>filename</i>)
 * @property {string} [outputFormat=OUTPUT_FORMAT] Output format (text, json, csv)
 */

const sjcl = require('sjcl'),
  readline = require('readline'),
  fs = require('fs'),
  clr = require('colors/safe');
const { IoError, info, out, log } = require('./utils');
clr.setTheme(require('./clr'));

const OUTPUT_DEST = 'stdout',
  OUTPUT_FORMAT = 'text';

/**
 * @description Decides whether the program will use the file in the argument or STDIN.
 * @return {boolean} true if argument or false for STDIN
 * @private
 */
const argOrIn = () => process.argv.length > 2;

/**
 * @description Generate base64-encoded SHA-256 for given string.
 * @param {string} data Data to encode
 * @return {string} Base64 encoded SHA-256 hash
 * @protected
 */
const hash = (data) => {
  let hashed = sjcl.hash.sha256.hash(data);
  return `sha256-${sjcl.codec.base64.fromBits(hashed)}`;
};

/**
 * @description Write to a file (while prettifying the content).
 * @param {string} filename File name
 * @param {string[]} data Lines to write to the file
 * @param {string} [outputFormat=OUTPUT_FORMAT] Format of the output
 * @protected
 * @throws {IoError} Writing error
 */
const writeToFile = (filename, data, outputFormat = OUTPUT_FORMAT) => {
  if (!filename) throw new Error(`No filename specified to be written to with data=${data}`);
  filename = ('' + filename).trim();
  fs.writeFile(filename, '', (err) => {
    if (err) throw new Error(`Couldn't write in ${filename}` /* err.message, err.context */ );
    let writer = fs.createWriteStream(filename, {
      flags: 'a'
    });
    data.forEach((line) => writer.write(`${prettifyOutput(line, outputFormat)}\n`));
    // info(`Successfully written the result to ${filename}`);
  });
};

/**
 * @description Prettify the ouptut according to the format used or keep it as it is.
 * @param {(string|Object)} output Output
 * @param {string} [format=OUTPUT_FORMAT] Format of the output (json, csv, ...)
 * @return {string} Prettified output
 * @protected
 */
const prettifyOutput = (output, format = OUTPUT_FORMAT) => {
  switch (format) {
  case 'json':
    return JSON.stringify(output, null, 2);
  case 'csv':
    return Array.isArray(output) ? output.map(item => item.replace(/(\S+),(\S+)/, '$1, $2')) : output.replace(/(\S+),(\S+)/, '$1, $2');
  default:
    return output;
  }
};

/**
 * @description Scan an input and output it's integrity hash.
 * @param {(string|string[])} input Input to hash (i.e. JS code)
 * @param {boolean} [noOutput=false] Don't output the result to the terminal but return the hash
 * @return {(void|string)} Hashed data or nothing
 * @throws {Error} Hashing or input error
 * @protected
 */
const scanInput = (input, noOutput = false) => {
  let data = (Array.isArray(input)) ? input.join('\n') : input;
  if (!input) throw new Error('scanInput didn\'t received any input');
  let digest = hash(data);
  if (typeof digest !== 'string' && 'message' in digest) throw new Error(digest.message);
  if (noOutput) return digest;
  out(`${digest}`);
};

/**
 * @description Synchronously read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @param {Config} obj Configuration (prettify: boolean, outputDest: string, outputFormat: string).
 * @extend Config
 * @return {(undefined|string[]|{...string})} Data or nothing
 * @protected
 */
const readFilesSync = (files = process.argv.slice(2, process.argv.length), { prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  let inputs = [],
    res = {},
    fileLines = [];

  for (let i = 0; i < files.length; ++i) {
    inputs.push(fs.readFileSync(files[i], (err) => {
      if (err) throw new IoError(err.message);
    }));

    let data = scanInput(inputs[i], true);

    res[files[i]] = data;
    if (outputDest === 'stdout') {
      if (outputFormat === 'text') log(`${i > 0 ? '\n' : ''}- ${files[i]}\n${data}`);
      else if (outputFormat === 'csv') log(prettify ? `${files[i]}, ${data}` : `${files[i]},${data}`);
    } else if (outputDest !== 'var') fileLines = fileLines.concat([`- ${files[i]}`, data]);

  }

  if (outputDest === 'var') {
    if (outputFormat === 'json') return prettify ? prettifyOutput(res, 'json') : res;
    else if (outputFormat === 'csv') {
      let result = [];
      for (let file in res) result.push(prettify ? `${file}, ${res[file]}` : `${file},${res[file]}`);
      return result;
    } else {
      let result = [];
      for (let file in res) result.push(res[file]);
      return result;
    }
  } else if (outputDest === 'stdout') {
    if (outputFormat === 'json') log(prettify ? prettifyOutput(res, 'json') : res);
  } else writeToFile(outputDest, fileLines);
};

/**
 * @description Read user's input from STDIN.
 * @param {Config} obj Configuration (prettify: boolean, outDest: string, outFormat: string).
 * @return {(undefined|string)} Data or nothing
 * @protected
 */
const readIn = ({ prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  info('Press CTRL+D (or CMD+D or using `C` instead of `D`) to stop the STDIN reader\nType either \\$ or \\EOF in an empty line to signal an End-Of-File (this line won\'t be counted)');
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }),
    EOF = (str) => str === '\\$' || str === '\\EOF',
    lines = [];

  let res = null;
  return new Promise((resolve, reject) => {
    rl.on('line', (line) => {
      if (EOF(line)) {
        res = scanInput(lines, true);
        let output = null;
        if (outputFormat === 'json' || outputFormat === 'csv') {
          output = (outputFormat === 'json') ? { STDIN: res } : `STDIN,${res}`;
          if (prettify) output = prettifyOutput(output, outputFormat);
        } else if (outputFormat === 'text') output = `- STDIN\n${res}`;

        if (outputDest === 'stdout') log(output);
        else if (outputDest !== 'var') writeToFile(outputDest, (outputFormat === 'text') ? output.split('\n') : output);
        resolve(output);
      } else lines.push(line);
    });
  })
};

/**
 * @description Start the hasher.
 * @param {string[]} [files=[]] List of files to go through
 * @param {Object} obj Configuration
 * @param {string} obj.format Format of the output (text, json, csv)
 * @param {string} obj.input Location of the input (any, stdin, args)
 * @param {string} obj.output Destination for the output (stdout, var, <i>filename</i>)s
 * @param {boolean} obj.prettify Prettify the output
 * @return {(undefined|string[]|string)} Data or nothing
 * @public
 */
const run = (files = [], { format = 'text', input = 'any', output = 'stdout', prettify = false } = {}) => {
  const opts = {
    prettify,
    outputDest: output,
    outputFormat: format
  };

  switch (input) {
  case 'stdin':
    return readIn(opts);
  case 'args':
    return readFilesSync(files, opts);
  default: //any
    return (files.length || argOrIn()) ? readFilesSync(files, opts) : readIn(opts);
  }
};

module.exports = {
  run,
  scanInput,
  hash,
  readIn,
  // readFiles,
  readFilesSync,
  prettifyOutput,
  writeToFile
}