/* eslint-env node */
'use strict';

const Plugin = require('broccoli-plugin');
const semver = require('semver');
const fs = require('fs');
const path = require('path');

/**
 * Broccoli plugin that emits a test file with passing/failing tests for addons
 * based on the number of versions installed.
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
      const testResults = Object.keys(this.results).map(addon => this._resultFor(addon)).filter(Boolean);
      const testFile = this.project.generateTestFile('Dependencies', testResults);
      fs.writeFileSync(outputPath, testFile, 'utf-8');
    }
  }

  _resultFor(addon) {
    const dependents = this.discoveredVersions[addon];

    if (this._hasVersionSpecifier(addon)) {
      const specifier = this.allowedVersions[addon];
      const message = `Expected all versions of ${addon} to satisfy "${specifier}"`;
      if (this._satisfiesVersionSpecifier(addon, specifier)) {
        return { name: addon, passed: true, errorMessage: message };
      } else {
        return { name: addon, passed: false, errorMessage: `${message}, but found:\\n${this._dependentsList(dependents)}` };
      }
    } else if (Object.keys(dependents).length === 1) {
      return { name: addon, passed: true, errorMessage: `Exactly one version of ${addon} included` };
    } else {
      const errorMessage = `Expected only one version of ${addon}, but found:\\n${this._dependentsList(dependents)}`;
      return { name: addon, passed: false, errorMessage };
    }
  }

  _hasVersionSpecifier(addon) {
    return addon in this.allowedVersions;
  }

  _satisfiesVersionSpecifier(addon, specifier) {
    const specifier = this.allowedVersions[addon];
    const versions = Object.keys(this.discoveredVersions[addon]);
    return versions.every(version => semver.satisfies(specifier, version));
  }

  _dependentsList(dependents) {
    const list = Object.keys(dependents).map((version) => {
      let addons = dependents[version];
      if (addons.length > 3) {
        addons = addons.slice(0, 3).concat(`and ${addons.length - 3} others`);
      }
      return ` - ${version} (included by ${addons.join(', ')})`;
    });

    return list.join('\\n');
  }
};
