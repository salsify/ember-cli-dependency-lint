/* eslint-env node */
'use strict';

/**
 * Given a root name and array of addons, traverses the addon inclusion tree to discover all
 * included versions of all addons in the build, producing a structure in the format:
 *
 *  {
 *    "addon-name": {
 *      "addon.version": ["path > to > dependent"]
 *    }
 *  }
 */
module.exports = function discoverAddonVersions(parentName, addons, versions = Object.create(null)) {
  addons.forEach((addon) => {
    const addonDependents = versions[addon.pkg.name] || (versions[addon.pkg.name] = Object.create(null));
    const versionDependents = addonDependents[addon.pkg.version] || (addonDependents[addon.pkg.version] = []);

    versionDependents.push(parentName);

    discoverAddonVersions(`${parentName} > ${addon.pkg.name}`, addon.addons, versions);
  });

  return versions;
};
