const { scanInput, prettifyOutput, writeToFile, hash } = require('../src/core'),
  { IoError } = require('../src/utils');

const code = 'const hello = (name) => console.log(`Hi ${name}!`);',
  hashCode = 'sha256-X75HP8ksYMVgXXuzmi9Acp/bAF2dOdYarpROmgVvVEU=';
let ex0 = './examples/ex0.js',
  hashEx0 = 'sha256-oRWayKCc59n86sjrY/5xXsXO/t8OfjL4f2GkX0eUEII=',
  json0 = {
    [ex0]: hashEx0
  },
  csv0 = `${ex0},${hashEx0}`,
  prettyJson0 = JSON.stringify(json0, null, 2),
  prettyCsv0 = `${ex0}, ${hashEx0}`;
let ex1 = './examples/ex1.js',
  hashEx1 = 'sha256-SBnmV4ckn4spX5QRwkieP+JwsESJtEkTAQdp4vmAkQU=',
  json1 = {
    [ex1]: hashEx1
  },
  csv1 = `${ex1},${hashEx1}`,
  prettyJson1 = JSON.stringify(json1, null, 2),
  prettyCsv1 = `${ex1}, ${hashEx1}`;
let json01 = {
    [ex0]: hashEx0,
    [ex1]: hashEx1
  },
  csv01 = [csv0, csv1],
  prettyJson01 = JSON.stringify(json01, null, 2),
  prettyCsv01 = [prettyCsv0, prettyCsv1];

/* scanInput */
test('scanInput(code, true)', () => {
  expect(scanInput(code, true)).toBe(hashCode);
});

test('scanInput(code)', () => {
  expect(scanInput(code)).toBeUndefined();
});

test('scanInput()', () => {
  expect(() => scanInput()).toThrowError(Error);
})
/* prettifyOutput */
test('prettifyOutput(data, json)', () => {
  expect(prettifyOutput(json0, 'json')).toEqual(prettyJson0)
});

test('prettifyOutput(data, csv)', () => {
  expect(prettifyOutput(csv0, 'csv')).toEqual(prettyCsv0)
});

test('prettifyOutput(data)', () => {
  expect(prettifyOutput(hashEx0)).toEqual(hashEx0)
});

/* writeToFile */
test('writeToFile(\'file.txt\', [\'test\'], text)', () => {
  expect(writeToFile('./test/file.txt', ['test'])).toBeUndefined();
});

test('writeToFile(\'file.txt\', [\'lorem\'...], text)', () => {
  expect(writeToFile('./test/file.txt', ['lorem', 'dolore', 'sit'])).toBeUndefined();
});

test('writeToFile(\'\', \'test\', text)', () => {
  expect(() => writeToFile('', ['test'])).toThrowError('No filename specified to be written to with data=test');
});

test('writeToFile(\'empty.txt\', \'\', text)', () => {
  expect(writeToFile('./test/empty.txt', [''])).toBeUndefined();
});

test(`writeToFile('some&InvalidFile name.txt', 'test', text)`, () => {
  //Target core#66
  let oops = () => writeToFile('some&I/nvalidFile name.txt', ['test']);
  /* @todo Remove the `.not` once the jest issue is gone */
  expect(oops).not.toThrowError(IoError);
});

test(`writeToFile('someDir/file.txt, 'hello')`, () => {
  /* @todo Remove the `.not` once the jest issue is gone */
  expect(() => writeToFile('someDir/file.txt', ['hello'])).not.toThrowError('Couldn\'t write in someDir/file.txt');
});

/* hash */
test('hash(null)', () => {
  expect(() => hash(null)).toThrowError(Error);
});

test('hash(undefined)', () => { //This test might drive jest nuts giving an ENOENT error
  expect(() => hash(undefined)).toThrowError(Error);
});