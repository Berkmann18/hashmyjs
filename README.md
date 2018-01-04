# HashMyJS
[![NPM](https://nodei.co/npm/hashmyjs.png)](https://nodei.co/npm/hashmyjs/)
<!--[![npm version](https://badge.fury.io/js/hashmyjs.svg)](http://badge.fury.io/js/hashmyjs)-->
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![Inline docs](http://inch-ci.org/github/Berkmann18/hashmyjs.svg?branch=master)](http://inch-ci.org/github/Berkmann18/hashmyjs)
[![NSP Status](https://nodesecurity.io/orgs/berkmann18/projects/ea369eec-8c46-4ad6-903c-739aa66d006a/badge)](https://nodesecurity.io/orgs/berkmann18/projects/ea369eec-8c46-4ad6-903c-739aa66d006a)
[![codecov.io Code Coverage](https://img.shields.io/codecov/c/github/Berkmann18/hashmyjs.svg?maxAge=2592000)](https://codecov.io/github/Berkmann18/hashmyjs?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/Berkmann18/hashmyjs/badges/score.svg)](https://www.bithound.io/github/Berkmann18/hashmyjs)
[![bitHound Dev Dependencies](https://www.bithound.io/github/Berkmann18/hashmyjs/badges/devDependencies.svg)](https://www.bithound.io/github/Berkmann18/hashmyjs/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/Berkmann18/hashmyjs/badges/code.svg)](https://www.bithound.io/github/Berkmann18/hashmyjs)
[![dependencies Status](https://david-dm.org/Berkmann18/hashmyjs/status.svg)](https://david-dm.org/Berkmann18/hashmyjs)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Berkmann18/hashmyjs/issues)

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

//Hashing from the STDIN (followed by a new line: `\$`, `\EOF`) or from file passed as arguments
hmj.run();

//Or if you want to hash code that is already present in your script:
let code = `...`;
let digest = hmj.hash(code);
```
## Nota bene
If you use wildcard `*` in the CLI to get files, NodeJS will have a hard time getting the file from the right URL so it will lead in errors.

## Contribution
If you discover bugs, errors or/and have suggestions/feedback please create an [issue](http://github.com/Berkmann18/hashmyjs/issues) or/and submit a [PR](http://github.com/Berkmann18/hashmyjs/pulls).

If you want to contribute, make sure you stick with the coding style that ESLint is enforcing (cf. configuration file).
To check if a file stick to the standards:
```cli
eslint -c ./config/.eslintrc.js yourFile.js
#Or `npm lint` if appropriate
```
To fix formatting errors and such, run:
```cli
./fixjs.sh [your js files seperated by spaces]
```
## License
MIT
