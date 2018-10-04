'use strict';

const semver = require('semver');
const chalk = require('chalk');

const validateProject = require('../utils/validate-project');
const dependentsToString = require('../utils/dependents-to-string');

module.exports = {
  name: 'dependency-lint',
  description: 'Validate that only acceptable versions of addon dependencies are present.',
  works: 'insideProject',

  availableOptions: Object.freeze([
    {
      name: 'include-valid',
      type: Boolean,
      default: false,
      description: 'whether to print dependencies that pass validation',
    },
  ]),

  run(options) {
    const results = validateProject(this.project);

    for (const result of results) {
      if (!result.valid || options.includeValid) {
        this._printDependents(result);
      }
    }

    if (!results.every(result => result.valid)) {
      return Promise.reject();
    }
  },

  _printDependents(validation) {
    const printer = version => this._dependencyString(validation, version);

    this.ui.writeLine(chalk.underline(validation.addon));
    this.ui.writeLine(`Allowed: ${validation.specifier || '(any single version)'}`);
    this.ui.writeLine(`Found: ${Object.keys(validation.dependents).join(', ')}`);
    this.ui.writeLine(dependentsToString(validation.addon, validation.dependents, printer));
  },

  _dependencyString(validation, version) {
    const string = `${validation.addon}@${version}`;
    const valid = validation.specifier ? semver.satisfies(version, validation.specifier) : validation.valid;
    return chalk[valid ? 'green' : 'red'](string);
  },
};
