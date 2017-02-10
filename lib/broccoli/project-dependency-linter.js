'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs');
const path = require('path');

const validateProject = require('../utils/validate-project');
const dependentsToString = require('../utils/dependents-to-string');

/**
 * Broccoli plugin that emits a test file with passing/failing tests for addons
 * based on the versions of that addon in the dependency tree.
 */
module.exports = class ProjectDependencyLinter extends Plugin {
  constructor(options) {
    super([], {
      persistentOutput: true,
      annotation: 'ProjectDependencyLinter',
    });

    this.project = options.project;
  }

  build() {
    const outputPath = path.join(this.outputPath, 'dependencies.lint-test.js');
    if (!fs.existsSync(outputPath)) {
      const results = validateProject(this.project);
      const testResults = results.map(addon => this._resultFor(addon));
      const testFile = this.project.generateTestFile('DependencyLint', testResults);
      fs.writeFileSync(outputPath, testFile, 'utf-8');
    }
  }

  _resultFor(validation) {
    let errorMessage = validation.specifier
      ? `Expected all versions of ${validation.addon} to satisfy "${validation.specifier}"`
      : `Expected only one version of ${validation.addon}`;

    if (!validation.valid) {
      errorMessage += `, but found\n${dependentsToString(validation.addon, validation.dependents)}`;
    }

    // The test writer needs newlines escaped
    errorMessage = errorMessage.replace(/\n/g, '\\n');

    return { name: validation.addon, passed: validation.valid, errorMessage };
  }
};
