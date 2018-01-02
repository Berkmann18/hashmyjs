/**
 * @description CLI colours.
 * @module clr
 * @exports {scheme}
 */
/* eslint-env es6, node */

/**
 * @description Theme for inputs, outputs, informations, errors, warnings, debugging information, questions.
 * @type {{in: string, out: [string,string], inf: string, err: string, warn: string, debug: string, quest: string}}
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