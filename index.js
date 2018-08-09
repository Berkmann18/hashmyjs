#!/usr/bin/node

/**
 * @description CLI script for the package.
 * To use it, run `npm start [your files or write to STDIN]`
 * @module index
 */
/* eslint-env node, es6 */

const hmj = require('./src/hashmyjs.js'),
  prgm = require('commander'),
  clr = require('colors'),
  pkg = require('./package.json');

clr.setTheme(require('./src/clr'));

prgm.arguments('[files...]')
  .version(pkg.version)
  .description(pkg.description)
  .option('-f, --format [format]', 'Specify the format of the output (text (default), json, csv)', String)
  .option('-o, --output [path]', 'Output to a file instead of in the STDOUT', String)
  .option('-i, --interactive', 'Forces to read the input from the STDIN')
  .option('-p, --prettify', 'Prettify the output')
  .action((files) => {
    validInput = true;
    let input = (prgm.interactive) ? 'stdin' : 'any';
    hmj.run(prgm.format || 'text', input, prgm.output || 'STDOUT', files, !!prgm.prettify);
  })
  .parse(process.argv);