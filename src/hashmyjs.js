/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}.
 * @author Maximilian Berkmann
 * @module hashmyjs
 * @exports {run, scanInput, hash, readIn, readFiles, readFilesSync}
 */
/* eslint-env es6, node */

const sjcl = require('sjcl'), readline = require('readline'), fs = require('fs'), clr = require('colors/safe');
const DEBUG = process.env.DEBUG === true;
let outputFormat = 'text', outputDest = 'STDOUT', result = {}, fileLines = [];

clr.setTheme(require('./clr'));

/**
 * @description Decides whether the program will use the file in the argument or STDIN.
 * @return {boolean} true if argument or false for STDIN
 * @private
 */
let argOrIn = () => process.argv.length > 2;

/**
 * @description Print an error.
 * @param {...*} data Data to print
 * @private
 */
let _err = (...data) => {
  console.error(clr.err(...data));
  process.exit(1);
};

/**
 * @description Print an information.
 * @param {...*} data Data to print
 * @private
 */
let _inf = (...data) => console.log(clr.inf(...data));

/**
 * @description Print a debug message.
 * @param {...*} data Data to print
 * @private
 */
let _dbg = (...data) => console.log(clr.debug(...data));

/**
 * @description Print an output.
 * @param {...*} data Data to print
 * @private
 */
let _out = (...data) => console.log(clr.out(...data));

/**
 * @description Print an input.
 * @param {...*} data Data to print
 * @private
 */
let _in = (...data) => console.log(clr.in(...data));

/**
 * @description IO error message,
 * @param {string} type IO type (open, read, write, append, ...)
 * @param {Error} err Error
 * @param {string} filename Name of the file affected
 */
let ioError = (type, err, filename) => _err(`IO ${type} error:`, err, `on '${filename}'`);

/**
 * @description Generate base64-encoded SHA-256 for given string.
 * @param {string} data Data oto encode
 * @return {string} Base64 encoded SHA-256 hash
 * @protected
 */
let hash = (data) => {
  if (DEBUG) _dbg(`hash(${data}`);
  try {
    let hashed = sjcl.hash.sha256.hash(data);
    if (DEBUG) _dbg(`  hashed=${hashed}`);
    return `sha256-${sjcl.codec.base64.fromBits(hashed)}`;
  } catch (err) {
    _err('There was an error in hashing data=', data, '\nThe error is: ', err)
  }
};

/**
 * @description Write to a file.
 * @param {string} filename File name
 * @param {string[]} [data=fileLines] Lines to write to the file
 * @private
 */
let writeToFile = (filename, data=fileLines) => {
  fs.writeFile(filename, '', (err) => {
    if (err) return ioError('write', err, filename);
    let writer = fs.createWriteStream(filename, {
      flags: 'a'
    });
    data.forEach((line) => writer.write(`${line}\n`));
    _inf(`Successfully written the result to ${filename}`);
  });

};

/**
 * @description Scan an input and output it's integrity hash.
 * @param {(string|string[])} input Input to hash (i.e. JS code)
 * @param {boolean} [noOutput=false] Don't output the result to the terminal but return the hash
 * @protected
 */
const scanInput = (input, noOutput=false) => {
  let data = (Array.isArray(input)) ? input.join('\n') : input;
  if (!input) _err('scanInput didn\'t received any input');
  if (DEBUG) _dbg(`Data scanned:\n\`\`${data}\`\``);
  let digest = `${hash(data)}`;
  if (noOutput) return digest;
  _out(`${digest}`);
};

/**
 * @description Read user's input from STDIN.
 * @protected
 */
const readIn = () => {
  _inf('Press CTRL+D (or CMD+D or using `C` instead of `D`) to stop the STDIN reader\nType either \\$ or \\EOF in an empty line to signal an End-Of-File (this line won\'t be counted)');
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }), EOF = (str) => {
      return str === '\\$' || str === '\\EOF'
    }, lines = [];

  rl.on('line', (line) => {
    if (EOF(line)) {
      if (DEBUG) _dbg('Lines:', lines);
      if (outputFormat === 'json' || outputFormat === 'csv') {
        result['STDIN'] = scanInput(lines, true);
        let output = (outputFormat === 'json') ? JSON.stringify(result, null, 2) : `STDIN,${result['STDIN']}`;
        if (outputDest === 'STDOUT') _out(output);
        else {
          fileLines.push(output);
          writeToFile(outputDest);
        }
      } else if (outputFormat === 'text') {
        let output = '- STDIN';
        if (outputDest === 'STDOUT') {
          _out(output);
          scanInput(lines);
        } else {
          fileLines.push(output);
          fileLines.push(scanInput(lines, true));
          writeToFile(outputDest);
        }
      } else _err(new Error(`outputFormat was found to have an invalid value being ${outputFormat}`)); //Should never happen
    } else lines.push(line);
  });
};

/**
 * @description Read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @protected
 */
const readFiles = (files=process.argv.slice(2, process.argv.length)) => {
  let inputs = [];
  if (DEBUG) _dbg(`readFiles(files=[${files}])`);
  for (let i = 0; i < files.length; ++i) {
    fs.open(files[i], 'r+', (err, fd) => {
      if (DEBUG) _dbg('Opening', files[i]);
      let buf = new Buffer(8192);
      if (err) return ioError('open', err, files[i]);
      fs.read(fd, buf, 0, buf.length, 0, (err, bytes) => {
        if (DEBUG) _dbg('Reading', files[i]);
        if (err) return ioError('read', err, files[i]);
        if (bytes > 0) inputs.push(buf.slice(0, bytes).toString());
      });

      fs.close(fd, (err) => {
        if (DEBUG) _dbg('Closing', fd);
        if (err) ioError('close', err, fd);
        _dbg(`inputs[${i}]=`, inputs[i]);
        if (outputFormat === 'json' || outputFormat === 'csv') {
          result[files[i]] = scanInput(inputs[i], true);
          if (i === files.length - 1) {
            if (outputFormat === 'json') {
              let output = JSON.stringify(result, null, 2);
              (outputDest === 'STDOUT') ? _out(output) : fileLines.push(output);
            } else { //csv
              for (let file in result) {
                if (result.hasOwnProperty(file)) {
                  let output = `${file},${result[file]}`;
                  (outputDest === 'STDOUT') ? _out(output) : fileLines.push(output);
                }
              }
            }
          }
        } else if (outputFormat === 'text') {
          let output = `${i > 0 ? '\n' : ''}- ${files[i]}`;
          if (outputDest === 'STDOUT') {
            _out(output);
            scanInput(inputs[i]);
          } else {
            fileLines.push(output);
            fileLines.push(scanInput(inputs[i], true));
          }
        } else _err(new Error(`outputFormat was found to have an invalid value being ${outputFormat}`)); //Should never happen
        if (outputDest !== 'STDOUT' && i === files.length - 1) {
          if (DEBUG) _dbg('fileLines=', fileLines);
          writeToFile(outputDest);
        }
      });
    });
  }
};

/**
 * @description Synchronously read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @protected
 */
const readFilesSync = (files=process.argv.slice(2, process.argv.length)) => {
  let inputs = [];
  if (DEBUG) _dbg(`readFiles(files=[${files}])`);
  for (let i = 0; i < files.length; ++i) {
    //let fd = fs.openSync(files[i], 'r+');
    inputs.push(fs.readFileSync(files[i], (err) => {
      if (err) ioError('readSync', err, files[i]);
    }));

    if (DEBUG) _dbg(`inputs[${i}]=`, inputs[i]);
    let handleFileData = () => {
      if (outputFormat === 'json' || outputFormat === 'csv') {
        result[files[i]] = scanInput(inputs[i], true);
        if (i === files.length - 1) {
          if (outputFormat === 'json') {
            let output = JSON.stringify(result, null, 2);
            (outputDest === 'STDOUT') ? _out(output) : fileLines.push(output);
          } else { //csv
            for (let file in result) {
              if (result.hasOwnProperty(file)) {
                let output = `${file},${result[file]}`;
                (outputDest === 'STDOUT') ? _out(output) : fileLines.push(output);
              }
            }
          }
        }
      } else if (outputFormat === 'text') {
        let output = `${i > 0 ? '\n' : ''}- ${files[i]}`;
        if (outputDest === 'STDOUT') {
          _out(output);
          scanInput(inputs[i]);
        } else {
          fileLines.push(output);
          fileLines.push(scanInput(inputs[i], true));
        }
      } else _err(new Error(`outputFormat was found to have an invalid value being ${outputFormat}`)); //Should never happen
    };
    handleFileData();
  }
  if (outputDest !== 'STDOUT') {
    if (DEBUG) _dbg('fileLines=', fileLines);
    writeToFile(outputDest);
  }
};

/**
 * @description Start the hasher.
 * @param {string} [format='text'] Format of the result (text, csv, json)
 * @param {string} [input='any'] Reads either from STDIN or the arguments (any, stdin, args)
 * @param {string} [output='STDOUT'] Output the resulting hash (stdout, 'fileName')
 * @param {string[]} [files=[]] List of files to go through
 * @public
 */
const run = (format='text', input='any', output='stdout', files=[]) => {
  if (DEBUG) _dbg(`run(format=${format}, input=${input}, output=${output}), files=[${files}]`);
  if (format === 'csv' || format === 'json') outputFormat = format;
  if (output.toLowerCase() !== 'stdout') outputDest = output;

  switch (input.toLowerCase()) {
  case 'stdin':
    readIn();
    break;
  case 'args':
    readFilesSync(files);
    break;
  default: //any
    argOrIn() ? readFilesSync(files) : readIn();
  }
};

module.exports = {
  run, scanInput, hash, readIn, readFiles, readFilesSync
};