'use strict';

const icli = require('yargs').requiresArg([]);
const inquirer = require('inquirer');

const questions = {};


// Associate a question to an option
icli.question = function(key, questionConfig) {
  questionConfig.name = key;
  // If when() is not present, we initialize it with a function that checks if the value as been passed in the command line
  if (!questionConfig.when) {
    questionConfig.when = (answers, argv) => {
      return argv[key] === undefined;
    };
  }
  questions[key] = questionConfig;
  return icli;
};


// Override the option() method from yargs to support questions
const originalOption = icli.option;
icli.option = (name, params) => {
  if (params.question) {
    icli.question(name, params.question);
  }
  return originalOption(name, params);
};


// Override the choice() method from yargs to support functions and Promises
const originalChoices = icli.choices;
icli.choices = (key, choices) => {
  // Accept functions
  if (typeof choices === 'function') {
    choices = choices();
  }
  // Accept Promises
  if (choices.then) {
    const options = icli.getOptions();
    options.asyncChoices = options.asyncChoices || {};
    options.asyncChoices[key] = choices;
    return icli;
  }
  return originalChoices(key, choices);
};


icli.parseAndPrompt = () => {
  const argv = icli.argv;
  const options = icli.getOptions();

  return Promise.resolve()
  .then(() => {
    // We check if there are async choices to load
    if (options.asyncChoices) {
      // Load async choices
      const asyncCalls = Object.keys(options.asyncChoices).map(key => {
        return options.asyncChoices[key]
        .then(choices => {
          return Promise.resolve({
            key: key,
            choices: choices
          });
        });
      });
      return Promise.all(asyncCalls)
      .then(choicesLists => {
        choicesLists.forEach(choiceList => {
          icli.choices(choiceList.key, choiceList.choices);
          //icli.argv;
        });
      });
    }
    return Promise.resolve();
  })
  .then(() => {
    enrichQuestions();
    return Promise.all([
      Promise.resolve(argv),
      inquirer.prompt(Object.keys(questions).map(key => questions[key]))
    ]);
  })
  .then(results => {
    return Promise.resolve({
      argv: results[0],
      answers: results[1]
    });
  });
};


module.exports = icli;


function enrichQuestions() {
  const options = icli.getOptions();
  //console.log(options);

  Object.keys(questions).forEach(key => {
    const questionConfig = questions[key];

    // Override the function when() of inquirer to add argv as a second argument
    if (questionConfig.when) {
      const originalWhen = questionConfig.when;
      questionConfig.when = (answers) => {
        return originalWhen(answers, icli.argv);
      };
    }

    // Add the list of choices configured in yargs if needed
    if (options.choices[key] && !questionConfig.choices) {
      questionConfig.choices = options.choices[key];
      if (!questionConfig.type) {
        questionConfig.type = options.narg[key] === 1 ? 'list' : 'checkbox';
      }
    }
  });
}
