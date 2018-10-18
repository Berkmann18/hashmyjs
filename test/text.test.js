const stdin = require('mock-stdin').stdin();
const { writeAsTxt, readTxtFiles, readTxt } = require('../src/text');

const code = 'const hello = (name) => console.log(`Hi ${name}!`);',
  hashCode = 'sha256-X75HP8ksYMVgXXuzmi9Acp/bAF2dOdYarpROmgVvVEU=';

/* writeToFile */
test('writeAsTxt(\'file.txt\', [\'test\'], text)', () => {
  expect(writeAsTxt('./test/file.txt', ['test'])).toBeUndefined();
});

test('writeAsTxt(\'file.txt\', [\'lorem\'...], text)', () => {
  expect(writeAsTxt('./test/file.txt', ['lorem', 'dolore', 'sit'])).toBeUndefined();
});

test('writeAsTxt(\'\', \'test\', text)', () => {
  expect(() => writeAsTxt('', ['test'])).toThrowError('No filename specified to be written to with data=test');
});

test('writeAsTxt(\'empty.txt\', \'\', text)', () => {
  expect(writeAsTxt('./test/empty.txt', [''])).toBeUndefined();
});

// test(`writeAsTxt('some&InvalidFile name.txt', 'test', text)`, () => {
//   //Target core#66
//   expect(() => writeAsTxt('some&I/nvalidFile name.txt', ['test'])).toThrowError(IoError);
// });

/* readTxtFiles */
test('Not existent', () => {
  expect(readTxtFiles(['nowt'])).toEqual(`ENOENT: no such file or directory, open 'nowt'`);
});

/* readTxt */
test('No STDIN', () => {
  expect.assertions(1);
  let h = readTxt({ outputDest: 'var' })
  stdin.reset();
  stdin.send('\n\\$\n');
  stdin.end();
  h.then(res => { //Shouldn't happen
      expect(res).toEqual(`- STDIN: sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=`);
    }, err => expect(err.message).toEqual(`scanInput didn't received any input`))
    .catch(err => console.error('No STDIN::Error=', err.message));
});

test(`readTxt({outputDest: 'in.txt'})`, () => {
  expect.assertions(1);
  let h = readTxt({ outputDest: './test/in.txt' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => { //Shouldn't happen
      expect(res).toEqual(`- STDIN: ${hashCode}`);
    }, err => expect(err.message).toEqual(`scanInput didn't received any input`))
    .catch(err => console.error('readTxt::Error=', err.message));
});

test('L.26', () => {
  expect.assertions(1);
  let h = readTxt()
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
      expect(res).toEqual(`- STDIN: ${hashCode}`);
    }, err => expect(err.message).toEqual(`scanInput didn't received any input`))
    .catch(err => console.error('L.26::Error=', err.message));
});