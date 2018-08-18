const { info, dbg, out, inp, warn, quest, error, IoError } = require('../src/utils'),
  stdout = require('test-console').stdout;

const clr = require('colors/safe');
clr.setTheme(require('../src/clr'));

test('init', () => {
  const text = 'Hello world';
  // const output = stdout.inspectSync(() => console.log('foo'));
  const output = stdout.inspectSync(() => process.stdout.write(text));
  expect(output).toStrictEqual([text]);
})

test('info', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.inf(text)));
  expect(output).toStrictEqual([`\u001b[32m${text}\u001b[39m`]);
  expect(info(text)).toBeUndefined();
});

test('dbg', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.debug(text)));
  expect(output).toStrictEqual([`\u001b[90m${text}\u001b[39m`]);
  expect(dbg(text)).toBeUndefined();
});

test('out', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.out(text)));
  expect(output).toStrictEqual([`\u001b[1m\u001b[36m${text}\u001b[39m\u001b[22m`]);
  expect(out(text)).toBeUndefined();
});

test('inp', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.in(text)));
  expect(output).toStrictEqual([`\u001b[37m${text}\u001b[39m`]);
  expect(inp(text)).toBeUndefined();
});

test('warn', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.warn(text)));
  expect(output).toStrictEqual([`\u001b[33m${text}\u001b[39m`]);
  expect(warn(text)).toBeUndefined();
});

test('quest', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.quest(text)));
  // console.log(output);
  expect(output).toStrictEqual([`\u001b[34m${text}\u001b[39m`]);
  expect(quest(text)).toBeUndefined();
});

test('error', () => {
  const text = 'Hello';
  const output = stdout.inspectSync(() => process.stdout.write(clr.err(text)));
  expect(output).toStrictEqual([`\u001b[31m${text}\u001b[39m`]);
  expect(error(text)).toBeUndefined();
});

test('IoError', () => {
  expect(() => IoError('open', 'Fake error', 'null')).toThrowError('IO open error:', 'Fake error', `on 'null'`)
});