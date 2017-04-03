'use strict';

const icli = require('../index');

icli
  .option('number', {
    alias: 'n',
    describe: 'Accept a number',
    question: {
      message: 'Choose a number'
    }
  })
  .option('string', {
    alias: ['s', 'str'],
    describe: 'Accept a string',
    question: {
      message: 'Choose a string'
    }
  })
  .option('choices', {
    alias: ['c'],
    describe: 'Accept values present in a list',
    choices: ['x', 'y', 'z'],
    nargs: 1,
    question: {
      message: 'Choose a value'
    }
  })
  .option('async-choices', {
    describe: 'Accept a value in a list loaded asynchronously',
    choices: () => {
      return Promise.resolve(['a', 'b', 'c']);
    },
    question: {
      message: 'Choose a value (loaded asynchronously)'
    }
  })
  .command('my-command', 'A sub-command', {
    o: {
      describe: 'The option of the sub-command'
    },
    'async-choices-2': {
      describe: 'Accept a value in a list loaded asynchronously 2',
      choices: () => {
        return Promise.resolve(['d', 'e', 'f']);
      },
      question: {
        message: 'Choose a value (loaded asynchronously 2)'
      }
    }
  })
  .command('my-other-command', 'Another sub-command', function(yargs) {
    return yargs.option('o', {
      describe: 'The option of the other sub-command',
      question: {
        message: 'Choose the option of the other sub-command'
      }
    })
    .command('my-other-command-sub-command', 'Another sub-command\'s sub-command', function(yargs) {
      return yargs.option('opt', {
        describe: 'The option of the other sub-command\'s sub-command',
        question: {
          message: 'Choose the option of the other sub-command\'s sub-command'
        }
      });
    });
  })
  .help('h')
  .alias('h', 'help');

icli.parseAndPrompt()
.then(res => {
  console.log(res);
});
