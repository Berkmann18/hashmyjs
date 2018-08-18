const hmj = require('../src/hashmyjs');
const stdin = require('mock-stdin').stdin();
/*
 run(format=(text | json | csv), input=(any | stdin | args), output=(stdout | ...fileNames | var), files=[...files]
 paths:
  Full: 3 (format) * 3 (input) * 3 (output) * 3 (files.length) = 81 max
  Optimal: 3 * 2 (any | stdin) * 2 * 2 = 24 min
 */

const code = `const hello = (name) => console.log(\`Hi \${name}!\`);`;

// test('run(format=text, input=any, output=stdout)', () => expect(hmj.run()));
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

/* test(`run(files=["${ex0}"], {format=text, input=any, output=var})`, () => {
  expect(hmj.run([ex0], { format: 'text', input: 'any', output: 'var' })).toEqual([hashEx0])
});

test(`run(files=["${ex0}, "${ex1}"], {format=text, input=any, output=var})`, () => {
  expect(hmj.run([ex0, './examples/ex1.js'], { format: 'text', input: 'any', output: 'var' }))
    .toEqual([hashEx0, hashEx1])
});

test(`run(files=["${ex0}"], {format=text, input=args, output=var})`, () => {
  expect(hmj.run([ex0], { format: 'text', input: 'args', output: 'var' })).toEqual([hashEx0])
});

test(`run(files=["${ex0}"], {format=text, input=args, output=var, prettify=true})`, () => {
  expect(hmj.run([ex0], { format: 'text', input: 'args', output: 'var', prettify: true })).toEqual([hashEx0])
});

test(`run(files=["${ex0}"], {format=json, input=args, output=var, prettify=false})`, () => {
  expect(hmj.run([ex0], { format: 'json', input: 'args', output: 'var' })).toEqual(json0)
});

test(`run(files=["${ex0}"], {format=json, input=args, output=var, prettify=true})`, () => {
  expect(hmj.run([ex0], { format: 'json', input: 'args', output: 'var', prettify: true })).toEqual(prettyJson0)
});

test(`run(files=["${ex0}", "${ex1}"], {format=json, input=args, output=var, prettify=false})`, () => {
  expect(hmj.run([ex0, ex1], { format: 'json', input: 'args', output: 'var' })).toEqual(json01)
});

test(`run(files=["${ex0}", "${ex1}"], {format=json, input=args, output=var, prettify=true})`, () => {
  expect(hmj.run([ex0, ex1], { format: 'json', input: 'args', output: 'var', prettify: true })).toEqual(prettyJson01)
});

test(`run(files=["${ex0}"], {format=csv, input=args, output=var, prettify=false})`, () => {
  expect(hmj.run([ex0], { format: 'csv', input: 'args', output: 'var' })).toEqual([csv0])
});

test(`run(files=["${ex0}"], {format=csv, input=args, output=var, prettify=true})`, () => {
  expect(hmj.run([ex0], { format: 'csv', input: 'args', output: 'var', prettify: true })).toEqual([prettyCsv0])
});

test(`run(files=["${ex0}", "${ex1}"], {format=csv, input=args, output=var, prettify=false})`, () => {
  expect(hmj.run([ex0, ex1], { format: 'csv', input: 'args', output: 'var' })).toEqual(csv01)
});

test(`run(files=["${ex0}", "${ex1}"], {format=csv, input=args, output=var, prettify=true})`, () => {
  expect(hmj.run([ex0, ex1], { format: 'csv', input: 'args', output: 'var', prettify: true })).toEqual(prettyCsv01)
});

test(`run(files=["${ex0}"], {input=args, output=''})`, () => {
  expect(() => hmj.run([ex0], { input: 'args', output: '' })).toThrowError('No filename specified to be written to with data=');
});

test(`run(files=["${ex0}"], {input=args, output='./test/ex0.hash'})`, () => {
  hmj.run([ex0], { input: 'args', output: './test/ex0.hash' });
});

test(`run(files=[], {input=args, output='./test/test.txt'})`, () => {
  hmj.run([], { input: 'args', output: './test/test.txt' })
});

test(`run(files=[], {input=stdin, output=var})`, () => {
  expect(hmj.run([], { input: 'stdin', output: 'var' })).toBeUndefined();
}); */

test(`run(files=["${ex0}"], {input=stdin, output=var})`, () => {
  console.log('stdin');
  const tst = () => {
    let h = hmj.run([ex0], { input: 'stdin', output: 'var' });
    stdin.send('const greeter = (name) => console.log(`Hello ${name}!`);');
    stdin.send('\n\\$');
    stdin.end();
    return h;
  };
  expect(tst()).toBe(hashEx0);
});

/* prettifyOutput */
test('prettifyOutput(data, json)', () => {
  expect(hmj.prettifyOutput(json0, 'json')).toEqual(prettyJson0)
});

test('prettifyOutput(data, csv)', () => {
  expect(hmj.prettifyOutput(csv0, 'csv')).toEqual(prettyCsv0)
});