'use strict';

/**
 * Given a Project instance, traverses the addon inclusion tree to discover all included
 * versions of all addons in the build, producing a structure in the format:
 *
 *  {
 *    "addon-name": {
 *      "addon.version": [
 *        ["project", "immediate-dependent"],
 *        ["project", "path-to", "nested-dependent"]
 *      ]
 *    }
 *  }
 */
module.exports = function discoverAddonVersions(project) {
  const versions = Object.create(null);
  traverseAddonVersions([project.name()], project.addons, versions);
  return versions;
};

function traverseAddonVersions(parentPath, addons, versions) {
  for (const addon of addons) {
    // In-repo addons may have no version, but they're tied to their parent so that's okay
    if (addon.pkg.version) {
      const addonDependents = versions[addon.pkg.name] || (versions[addon.pkg.name] = Object.create(null));
      const versionDependents = addonDependents[addon.pkg.version] || (addonDependents[addon.pkg.version] = []);

      versionDependents.push(parentPath);
    }

    traverseAddonVersions(parentPath.concat(addon.pkg.name), addon.addons || [], versions);
  }
};
