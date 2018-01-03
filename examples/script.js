const hmj = require('../src/hashmyjs');

let code = `const sum = (a, b) => parseFloat(a) + parseFloat(b);`;

hmj.scanInput(code);