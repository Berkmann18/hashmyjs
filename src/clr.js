/**
 * @fileoverview CLI colours.
 * @module clr
 */
/* eslint-env es6, node */

/**
 * @description Colour/style scheme for the CLI.
 * @type {{in: string, out: string[], inf: string, err: string, warn: string, debug: string, quest: string}}
 */
module.exports = {
  in: 'white', //input
  out: ['cyan', 'bold'], //Output
  inf: 'green', //Information
  err: 'red', //Error
  warn: 'yellow', //Warning
  debug: 'grey', //Debug statement
  quest: 'blue' //Question
};