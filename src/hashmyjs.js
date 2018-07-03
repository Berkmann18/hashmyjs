/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}.
 * @author Maximilian Berkmann
 * @module hashmyjs
 * @exports {run, scanInput, hash, readIn, readFiles, readFilesSync, prettifyOutput}
 */
/* eslint-env es6, node */

const sjcl = require('sjcl'), readline = require('readline'), fs = require('fs'), clr = require('colors/safe');
const DEBUG = (process.env.DEBUG === true || process.env.DEBUG === 'true');
let outputFormat = 'text', outputDest = 'stdout', result = {}, fileLines = [];

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
 * @description Write to a file (while prettifying the content).
 * @param {string} filename File name
 * @param {string[]} [data=fileLines] Lines to write to the file
 * @private
 */
let writeToFile = (filename, data=fileLines) => {
  if (!filename) return _err('No filename specified to be written to with data=', data);
  filename = ('' + filename).trim();
  fs.writeFile(filename, '', (err) => {
    if (err) return ioError('write', err, filename);
    let writer = fs.createWriteStream(filename, {
      flags: 'a'
    });
    data.forEach((line) => writer.write(`${prettifyOutput(line, outputFormat)}\n`));
    _inf(`Successfully written the result to ${filename}`);
  });

};

/**
 * @description Scan an input and output it's integrity hash.
 * @param {(string|string[])} input Input to hash (i.e. JS code)
 * @param {boolean} [noOutput=false] Don't output the result to the terminal but return the hash
 * @return {(void|string)} Hashed data or nothing
 * @protected
 */
const scanInput = (input, noOutput=false) => {
  let data = (Array.isArray(input)) ? input.join('\n') : input;
  if (!input) return _err('scanInput didn\'t received any input');
  if (DEBUG) _dbg(`Data scanned:\n\`\`${data}\`\``);
  let digest = `${hash(data)}`;
  if (noOutput) return digest;
  if (outputDest.toLowerCase() === 'stdout') _out(`${digest}`);
};

/**
 * @description Read user's input from STDIN.
 * @param {boolean} [prettify=false] Prettify the output
 * @return {(undefined|string)} Data or nothing
 * @protected
 */
const readIn = (prettify=false) => {
  resetVars();
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
        let output = (outputFormat === 'json') ? result : `STDIN,${result['STDIN']}`;
        if (prettify) output = prettifyOutput(output);
        if (outputDest.toLowerCase() === 'stdout') _out(output);
        else if (outputDest.toLowerCase() === 'var') return output;
        else {
          fileLines.push(output);
          writeToFile(outputDest, fileLines);
        }
      } else if (outputFormat === 'text') {
        let output = '- STDIN';
        if (outputDest === 'stdout') {
          _out(output);
          scanInput(lines);
        } else if (outputDest.toLowerCase() === 'var') return output;
        else {
          fileLines.push(output);
          fileLines.push(scanInput(lines, true));
          writeToFile(outputDest, fileLines);
        }
      } else _err(new Error(`outputFormat was found to have an invalid value being ${outputFormat}`)); //Should never happen
    } else lines.push(line);
  });
};

/**
 * @description Handle data from files.
 * @param {string[]} files List of file names
 * @param {string[]} inputs List of inputs (content of each files)
 * @param {number} [i=0] Index within the lists
 * @param {boolean} [prettify=false] Prettify the output
 * @return {(undefined|string|string[])} Data or nothing
 * @throws {TypeError} Argument type error
 */
const handleData = (files, inputs, i=0, prettify=false) => {
  let res = [];
  if (DEBUG) {
    _dbg(`handling files=${files}\t at i=${i}`);
  }
  if (!Array.isArray(files) || !Array.isArray(inputs) || isNaN(i)) throw new TypeError('handleData was called with an argument of the wrong type');
  let postData = (output) => {
    if (outputDest === 'stdout') {
      if (prettify) _out(output);
      else {
        _out(outputFormat === 'json' ? JSON.stringify(output, null, 0) : output);
      }
    }
    else if (outputDest.toLowerCase() === 'var') {
      if (DEBUG) console.log('hdlData', output, 'pretty=', prettify);
      return output;
    }
    else fileLines.push(output);
  };
  if (outputFormat === 'json' || outputFormat === 'csv') {
    result[files[i]] = scanInput(inputs[i], true);
    if (i === files.length - 1) {
      if (outputFormat === 'json') {
        let output = prettify ? JSON.stringify(result, null, 2) : result;
        return postData(output)
      } else { //csv
        for (let file in result) {
          if (result.hasOwnProperty(file)) {
            let output = prettify ? `${file}, ${result[file]}` : `${file},${result[file]}`;
            let data = postData(output);
            if (outputDest === 'var') res.push(data);
          }
        }
      }
    }
  } else if (outputFormat === 'text') {
    let output = `${i > 0 ? '\n' : ''}- ${files[i]}`;
    if (outputDest === 'stdout') {
      scanInput(inputs[i]);
    } else if (outputDest.toLowerCase() === 'var') return scanInput(inputs[i], true);
    else {
      fileLines.push(output);
      fileLines.push(scanInput(inputs[i], true));
    }
  } else _err(new Error(`outputFormat was found to have an invalid value being ${outputFormat}`)); //Should never happen
  if (outputDest === 'var') return res;
};

/**
 * @description Read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @return {(undefined|string[])} Data or nothing
 * @protected
 */
const readFiles = (files=process.argv.slice(2, process.argv.length)) => {
  resetVars();
  let inputs = [], res = [];
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
        let data = handleData(files, inputs, i);
        if (outputDest === 'var') res.push(data);
        else if (outputDest !== 'stdout' && i === files.length - 1) {
          if (DEBUG) _dbg('fileLines=', fileLines);
          writeToFile(outputDest);
        }
      });
    });
  }
  if (outputDest === 'var') return res;
};

/**
 * @description Synchronously read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 * @param {boolean} [prettify=false] Prettify the output
 * @return {(undefined|string[]|{...string})} Data or nothing
 * @protected
 */
const readFilesSync = (files=process.argv.slice(2, process.argv.length), prettify=false) => {
  resetVars();
  let inputs = [], res = [];
  if (DEBUG) _dbg(`readFilesSync(files=[${files}])`);
  for (let i = 0; i < files.length; ++i) {
    inputs.push(fs.readFileSync(files[i], (err) => {
      if (err) ioError('readSync', err, files[i]);
    }));

    if (DEBUG) _dbg(`inputs[${i}]=`, inputs[i]);
    let data = handleData(files, inputs, i, prettify);
    if (DEBUG) {
      _dbg('data=');
      console.dir(data);
    }
    if (outputDest === 'var') {
      if (DEBUG) {
        _dbg(`Data pushed=V, i=${i}`);
        console.dir(data);
      }
      if (outputFormat !== 'json' && data && data.length > 0) res.push(data);
      else if (outputFormat === 'json') res = data;
      else if (DEBUG) {
        _dbg('Ignoring empty data=');
        console.dir(data);
      }
    }
  }
  if (DEBUG) _dbg('res=', res);
  if (outputDest === 'var') {
    if (outputFormat === 'csv') res = res[0];
    return /*prettify ? prettifyOutput(res) :*/ res;
  } else if (outputDest !== 'stdout') {
    if (DEBUG) _dbg('fileLines=', fileLines);
    writeToFile(outputDest, fileLines);
    fileLines = [];
  }
};

/**
 * @description Prettify the ouptut according to the format used.
 * @param {(string|object)} output Output
 * @param {string} [format=outputFormat] Format of the output
 * @return {string} Prettified output
 * @protected
 */
const prettifyOutput = (output, format=outputFormat) => {
  switch (format.toLowerCase()) {
  case 'json':
    return JSON.stringify(output, null, 2);
  case 'csv':
    return Array.isArray(output) ? output.map(item => item.replace(/(\S+),(\S+)/, '$1, $2')) : output.replace(/(\S+),(\S+)/, '$1, $2');
  default:
    return output;
  }
};

/**
 * @description Reset the variables that may leave trash for further use.
 * @private
 */
const resetVars = () => {
  fileLines = [];
  result = {}
};

/**
 * @description Start the hasher.
 * @param {string} [format='text'] Format of the result (text, csv, json)
 * @param {string} [input='any'] Reads either from STDIN or the arguments (any, stdin, args)
 * @param {string} [output='stdout'] Output the resulting hash in STDOUT (stdout) or a file (fileName)or as a returned value (var)
 * @param {string[]} [files=[]] List of files to go through
 * @param {boolean} [prettify=false] Prettify the output
 * @return {(undefined|string[]|string)} Data or nothing
 * @public
 */
const run = (format='text', input='any', output='stdout', files=[], prettify=false) => {
  if (DEBUG) _dbg(`run(format=${format}, input=${input}, output=${output}, files=[${files}], prettify=${prettify})`);
  if (format === 'csv' || format === 'json') outputFormat = format;
  if (output.toLowerCase() !== 'stdout') outputDest = output;

  switch (input.toLowerCase()) {
  case 'stdin':
    return readIn(prettify);
    break;
  case 'args':
    return readFilesSync(files, prettify);
    break;
  default: //any
    return (files.length > 0 || argOrIn()) ? readFilesSync(files, prettify) : readIn(prettify);
  }
};

module.exports = {
  run, scanInput, hash, readIn, readFiles, readFilesSync, prettifyOutput
};