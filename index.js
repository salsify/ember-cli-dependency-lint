/* eslint-env node */
'use strict';

const readConfig = require('./lib/utils/read-config');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);
    this.lintConfig = readConfig(this.project);
  },

  includedCommands() {
    return {
      'dependency-lint': require('./lib/commands/dependency-lint'),
    };
  },

  lintTree(type) {
    const project = this.project;
    if (type === 'tests' && this.lintConfig.generateTests !== false) {
      const ProjectDependencyLinter = require('./lib/broccoli/project-dependency-linter');
      return new ProjectDependencyLinter({ project });
    }
  },
};
