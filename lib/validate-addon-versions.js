'use strict';

const semver = require('semver');

/**
 * Given an addon name, a list of its versions depended on by other packages, and an optional semver
 * specifier, generates an object suitable for passing to Project#generateTestFile describing
 * whether the versions included are valid.
 */
module.exports = function validateAddonVersions(addon, dependents, specifier) {
  if (specifier) {
    const message = `Expected all versions of ${addon} to satisfy "${specifier}"`;
    if (satisfiesVersionSpecifier(dependents, specifier)) {
      return { name: addon, passed: true, errorMessage: message };
    } else {
      return { name: addon, passed: false, errorMessage: `${message}, but found:\\n${dependentsList(dependents)}` };
    }
  } else if (Object.keys(dependents).length === 1) {
    return { name: addon, passed: true, errorMessage: `Expected only one version of ${addon}` };
  } else {
    const errorMessage = `Expected only one version of ${addon}, but found:\\n${dependentsList(dependents)}`;
    return { name: addon, passed: false, errorMessage };
  }
};

function satisfiesVersionSpecifier(dependents, specifier) {
  const versions = Object.keys(dependents);
  return versions.every(version => semver.satisfies(version, specifier));
}

function dependentsList(dependents) {
  const list = Object.keys(dependents).map((version) => {
    let addons = dependents[version];
    if (addons.length > 3) {
      addons = addons.slice(0, 3).concat(`and ${addons.length - 3} others`);
    }
    return ` - ${version} (included by ${addons.join(', ')})`;
  });

  return list.join('\\n');
}
