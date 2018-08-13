/**
 * @description CLI colours.
 * @module clr
 * @exports {scheme}
 */
/* eslint-env es6, node */

/**
 * @type {{in: string, out: string[], inf: string, err: string, warn: string, debug: string, quest: string}}
 */
module.exports = { in: 'white',
  out: ['cyan', 'bold'],
  inf: 'green',
  err: 'red',
  warn: 'yellow',
  debug: 'grey',
  quest: 'blue'
};