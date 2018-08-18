const { info, dbg } = require('./utils');
const readline = require('readline'),
  stdin = require('mock-stdin').stdin();

const readIn = () => {
  info('Press CTRL+D (or CMD+D or using `C` instead of `D`) to stop the STDIN reader\nType either \\$ or \\EOF in an empty line to signal an End-Of-File (this line won\'t be counted)');
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    }),
    EOF = (str) => str === '\\$' || str === '\\EOF',
    lines = [];

  rl.on('line', (line) => {
    dbg('Found line=' + line);
    if (EOF(line)) {
      info(`Done w/ ${lines.length} line(s)`);
    } else lines.push(line);
  });

};

const start = () => {
  readIn();
  stdin.send('const greeter = (name) => console.log(`Hello ${name}!`);');
  stdin.send('\n\\$');
  stdin.end();
};

start();