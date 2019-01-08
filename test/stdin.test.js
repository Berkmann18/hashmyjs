const stdin = require('mock-stdin').stdin();
const readIn = require('../src/stdin');

const code = 'const greeter = (name) => console.log(`Hello ${name}!`);',
  hashCode = 'sha256-631s7BgZWUQPh3L/kg22uOBHmyaQoJ6DQtB0uVSJxh4=';

test('No STDIN', () => {
  expect.assertions(1);
  let h = readIn({ outputDest: 'var' })
  stdin.reset();
  stdin.send('\n\\$\n');
  stdin.end();
  h.then(res => { //Shouldn't happen
    expect(res).toEqual('- STDIN: sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=');
  })
    .catch(err => {
      expect(err.message).toEqual('scanInput didn\'t received any input');
    });
});

test('readIn({outputDest: \'in.txt\'})', () => {
  expect.assertions(1);
  let h = readIn({ outputDest: './test/gen/in.txt' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => { //Shouldn't happen
    expect(res).toEqual(`- STDIN: ${hashCode}`);
  })
    .catch(err => {
      expect(err.message).toEqual('scanInput didn\'t received any input');
    });
});

test('readIn({outputDest: \'in.csv\'})', () => {
  expect.assertions(1);
  let h = readIn({ outputDest: './test/gen/in.csv', outputFormat: 'csv' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toEqual(`STDIN,${hashCode}`);
  })
    .catch(err => {
      expect(err.message).toEqual('scanInput didn\'t received any input');
    });
});

test('L.26', () => {
  expect.assertions(1);
  let h = readIn()
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).not.toEqual(`STDIN, ${hashCode}`);
  })
    .catch(err => {
      expect(err.message).toEqual('scanInput didn\'t received any input');
    });
});