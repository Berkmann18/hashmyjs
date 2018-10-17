const stdin = require('mock-stdin').stdin();
const { writeAsJson, readJsonFiles, readJson } = require('../src/json');

const code = 'const hello = (name) => console.log(`Hi ${name}!`);',
  hashCode = 'sha256-X75HP8ksYMVgXXuzmi9Acp/bAF2dOdYarpROmgVvVEU=',
  strHash = JSON.stringify({STDIN: hashCode}, null, 0);

let ex0 = './examples/ex0.js',
  hashEx0 = 'sha256-oRWayKCc59n86sjrY/5xXsXO/t8OfjL4f2GkX0eUEII=',
  json0 = {
    [ex0]: hashEx0
  };

/* writeToFile */
test('writeAsJson(\'file.json\', [\'test\'], text)', () => {
  expect(writeAsJson('./test/file.json', ['test'])).toBeUndefined();
});

test('writeAsJson(\'file.json\', [\'lorem\'...], text)', () => {
  expect(writeAsJson('./test/file.json', ['lorem', 'dolore', 'sit'])).toBeUndefined();
});

test('writeAsJson(\'\', \'test\', text)', () => {
  expect(() => writeAsJson('', ['test'])).toThrowError('No filename specified to be written to with data=test');
});

test('writeAsJson(\'empty.json\', \'\', text)', () => {
  expect(writeAsJson('./test/empty.json', [''])).toBeUndefined();
});

// test(`writeAsJson('some&InvalidFile name.json', 'test', text)`, () => {
//   //Target core#66
//   expect(() => writeAsJson('some&I/nvalidFile name.json', ['test'])).toThrowError(IoError);
// });

/* readJsonFiles */
test('Not existent', () => {
  expect(readJsonFiles(['nowt'])).toEqual(`ENOENT: no such file or directory, open 'nowt'`);
});

test('L.92', () => {
  expect(readJsonFiles(['./examples/ex0.js'], { outputDest: 'var' })).toEqual(json0);
});

/* readJson */
test(`No STDIN`, () => {
  expect.assertions(1);
  let h = readJson({ outputDest: 'var' })
  stdin.reset();
  stdin.send('\n\\$\n');
  stdin.end();
  h.then(res => { //Shouldn't happen
      expect(res).toEqual({STDIN: 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='});
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});

test(`readJson({outputDest: 'in.json'})`, () => {
  expect.assertions(1);
  let h = readJson({ outputDest: './test/in.json' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => { //Shouldn't happen
    console.log(res);
      expect(res).toEqual(strHash);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});

test(`L.26`, () => {
  expect.assertions(1);
  let h = readJson()
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
      expect(res).toEqual(strHash);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});

test(`readIn({outputDest: 'in.json'})`, () => {
  expect.assertions(1);
  let h = readJson({ outputDest: './test/in.json' })
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
      expect(res).toEqual(strHash);
    })
    .catch(err => {
      expect(err.message).toEqual(`scanInput didn't received any input`);
    });
});