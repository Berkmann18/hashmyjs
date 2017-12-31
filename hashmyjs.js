/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}
 * @author Maximilian Berkmann
 * @module hashmyjs
 * @exports {run, scanInput, hash}
 */

const sjcl = require('sjcl'), readline = require('readline'), fs = require('fs'), clr = require('colors');

clr.setTheme({
  in: 'white',
  out: 'cyan',
  inf: 'green',
  err: 'red',
  warn: 'yellow',
  debug: 'grey'
});

/**
 * @description Generate base64-encoded SHA-256 for given string.
 * @param {string} data Data oto encode
 * @return {string} Base64 encoded SHA-256 hash
 * @protected
 */
let hash = (data) => {
  let hashed = sjcl.hash.sha256.hash(data);
  return `sha256-${sjcl.codec.base64.fromBits(hashed)}`;
};

/**
 * @description Decides whether the program will use the file in the argument or STDIN
 * @return {boolean} true if argument or false for STDIN
 * @private
 */
let argOrIn = () => process.argv.length > 2;

/**
 * @description Read user's input from STDIN.
 * @protected
 */
const readIn = () => {
  console.log('Press CTRL+D (or CMD+D) to stop the STDIN reader\nType either \\n or \\r or \\r\\n in an empty line to signal an End-Of-File (this line won\'t be counted)'.inf);
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }), EOF = (str) => {
      return str === '\\n' || str === '\\r\\n' || str === '\\r'
    }, lines = [];

  rl.on('line', (line) => {
    (EOF(line) || line === 'EOF') ? scanInput(lines) : lines.push(line);
  });
};

/**
 * @description Scan an input and output it's base64 encoded SHA256 hash
 * @param {string} input Input to hash (i.e. JS code)
 * @param {boolean} [noOutput=false] Don't output the result to the terminal but return the hash
 * @protected
 */
const scanInput = (input, noOutput=false) => {
  let data = input;
  if (!argOrIn()) {
    data = (Array.isArray(input)) ? input.join('\n') : input;
  }
  //console.log(`Data scanned:\n\`\`${data}\`\``.debug);
  let digest = `${hash(data)}`;
  if (noOutput) return digest;
  console.log(`${digest}`.out);
};

/**
 * @description Read files and scan them.
 * @param {string[]} [files=process.argv.slice(2, process.argv.length)] Array of file paths
 */
const readFiles = (files=process.argv.slice(2, process.argv.length)) => {
    let inputs = [];
    for (let i = 0; i < files.length; ++i) {
        fs.open(files[i], 'r+', (err, fd) => {
            let buf = new Buffer(4096);
            if (err) return console.error(err);
            fs.read(fd, buf, 0, buf.length, 0, (err, bytes) => {
                //console.log(`${bytes} read`);
                if (err) return console.log(clr.err(err));
                if (bytes > 0) inputs.push(buf.slice(0, bytes).toString());
            });

            fs.close(fd, (err) => {
                if (err) console.error(err);
                console.log(`\n- ${files[i]}`.in);
                scanInput(inputs[i]);
            });
        });
    }
};
/**
 * @description Start the hasher.
 * @public
 */
const run = () => {
  //console.log(`HMJ (readFile=${argOrIn()}): args length= ${process.argv.length}`);
  argOrIn() ? readFiles() : readIn();
};

module.exports = {
  run, scanInput, hash, readIn, readFiles
};
