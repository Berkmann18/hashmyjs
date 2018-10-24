const readFilesSync = require('../src/files'),
  { IoError } = require('../src/utils');

test('Not existent', () => {
  expect(readFilesSync(['nowt'])).toEqual(`ENOENT: no such file or directory, open 'nowt'`);
});

let ex0 = './examples/ex0.js', csv = './test/out.csv', jso = './test/out.json';

//l.41

test(`readFilesSync(["${ex0}"], {outputFormat=csv, outputDest="${csv}"})`, () => {
  expect(readFilesSync([ex0], { outputFormat: 'csv', outputDest: csv })).toBeUndefined();
});

test(`readFilesSync(["${ex0}"], {outputFormat=json, outputDest="${jso}"})`, () => {
  expect(readFilesSync([ex0], { outputFormat: 'json', outputDest: jso })).toBeUndefined();
});