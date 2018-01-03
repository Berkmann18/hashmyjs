#!/usr/bin/node
/**
 * @description CLI script for the package.
 * To use it, run `npm start [your files or write to STDIN]`
 * @module index
 */
/* eslint-env node, es6 */

const hmj = require('./src/hashmyjs.js'), prgm = require('commander'), clr = require('colors'),
  pkg = require('./package.json');
// const DEBUG = (process.env.DEBUG === true || process.env.DEBUG === 'true');

clr.setTheme(require('./src/clr'));

let format = 'text', output = 'STDOUT', input = 'any', validInput = false, prettify = false;

prgm.arguments('[files...]')
  .version(pkg.version)
  .description(pkg.description)
  .option('-f, --format [format]', 'Specify the format of the output (text (default), json, csv)', String)
  .option('-o, --output [path]', 'Output to a file instead of in the STDOUT', String)
  .option('-i, --interactive', 'Forces to read the input from the STDIN')
  .option('-p, --prettify', 'Prettify the output')
  .action((files) => {
    validInput = true;
    if (prgm.format) format = prgm.format;
    if (prgm.output) output = prgm.output;
    if (prgm.interactive) input = 'stdin';
    hmj.run(format, input, output, files, !!prgm.prettify);
  })
  .parse(process.argv);

if (!validInput) {
  let argc = process.argv.length;
  /*if (argc <= 2) prgm.help();
  else if (argc <= 3) {
    switch (process.argv[2]) {
      case '-i':
      case '--interactive':
        hmj.run('text', 'stdin');
        break;
    }
  } else {*/
  for (let i = 2; i < argc; ++i) {
    switch (process.argv[i]) { //security/detect-object-injection to resolve
    case '-f':
    case '--format':
      format = process.argv[++i];
      break;
    case '-i':
    case '--interactive':
      input = 'stdin';
      break;
    case '-o':
    case '--output':
      output = process.argv[++i];
      break;
    case '-p':
    case '--prettify':
      console.log('Yes');
      prettify = true;
      break;
    }
  }
  hmj.run(format, input, output, prettify);
  //}
}