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

const str = (val) => val;

prgm.arguments('[files...]')
  .version(pkg.version)
  .description(pkg.description)
  .option('-f, --format [format]', 'Specify the format of the output (text (default), json, csv)', str, 'text')
  .option('-o, --output [path]', 'Output to a file instead of in the STDOUT', str, 'stdout')
  .option('-i, --interactive', 'Forces to read the input from the STDIN')
  .option('-p, --prettify', 'Prettify the output')
  .action((files) => {
    let opts = {
      format: prgm.format,
      input: (prgm.interactive) ? 'stdin' : 'any',
      output: prgm.output,
      prettify: !!prgm.prettify
    };
    hmj.run(files, opts);
  })
  .parse(process.argv);