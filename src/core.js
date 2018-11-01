'use strict';
/**
 * @description Core module for HMJ.
 * @module
 */
/* eslint-env es6, node */

const sjcl = require('sjcl'), fs = require('fs');
const { out, info } = require('nclr');

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
 * Configuration
 * @typedef {Object} Config
 * @property {boolean} [prettify=false] Prettify the output
 * @property {string} [outputDest=OUTPUT_DEST] Output destination (stdout, var, <i>filename</i>)
 * @property {string} [outputFormat=OUTPUT_FORMAT] Output format (text, json, csv)
 */

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
    if (err) throw new Error(`Couldn't write in ${filename}`);
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
 * @description Handle JSON data.
 * @param {Object|string|Array} json JSON data
 * @param {boolean} [prettify=false] Make it pretty
 * @returns {Object|string|Array} (Stringified) JSON data
 */
const jsonHandler = (json, prettify = false) => {
  return prettify ? JSON.stringify(json, null, 2) : json;
};

/**
 * @description Handle CSV data.
 * @param {string} lhs CSV data on the left hand side
 * @param {string} rhs CSV data on the right hand side
 * @param {boolean} [prettify=false] Make it pretty
 * @returns {string} CSV data
 */
const csvHandler = (lhs, rhs, prettify = false) => {
  return prettify ? `${lhs}, ${rhs}` : `${lhs},${rhs}`;
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
  if (!input || input.toString() === '') throw new Error('scanInput didn\'t received any input');

  let data = Array.isArray(input) ? input.join('\n') : input;
  let digest = hash(data);
  if (typeof digest !== 'string' && 'message' in digest) throw new Error(digest.message);
  if (noOutput) return digest;
  out(`${digest}`);
};

module.exports = {
  OUTPUT_DEST,
  OUTPUT_FORMAT,
  scanInput,
  hash,
  prettifyOutput,
  writeToFile,
  jsonHandler,
  csvHandler
}