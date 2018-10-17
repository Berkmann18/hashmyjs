'use strict';
/**
 * @description Core module for HMJ.
 * @module
 */
/* eslint-env es6, node */

const sjcl = require('sjcl'),
  fs = require('fs'),
  readline = require('readline'),
  clr = require('colors/safe');
const { out, info, IoError, error, EOF } = require('./utils');

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
  let emptyInput = !input || input.toString() === '';
  if (emptyInput) throw new Error('scanInput didn\'t received any input');

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
  hash
}