/**
 * @description base64(SHA-256) text encoder inspired by {@link https://stackoverflow.com/a/38554505/5893085}
 * @author Maximilian Berkmann
 * @module hashmyjs
 * @exports {run, scanInput, hash}
 */

const sjcl = require('sjcl'), readline = require('readline'), fs = require('fs');

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
 * @private
 */
const readIn = () => {
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }), EOF = (str) => {
      return str === '\\n' || str === '\\r\\n' || str === '\\r'
    }, lines = [];

  rl.on('line', (line) => {
    (EOF(line) || line === 'EOF$') ? scanInput(lines) : lines.push(line);
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
  let digest = `${hash(data)}`;
  if (noOutput) return digest;
  console.log(`${digest}`);
};

/**
 * @description Start the hasher.
 * @public
 */
const run = () => {
  if (argOrIn()) {
    let inputs = [];
    for (let i = 2; i < process.argv.length; ++i) {
      fs.open(process.argv[i], 'r+', (err, fd) => {
        let buf = new Buffer(4096);
        if (err) return console.error(err);
        fs.read(fd, buf, 0, buf.length, 0, (err, bytes) => {
          //console.log(`${bytes} read`);
          if (err) return console.log(err);
          if (bytes > 0) inputs.push(buf.slice(0, bytes).toString());
        });

        fs.close(fd, (err) => {
          if (err) console.error(err);
          console.log(`\n- ${process.argv[i]}`);
          scanInput(inputs[i - 2]);
        });
      });
    }
  } else readIn();
}

module.exports = {
  run, scanInput, hash
}