const { IoError, EOF } = require('../src/utils');

test('IoError', () => {
  expect(() => {
    throw new IoError();
  }).toThrowError(IoError);
  let txt = 'Invalid IO operation',
    named = () => {
      throw new IoError(txt);
    };
  expect(named).toThrowError(IoError);
  expect(named).toThrowError(txt);
  let ctxted = () => {
    throw new IoError(txt, test);
  };
  expect(ctxted).toThrowError(txt);
  let gstack = () => {
    let stk = null;
    try {
      throw new IoError();
    } catch (err) {
      stk = err.stack;
    }
    return stk;
  };
  expect(typeof gstack()).toBe('string');
  expect(gstack().startsWith('IoError')).toBeTruthy();
});

test('EOF', () => {
  expect(EOF('\n')).toBeFalsy(); //Linux
  expect(EOF('\r\n')).toBeFalsy(); //Win
  expect(EOF('\r')).toBeFalsy(); //OSX
  expect(EOF('\\n')).toBeFalsy();
  expect(EOF('\\r\\n')).toBeFalsy();
  expect(EOF('\\r\\n')).toBeFalsy();
  expect(EOF('\\r')).toBeFalsy();
  expect(EOF('\$')).toBeFalsy();
  expect(EOF('\EOF')).toBeFalsy();
  expect(EOF(' \\$')).toBeFalsy();
  expect(EOF(' \\EOF')).toBeFalsy();
  expect(EOF('\\$')).toBeTruthy();
  expect(EOF('\\EOF')).toBeTruthy();
});