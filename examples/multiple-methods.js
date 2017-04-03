'use strict';

const icli = require('../index');

icli
  .alias('n', 'number')
  .describe('n', 'Accept a number')
  .question('n', {
    message: 'Choose a number'
  })
  .alias('s', ['str', 'string'])
  .describe('s', 'Accept a string')
  .question('s', {
    message: 'Choose a string'
  })
  .alias('c', 'choices')
  .describe('c', 'Accept a value in a list')
  .choices('c', ['x', 'y', 'z'])
  //.nargs('c', 1)
  .question('c', {
    message: 'Choose a value'
  })
  .describe('async-choices', 'Accept a value in a list loaded asynchronously')
  .choices('async-choices', () => {
    return Promise.resolve(['a', 'b', 'c']);
  })
  .question('async-choices', {
    message: 'Choose a value (loaded asynchronously)'
  })
  .command('my-command <username|email> [password]', 'A sub-command', {
    o: {
      describe: 'The option of the sub-command'
    },
    'async-choices-2': {
      describe: 'Accept a value in a list loaded asynchronously 2',
      choices: Promise.resolve(['d', 'e', 'f']),
      nargs: 1,
      question: {
        message: 'Choose a value (loaded asynchronously 2)'
      }
    }
  })
  .help('h')
  .alias('h', 'help');

icli.parseAndPrompt()
.then(res => {
  console.log(res);
});
