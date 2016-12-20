/* eslint-env node */
'use strict';

const discoverAddonVersions = require('./lib/discover-addon-versions');
const LintResult = require('./lib/lint-result');

module.exports = {
  name: 'dependency-lint',

  included(parent) {
    const userConfig = (parent.options || {}).dependencyLint || {};

    this._super.included.apply(this, arguments);
    this._allowedVersions = Object.assign({}, DEFAULTS, userConfig.versions);
  },

  lintTree(type) {
    if (type === 'tests') {
      const versions = discoverAddonVersions(this.project.name(), this.project.addons);
      return new LintResult(this.project, this._allowedVersions, versions);
    }
  },
};

const DEFAULTS = {
  'ember-cli-htmlbars': '*',
  'ember-cli-babel': '*',
  'ember-cli-sass': '*',
  'ember-cli-node-assets': '*',
};
