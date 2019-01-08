const stdin = require('mock-stdin').stdin(),
  stdout = require('test-console').stdout;
const hmj = require('../src/hashmyjs');

/*
 run(format=(text | json | csv), input=(any | stdin | args), output=(stdout | ...fileNames | var), files=[...files]
 paths:
  Full: 3 (format) * 3 (input) * 3 (output) * 3 (files.length) = 81 max
  Optimal: 3 * 2 (any | stdin) * 2 * 2 = 24 min
 */

const code = 'const greeter = (name) => console.log(`Hello ${name}!`);',
  hashCode = 'sha256-631s7BgZWUQPh3L/kg22uOBHmyaQoJ6DQtB0uVSJxh4=';

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

test(`run(files=["${ex0}"], {format=text, input=any, output=var})`, () => {
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

test('run(files=[], {input=args, output=\'./test/test.txt\'})', () => {
  hmj.run([], { input: 'args', output: './test/test.txt' })
});

test('run(files=[], {input=stdin, output=var})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'stdin', output: 'var' });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$\n');
  stdin.end();
  h.then(res => {
    expect(res).toBe(`- STDIN: ${hashCode}`);
  })
    .catch(err => {
      throw new Error(err);
    });
});

test('run(files=[], {input=stdin, output=var, prettify=true})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'stdin', output: 'var', prettify: true });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toBe(`- STDIN: ${hashCode}`);
  })
    .catch(err => {
      throw new Error(err);
    });
});

test('run(files=[], {format=csv, input=stdin, output=var})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'stdin', output: 'var', format: 'csv' });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toBe(`STDIN,${hashCode}`);
  })
    .catch(err => {
      throw new Error(err);
    });
});

test('run(files=[], {format=csv, input=stdin, output=var, prettify=true})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'stdin', output: 'var', format: 'csv', prettify: true });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toBe(`STDIN, ${hashCode}`);
  })
    .catch(err => {
      throw new Error(err);
    });
});

test('run(files=[], {format=json, input=stdin, output=var})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'stdin', output: 'var', format: 'json', prettify: false });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toEqual({ STDIN: hashCode });
  })
    .catch(err => {
      throw new Error(err);
    });
});

test('run(files=[], {format=json, input=stdin, output=var, prettify=true})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'stdin', output: 'var', format: 'json', prettify: true });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toStrictEqual(JSON.stringify({ STDIN: hashCode }, null, 2));
  })
    .catch(err => {
      throw new Error(err);
    });
});

const OUT_START = '\u001b[1m\u001b[36m',
  OUT_END = '\u001b[39m\u001b[22m\n';

test('run(files=[], {format=json, input=stdin, output=stdout})', () => {
  expect.assertions(1);
  const inspect = stdout.inspect();
  const h = hmj.run([], { format: 'json', input: 'stdin', output: 'stdout' });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    inspect.restore();
    const expected = `${OUT_START}${JSON.stringify({STDIN: hashCode})}${OUT_END}`;
    expect(inspect.output[1]).toEqual(expected);
    // Since there's colour coding mind-boggles, the first entry is assumed to be
    // 'Press CTRL+D (or CMD+D or using `C` instead of `D`) to stop the STDIN reader\nType either \\$ or \\EOF in an empty line to signal an End-Of-File (this line won\'t be counted)\n\n'
  })
    .catch(err => {
      throw new Error(err);
    });
});

test(`run(files=["${ex0}"], {format=text, input=any, output=stdout})`, () => {
  const output = stdout.inspectSync(() => hmj.run([ex0], { format: 'text', input: 'any', output: 'stdout' }));
  expect(output).toEqual([`${OUT_START}- ${ex0}: ${hashEx0}${OUT_END}`])
});

test(`run(files=["${ex0}"], {format=text, input=args, output=stdout})`, () => {
  const output = stdout.inspectSync(() => hmj.run([ex0], { format: 'text', input: 'args', output: 'stdout' }));
  expect(output).toEqual([`${OUT_START}- ${ex0}: ${hashEx0}${OUT_END}`])
});

test(`run(files=["${ex0}"], {format=json, input=any, output=stdout})`, () => {
  const output = stdout.inspectSync(() => hmj.run([ex0], { format: 'json', input: 'any', output: 'stdout' }));
  expect(output).toEqual([`${OUT_START}${JSON.stringify(json0)}${OUT_END}`])
});

test(`run(files=["${ex0}"], {format=csv, input=any, output=stdout})`, () => {
  const output = stdout.inspectSync(() => hmj.run([ex0], { format: 'csv', input: 'any', output: 'stdout' }));
  expect(output).toEqual([`${OUT_START}${csv0}${OUT_END}`])
});

test('run(files=[], {input=any, output=var})', () => {
  expect.assertions(1);
  let h = hmj.run([], { input: 'any', output: 'var' });
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toEqual(`- STDIN: ${hashCode}`);
  })
    .catch(err => {
      throw new Error(err);
    });
});

test('run()', () => {
  expect.assertions(1);
  let h = hmj.run();
  stdin.reset();
  stdin.send(code);
  stdin.send('\n\\$');
  stdin.end();
  h.then(res => {
    expect(res).toEqual(`- STDIN: ${hashCode}`);
  })
    .catch(err => {
      throw new Error(err);
    });
});