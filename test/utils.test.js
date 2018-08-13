const { error, info, dbg, out, inp, IoError } = require('../src/utils'),
  stdout = require('test-console').stdout,
  assert = require('assert');

test('info', () => {
  const text = 'Hello world';
  // const output = stdout.inspectSync(() => console.log('foo'));
  // assert.deepEqual(output, ['foo\n']);
  // expect(output).toStrictEqual('foo');
  // console.log('output=', output);
})