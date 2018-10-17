const stdin = require('mock-stdin').stdin();
const { writeAsCsv, readCsvFiles, readCsv } = require('../src/csv');

const code = 'const hello = (name) => console.log(`Hi ${name}!`);',
  hashCode = 'sha256-X75HP8ksYMVgXXuzmi9Acp/bAF2dOdYarpROmgVvVEU=';

/* writeToFile */
test('writeAsCsv(\'file.csv\', [\'test\'], text)', () => {
  expect(writeAsCsv('./test/file.csv', ['test'])).toBeUndefined();
});

test('writeAsCsv(\'file.csv\', [\'lorem\'...], text)', () => {
  expect(writeAsCsv('./test/file.csv', ['lorem', 'dolore', 'sit'])).toBeUndefined();
});

test('writeAsCsv(\'\', \'test\', text)', () => {
  expect(() => writeAsCsv('', ['test'])).toThrowError('No filename specified to be written to with data=test');
});

test('writeAsCsv(\'empty.csv\', \'\', text)', () => {
  expect(writeAsCsv('./test/empty.csv', [''])).toBeUndefined();
});

// test(`writeAsCsv('some&InvalidFile name.csv', 'test', text)`, () => {
//   //Target core#66
//   expect(() => writeAsCsv('some&I/nvalidFile name.csv', ['test'])).toThrowError(IoError);
// });

/* readCsvFiles */
test('Not existent', () => {
  expect(readCsvFiles(['nowt'])).toEqual(`ENOENT: no such file or directory, open 'nowt'`);
});

/* readCsv */
test(`No STDIN`, () => {
  expect.assertions(1);
  let h = readCsv({ outputDest: 'var' })
  stdin.reset();
  stdin.send('\n\\$\n');
  stdin.end();
  h.then(res => { //Shouldn't happen
      expect(res).toEqual(`STDIN,sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=`);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});

test(`readCsv({outputDest: 'in.csv'})`, () => {
  expect.assertions(1);
  let h = readCsv({ outputDest: './test/in.csv' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => { //Shouldn't happen
      expect(res).toEqual(`STDIN,${hashCode}`);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});

test(`L.26`, () => {
  expect.assertions(1);
  let h = readCsv()
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
      expect(res).toEqual(`STDIN,${hashCode}`);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});

test(`readIn({outputDest: 'in.csv'})`, () => {
  expect.assertions(1);
  let h = readCsv({ outputDest: './test/in.csv' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
      expect(res).toEqual(`STDIN,${hashCode}`);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});