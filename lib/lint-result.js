'use strict';

const Plugin = require('broccoli-plugin');
const fs = require('fs');
const path = require('path');

const validateAddonVersions = require('./validate-addon-versions');

/**
 * Broccoli plugin that emits a test file with passing/failing tests for addons
 * based on the versions of that addon in the dependency tree.
 */
module.exports = class LintResult extends Plugin {
  constructor(project, allowedVersions, discoveredVersions) {
    super([], {
      persistentOutput: true,
      annotation: 'DependencyLinter',
    });

    this.project = project;
    this.allowedVersions = allowedVersions;
    this.discoveredVersions = discoveredVersions;
  }

  build() {
    const outputPath = path.join(this.outputPath, 'dependencies.lint-test.js');
    if (!fs.existsSync(outputPath)) {
      const addons = Object.keys(this.discoveredVersions);
      const testResults = addons.map(addon => this._resultFor(addon)).filter(Boolean);
      const testFile = this.project.generateTestFile('DependencyLint', testResults);
      fs.writeFileSync(outputPath, testFile, 'utf-8');
    }
  }

  _resultFor(addon) {
    const dependents = this.discoveredVersions[addon];
    const specifier = this.allowedVersions[addon];
    return validateAddonVersions(addon, dependents, specifier);
  }
};
