'use strict';
/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}.
 * @author Maximilian Berkmann
 * @module hashmyjs
 * @exports {run, scanInput, hash, readIn, readFiles, readFilesSync, prettifyOutput}
 */
/* eslint-env es6, node */

const sjcl = require('sjcl'),
  readline = require('readline'),
  fs = require('fs'),
  clr = require('colors/safe');
const { error, IoError, info, out, dbg } = require('./utils');
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
  try {
    let hashed = sjcl.hash.sha256.hash(data);
    return `sha256-${sjcl.codec.base64.fromBits(hashed)}`;
  } catch (err) {
    error('There was an error in hashing data=', data, '\nThe error is: ', err);
    return err;
  }
};

/**
 * @description Write to a file (while prettifying the content).
 * @param {string} filename File name
 * @param {string[]} data Lines to write to the file
 * @param {string} [outputFormat=OUTPUT_FORMAT] Format of the output
 * @private
 */
const writeToFile = (filename, data, outputFormat = OUTPUT_FORMAT) => {
  if (!filename) throw new Error(`No filename specified to be written to with data=${data}`);
  filename = ('' + filename).trim();
  fs.writeFile(filename, '', (err) => {
    if (err) return IoError('write', err, filename);
    let writer = fs.createWriteStream(filename, {
      flags: 'a'
    });
    data.forEach((line) => writer.write(`${prettifyOutput(line, outputFormat)}\n`));
    info(`Successfully written the result to ${filename}`);
  });
};

/**
 * @description Prettify the ouptut according to the format used or keep it as it is.
 * @param {(string|object)} output Output
 * @param {string} [format=outputFormat] Format of the output (json, csv, ...)
 * @return {string} Prettified output
 * @protected
 */
const prettifyOutput = (output, format = outputFormat) => {
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
 * @throws {Error} Hashing error
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
 * @description Read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @param {string} [outputDest=OUTPUT_DEST] Destination of the output
 * @param {string} [outputFormat=OUTPUT_FORMAT] Format of the output
 * @return {(undefined|string[])} Data or nothing
 * @protected
 * @deprecated
 */
const readFiles = (files = process.argv.slice(2, process.argv.length), { outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  let inputs = [],
    res = [];
  for (let i = 0; i < files.length; ++i) {
    fs.open(files[i], 'r+', (err, fd) => {
      let buf = new Buffer(8192);
      if (err) return IoError('open', err, files[i]);
      fs.read(fd, buf, 0, buf.length, 0, (err, bytes) => {
        if (err) return IoError('read', err, files[i]);
        if (bytes > 0) inputs.push(buf.slice(0, bytes).toString());
      });

      fs.close(fd, (err) => {
        if (err) IoError('close', err, fd);
        let data = handleData(files, inputs, i);
        if (outputDest === 'var') res.push(data);
        else if (outputDest !== 'stdout' && i === files.length - 1) writeToFile(outputDest, data, outputFormat);
        else console.log(data);
      });
    });
  }
  if (outputDest === 'var') return res;
};

/**
 * @description Synchronously read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @param {boolean} [prettify=false] Prettify the output
 * @param {string} [outputDest=OUTPUT_DEST] Destination of the output
 * @param {string} [outputFormat=OUTPUT_FORMAT] Format of the output
 * @return {(undefined|string[]|{...string})} Data or nothing
 * @protected
 */
const readFilesSync = (files = process.argv.slice(2, process.argv.length), { prettify = false, outputDest = OUTPUT_DEST, outputFormat = OUTPUT_FORMAT } = {}) => {
  let inputs = [],
    res = {},
    fileLines = [];

  // dbg(`prettify=${prettify}  outputDest=${outputDest}  outputFormat=${outputFormat}`);

  for (let i = 0; i < files.length; ++i) {
    // dbg('i=' + i + '\nfile=' + files[i]);
    inputs.push(fs.readFileSync(files[i], (err) => {
      if (err) IoError('readSync', err, files[i]);
    }));
    // console.debug('inputs=[' + inputs + ']');

    let data = scanInput(inputs[i], true);

    // console.debug('data=', data);
    // if (outputDest === 'var') {
    res[files[i]] = data;
    // console.debug('res=', res);
    // } /* else if (outputDest !== 'stdout') */
    if (outputDest === 'stdout') {
      if (outputFormat === 'text') out(`${i > 0 ? '\n' : ''}- ${files[i]}\n${data}`);
      else if (outputFormat === 'csv') out(prettify ? `${files[i]}, ${data}` : `${files[i]},${data}`);
    } else if (outputDest !== 'var') fileLines = fileLines.concat([`- ${files[i]}`, data]);

  }

  if (outputDest === 'var') {
    // if (outputFormat === 'csv') res = res[0];
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
    if (outputFormat === 'json') out(prettify ? prettifyOutput(res, 'json') : res);
  } else writeToFile(outputDest, fileLines);
};

/**
 * @description Read user's input from STDIN.
 * @param {boolean} [prettify=false] Prettify the output
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
        // console.debug('Found line=', line);
        if (EOF(line)) {
          res = scanInput(lines, true);
          // console.debug('res=', res);
          let output = null;
          if (outputFormat === 'json' || outputFormat === 'csv') {
            output = (outputFormat === 'json') ? { STDIN: res } : `STDIN,${res}`;
            if (prettify) output = prettifyOutput(output, outputFormat);
          } else if (outputFormat === 'text') output = `- STDIN\n${res}`;
          // console.debug('output=', output);

          if (outputDest === 'stdout') out(output);
          else if (outputDest !== 'var') writeToFile(outputDest, (outputFormat === 'text') ? output.split('\n') : output);
          resolve(output);
        } else lines.push(line);
      });
    })
    .then(x => x /* console.log('Read:', x) */ )
    .catch(err => error('err=' + err));
};

/**
 * @description Start the hasher.
 * @param {string[]} [files=[]] List of files to go through
 * @param {string} [format='text'] Format of the result (text, csv, json)
 * @param {string} [input='any'] Reads either from STDIN or the arguments (any, stdin, args)
 * @param {string} [output='stdout'] Output the resulting hash in STDOUT (stdout) or a file (fileName) or as a returned value (var)
 * @param {boolean} [prettify=false] Prettify the output
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
  readFiles,
  readFilesSync,
  prettifyOutput
}