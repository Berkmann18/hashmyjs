# HashMyJS

It's a relatively simple NodeJS program that allows you to get the base64 encoded SHA-256 hash for a JS file or the code itself that you could later on use as the integrity of a script that you would integrate to a page so it won't be flagged by CSP or else.

## Install
To install it you need to execute the following:
```cli
npm i hashmyjs
```

_Note_: Don't forget to use `-g`, `--save`, `--save-dev` if appropriate.

## Usage
```js
const hmj = require('hashmyjs');

//Hashing from the STDIN (followed by a new line: `\n`, `\r\n` or `\r) or from file passed as arguments
hmj.run();

//Or if you want to hash code that is already present in your script:
let code = `...`;
let digest = hmj.hash(code);
```

## Contribution
If you discover bugs, errors or/and have suggestions/feedback please create an [issue](http://github.com/Berkmann18/hashmyjs/issues) or/and submit a [PR](http://github.com/Berkmann18/hashmyjs/pulls).

If you want to contribute, make sure you stick with the coding style that ESLint is enforcing (cf. configuration file).
To check if a file stick to the standards:
```cli
eslint -c ./config/.eslintrc.js yourFile.js
#Or `npm test` if appropriate
```
To fix formatting errors and such, run:
```cli
./fixjs.sh [your js files seperated by spaces]
```
## License
MIT
