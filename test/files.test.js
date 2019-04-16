const readFiles = require('../src/files');
const stdout = require('test-console').stdout;

test('Not existent', () => {
  expect(readFiles(['nowt']))
    .rejects.toThrowError('ENOENT: no such file or directory, open \'nowt\'');
});

let ex0 = './examples/ex0.js', csv = './test/gen/out.csv', jso = './test/gen/out.json',
  hashEx0 = 'sha256-oRWayKCc59n86sjrY/5xXsXO/t8OfjL4f2GkX0eUEII=',
  json0 = {
    [ex0]: hashEx0
  }, csv0 = `${ex0},${hashEx0}`,
  strJson0 = JSON.stringify(json0);

test(`readFiles(["${ex0}"], {outputFormat=csv, outputDest="${csv}"})`, () => {
  expect(readFiles([ex0], { outputFormat: 'csv', outputDest: csv })).resolves.toBeUndefined();
});

test(`readFiles(["${ex0}"], {outputFormat=json, outputDest="${jso}"})`, () => {
  expect(readFiles([ex0], { outputFormat: 'json', outputDest: jso })).resolves.toBeUndefined();
});

test(`readFiles(files=["${ex0}"], {outputFormat=text, outputDest=var})`, () => {
  expect(readFiles([ex0], { outputFormat: 'text', outputDest: 'var' })).resolves.toEqual([hashEx0])
});

test(`readFiles(files=["${ex0}"], {outputFormat=json, outputDest=var})`, () => {
  expect(readFiles([ex0], { outputFormat: 'json', outputDest: 'var' })).resolves.toEqual(json0)
});

test(`readFiles(files=["${ex0}"], {outputFormat=csv, outputDest=var})`, () => {
  expect(readFiles([ex0], { outputFormat: 'csv', outputDest: 'var' })).resolves.toEqual([csv0])
});

const OUT_START = '\u001b[1m\u001b[36m',
  OUT_END = '\u001b[39m\u001b[22m\n';

test(`readFiles(files=["${ex0}"], {outputFormat=json, outputDest=stdout})`, () => {
  const inspect = stdout.inspect();
  expect.assertions(2);
  readFiles([ex0], { outputFormat: 'json', outputDest: 'stdout' })
    .then(out => {
      inspect.restore();
      expect(out).toBeUndefined();
      expect(inspect.output).toEqual([`${OUT_START}${strJson0}${OUT_END}`]);
    }, err => {
      throw new Error(err);
    });
});

test('readFiles([], {outputFormat=csv, outputDest="nothing"})', () => {
  expect(readFiles([], { outputFormat: 'json', outputDest: './test/gen/nothing' })).resolves.toBeUndefined();
});