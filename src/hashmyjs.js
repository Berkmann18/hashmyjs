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

/**
 * @description Default output destination.
 * @summary stdout
 * @constant
 * @type {string}
 */
const OUTPUT_DEST = 'stdout';

/**
 * @description Default output format.
 * @summary text  
 * @constant
 * @type {string}
 */
const OUTPUT_FORMAT = 'text';

/**
 * @description Decides whether the program will use the file in the argument or STDIN.
 * @return {boolean} true if argument or false for STDIN
 * @private
 */
const argOrIn = () => process.argv.length > 2;

/**
 * @description Generate a base64-encoded SHA-256 hash for a given data.<br>
 * <em>Objects can be passed to this function but will generate the <strong>same</strong> hash regardless
 * of its content</em>.
 * @param {(string|number|Array|Date)} data Data to encode
 * @return {string} Base64 encoded SHA-256 hash
 * @public
 * @example hash('Lorem Ipsum dolore sit amet'); //returns 'sha256-7almix3trlcKWVAN+fhV/Bzbx4BixTwzjYpZDWUxctM='
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
 * @throws {Error} No filename specified
 * @throws {IoError} Writing error
 * @public
 * @example writeToFile('output.txt', ['Lorem ipsum dolore sit amet']);
 * @example <caption>With a specified format:</caption>
 * writeToFile('output.json', [{key: 'val'}], 'json');
 * writeToFile('output.csv', ['0,john,doe', '1,lorem,ipsum'], 'csv');
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
    info(`Successfully written the result to ${filename}`);
  });
};

/**
 * @description Prettify the ouptut according to the format used or keep it as it is.
 * @param {(string|Object|string[])} output Output
 * @param {string} [format=OUTPUT_FORMAT] Format of the output (json, csv, ...)
 * @return {string} Prettified output
 * @public
 * @example prettifyOutput('some unchanged text'); //returns 'some unchanged text'
 * @example <caption>With a specified format:</caption>
 * prettifyOutput({key: 'val'}, 'json'); //returns {<br>  "key": "val"<br>}
 * prettifyOutput('0,john,doe', 'csv'); //returns '0, joh, doe'
 */
const prettifyOutput = (output, format = OUTPUT_FORMAT) => {
  switch (format) {
  case 'json':
    return JSON.stringify(output, null, 2);
  case 'csv':
    const re = /,(?=[^\s])/g;
    return Array.isArray(output) ? output.map(item => item.replace(re, ', ')) : output.replace(re, ', ');
  default:
    return output;
  }
};

/**
 * @description Scan an input and output it's integrity hash.
 * @param {(string|string[])} input Input to hash (e.g. JS code)
 * @param {boolean} [noOutput=false] Don't output the result to the terminal but return the hash
 * @return {(void|string)} Hashed data or nothing
 * @throws {Error} Hashing or input error
 * @public
 * @example scanInput('Lorem ipsum dolore sit amet'); //logs 'sha256-HBQ/am1i8gw1bl8qJDhm0naAsChqeYsBEiCWTRLEaE8='
 * scanInput(['Lorem ipsum dolore sit amet']); //logs the same as above
 * @example <caption>Without output disabled</caption>
 * scanInput('Lorem ipsum dolore sit amet', true); //returns 'sha256-HBQ/am1i8gw1bl8qJDhm0naAsChqeYsBEiCWTRLEaE8='
 * scanInput(['Lorem ipsum dolore sit amet']); //returns the same as above
 */
const scanInput = (input, noOutput = false) => {
  let data = Array.isArray(input) ? input.join('\n') : input;
  if (!input) throw new Error('scanInput didn\'t received any input');
  let digest = hash(data);
  if (typeof digest !== 'string' && 'message' in digest) throw new Error(digest.message);
  if (noOutput) return digest;
  out(`${digest}`);
};

/**
 * @description Synchronously read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
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
 * readFilesSync(['input.csv'], {outputDest: 'output.json', outputFormat: 'json'}); //logs 
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
      if (outputFormat === 'text') out(`${i > 0 ? '\n' : ''}- ${files[i]}\n${data}`);
      else if (outputFormat === 'csv') out(prettify ? `${files[i]}, ${data}` : `${files[i]},${data}`);
    } else if (outputDest !== 'var') {
      if (outputFormat === 'csv') fileLines.push(prettify ? `${files[i]}, ${data}` : `${files[i]},${data}`);
      else fileLines = fileLines.concat([outputFormat === 'json'? files[i] : `- ${files[i]}`, data]);
    }
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
    if (outputFormat === 'json') out(JSON.stringify(res, null, prettify * 2));
  } else writeToFile(outputDest, (outputFormat === 'json') ? [JSON.stringify(res, null, prettify * 2)] : fileLines);
};

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
  out(`pretty: ${prettify};  dest: ${outputDest};  format: ${outputFormat}`);
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
        let output = `- STDIN\n${res}`; //outputFormat = 'text'
        if (outputFormat === 'json') output = JSON.stringify({STDIN: res}, null, prettify * 2);
        else if (outputFormat === 'csv') output = prettify ? `STDIN, ${res}` : `STDIN,${res}`;

        if (outputDest === 'stdout') out(output);
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
 * @param {string} obj.output Destination for the output (stdout, var, <i>filenames</i>)
 * @param {boolean} obj.prettify Prettify the output
 * @return {(undefined|string[]|string)} Data or nothing
 * @public
 * @example <caption>Reading from files or STDIN</caption>
 * run();
 * @example <caption>Reading from files</caption>
 * run(['index.js']);
 * run(['index.js'], {input: 'args'});
 * @example <caption>Reading from STDIN</caption>
 * run([]);
 * run([], {input: 'stdin'});
 * @example <caption>Reading from files with configurations</caption>
 * run(['index.js', 'index.css'], {format: 'json', output: 'index-hash.json', prettify: true});
 * @example <caption>Reading from STDIN with configurations</caption>
 * run([], {format: 'csv', input: 'stdin', prettify: true});
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
    return (files.length /*|| argOrIn() */) ? readFilesSync(files, opts) : readIn(opts);
  }
};

module.exports = {
  run,
  scanInput,
  hash,
  readIn,
  readFilesSync,
  prettifyOutput,
  writeToFile
}
