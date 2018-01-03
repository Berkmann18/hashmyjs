const hmj = require('../src/hashmyjs');
/*
 run(format=(text | json | csv), input=(any | stdin | args), output=(stdout | ...fileNames | var), files=[...files]
 paths:
  Full: 3 (format) * 3 (input) * 3 (output) * 3 (files.length) = 81 max
  Optimal: 3 * 2 (any | stdin) * 2 * 2 = 24 min
 */

const code = `const hello = (name) => console.log(\`Hi \${name}!\`);`;

//test('run(format=text, input=any, output=stdout)', () => expect(hmj.run()));
/* scanInput */
test('scanInput(code, true)', () => {
  expect(hmj.scanInput(code, true)).toBe('sha256-X75HP8ksYMVgXXuzmi9Acp/bAF2dOdYarpROmgVvVEU=');
});
test('scanInput(code)', () => {
  expect(hmj.scanInput(code)).toBeUndefined();
});

/* readIn */

/* readFiles */

/* readFilesSync */

/* run */
let ex0 = './examples/ex0.js', hashEx0 = 'sha256-oRWayKCc59n86sjrY/5xXsXO/t8OfjL4f2GkX0eUEII=',
json0 = {[ex0]: hashEx0}, csv0 = `${ex0},${hashEx0}`, prettyJson0 = JSON.stringify(json0, null, 2), prettyCsv0 = `${ex0}, ${hashEx0}`;
let ex1 = './examples/ex1.js', hashEx1 = 'sha256-SBnmV4ckn4spX5QRwkieP+JwsESJtEkTAQdp4vmAkQU=',
  json1 = {[ex1]: hashEx1}, csv1 = `${ex1},${hashEx1}`, prettyJson1 = JSON.stringify(json1, null, 2), prettyCsv1 = `${ex1}, ${hashEx1}`;
let json01 = {[ex0]: hashEx0, [ex1]: hashEx1}, csv01 = `${csv0}\n${csv1}`, prettyJson01 = JSON.stringify(json01, null, 2), prettyCsv01 = `${prettyCsv0}\n${prettyCsv1}`;

test(`run(format=text, input=any, output=var, files=["${ex0}"])`, () => {
  expect(hmj.run('text', 'any', 'var', [ex0])).toEqual([hashEx0])
});

test(`run(format=text, input=any, output=var, files=["${ex0}, "${ex1}"])`, () => {
  expect(hmj.run('text', 'any', 'var', [ex0, './examples/ex1.js']))
    .toEqual([hashEx0, hashEx1])
});

test(`run(format=text, input=args, output=var, files=["${ex0}"])`, () => {
  expect(hmj.run('text', 'args', 'var', [ex0])).toEqual([hashEx0])
});

test(`run(format=json, input=args, output=var, files=["${ex0}"], prettify=false)`, () => {
  expect(hmj.run('json', 'args', 'var', [ex0])).toEqual(json0)
});

test(`run(format=json, input=args, output=var, files=["${ex0}"], prettify=true)`, () => {
  expect(hmj.run('json', 'args', 'var', [ex0], true)).toEqual(prettyJson0)
});

test(`run(format=json, input=args, output=var, files=["${ex0}", "${ex1}"], prettify=false)`, () => {
  expect(hmj.run('json', 'args', 'var', [ex0, ex1])).toEqual(json01)
});

test(`run(format=json, input=args, output=var, files=["${ex0}", "${ex1}"], prettify=true)`, () => {
  expect(hmj.run('json', 'args', 'var', [ex0, ex1], true)).toEqual(prettyJson01)
});

test(`run(format=csv, input=args, output=var, files=["${ex0}"], prettify=false)`, () => {
  expect(hmj.run('csv', 'args', 'var', [ex0])).toEqual([csv0])
});

test(`run(format=csv, input=args, output=var, files=["${ex0}"], prettify=true)`, () => {
  expect(hmj.run('csv', 'args', 'var', [ex0], true)).toEqual([prettyCsv0])
});

test(`run(format=csv, input=args, output=var, files=["${ex0}", "${ex1}"], prettify=false)`, () => {
  expect(hmj.run('csv', 'args', 'var', [ex0, ex1])).toEqual([csv01])
});

// test(`run(format=csv, input=args, output=var, files=["${ex0}", "${ex1}"], prettify=true)`, () => {
//   expect(hmj.run('csv', 'args', 'var', [ex0, ex1], true)).toEqual([prettyCsv0])
// });
//
// /* prettifyOutput */
// test('prettifyOutput(data, json)', () => {
//   expect(hmj.prettifyOutput(json0, 'json')).toEqual(prettJson0)
// });
//
// test('prettifyOutput(data, csv)', () => {
//   expect(hmj.prettifyOutput(csv0, 'csv')).toEqual(prettyCsv0)
// });
