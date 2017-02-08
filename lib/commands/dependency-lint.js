'use strict';

const semver = require('semver');
const chalk = require('chalk');
const Command = require('ember-cli/lib/models/command');

const validateProject = require('../utils/validate-project');
const dependentsToString = require('../utils/dependents-to-string');

module.exports = Command.extend({
  name: 'dependency-lint',
  description: 'Validate that only acceptable versions of addon dependencies are present.',
  works: 'insideProject',

  availableOptions: [
    {
      name: 'include-valid',
      type: Boolean,
      default: false,
      description: 'whether to print dependencies that pass validation',
    },
  ],

  run(options) {
    const results = validateProject(this.project);

    for (const result of results) {
      if (!result.valid || options.includeValid) {
        this._printDependents(result);
      }
    }

    if (!results.every(({ valid }) => valid)) {
      return Promise.reject();
    }
  },

  _printDependents({ addon, valid, specifier, dependents }) {
    const printer = version => this._dependencyString(addon, version, specifier, valid);

    this.ui.writeLine(chalk.underline(addon));
    this.ui.writeLine(`Allowed: ${specifier || '(any single version)'}`);
    this.ui.writeLine(`Found: ${Object.keys(dependents).join(', ')}`);
    this.ui.writeLine(dependentsToString(addon, dependents, printer));
  },

  _dependencyString(addon, version, specifier, globallyValid) {
    const string = `${addon}@${version}`;
    const valid = specifier ? semver.satisfies(version, specifier) : globallyValid;
    return chalk[valid ? 'green' : 'red'](string);
  },
});
