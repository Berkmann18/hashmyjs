/**
 * @fileoverview Utility module for HMJ.
 * @module
 */

/**
 * @description I/O error.
 * @example new IoError('File not found');
 */
class IoError extends Error {
  /**
   * Creates and I/O error.
   * @param {string} message Error message
   * @param {*} context I/O context
   * @memberof IoError
   */
  constructor(message = 'IO error:', context) {
    super();
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.context = context;
  }
}

/**
 * Check if a string is deemed to be an EOF symbol (<code>\$<code> or <code>\EOF</code>).
 * @param {string} str Text
 * @returns {boolean} Is it an EOF character?
 * @example
 * EOF('\n'); //returns false
 * EOF('END\$'); //returns false
 * EOF('\\$'); //returns true
 * EOF('\\EOF'); //returns true
 * EOF('\$'); //returns false
 * EOF('\EOF'); //returns false
 */
const EOF = (str) => str === '\\$' || str === '\\EOF'

module.exports = { IoError, EOF }