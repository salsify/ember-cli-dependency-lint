'use strict';

const semver = require('semver');
const readConfig = require('./read-config');
const discoverAddonVersions = require('./discover-addon-versions');

/**
 * Given a Project instance, returns an array of validation results for all addons
 * present in the project. Each element of the array will have three keys:
 *   name: the name of the addon
 *   valid: a boolean indicating whether the addon passed validation
 *   specifier: the user-configured semver specifier (if any)
 *   dependents: a hash mapping versions of the addon to an array of addons
 *     that depend on that version
 */
module.exports = function validateProject(project) {
  const allowedVersions = Object.assign({}, DEFAULTS, readConfig(project).allowedVersions);
  const discoveredVersions = discoverAddonVersions(project);

  return Object.keys(discoveredVersions).map((addon) => {
    const dependents = discoveredVersions[addon];
    const specifier = allowedVersions[addon];
    const valid = validateAddonVersions(dependents, specifier);
    return { addon, dependents, specifier, valid };
  });
};

function validateAddonVersions(dependents, specifier) {
  const versions = Object.keys(dependents);
  if (specifier) {
    return specifier === '*' || versions.every(version => semver.satisfies(version, specifier));
  } else {
    return versions.length === 1;
  }
}

const DEFAULTS = {
  'ember-cli-htmlbars': '*',
  'ember-cli-babel': '*',
  'ember-cli-sass': '*',
  'ember-cli-node-assets': '*',
  'ember-compatibility-helpers': '*',
  'ember-cli-htmlbars-inline-precompile': '*',
  'ember-auto-import': '*'
};
