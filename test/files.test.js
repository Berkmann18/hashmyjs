const readFilesSync = require('../src/files'),
  { IoError } = require('../src/utils');

test('Not existent', () => {
  expect(readFilesSync(['nowt'])).toEqual(`ENOENT: no such file or directory, open 'nowt'`);
});

let ex0 = './examples/ex0.js', output = './test/out.csv';

//l.41

test(`readFilesSync(["${ex0}"], {outputFormat=csv, outputDest="${output}"})`, () => {
  expect(readFilesSync([ex0], { outputFormat: 'csv', outputDest: output })).toBeUndefined();
});