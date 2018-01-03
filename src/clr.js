/**
 * @description CLI colours.
 * @module clr
 * @exports {scheme}
 */
/* eslint-env es6, node */

/**
 * @type {{in: string, out: string[], inf: string, err: string, warn: string, debug: string, quest: string}}
 */
const scheme = {
  in: 'white',
  out: ['cyan', 'bold'],
  inf: 'green',
  err: 'red',
  warn: 'yellow',
  debug: 'grey',
  quest: 'blue'
};

module.exports = scheme;