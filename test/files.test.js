const readFilesSync = require('../src/files'),
  { IoError } = require('../src/utils');

test('Not existent', () => {
  expect(readFilesSync(['nowt'])).toEqual(`ENOENT: no such file or directory, open 'nowt'`);
});