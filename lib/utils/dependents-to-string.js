'use strict';

const archy = require('archy');

/**
 * Given an addon name, a hash of dependents by version (as returned by discoverAddonVersions),
 * and optionally a function to determine how the addon itself is printed, returns a string
 * containing a printable version of the structure.
 */
module.exports = function dependentsToString(addonName, dependents, printer) {
  const tree = {};

  for (const version of Object.keys(dependents)) {
    for (const dependent of dependents[version]) {
      let node = tree;
      for (const layer of dependent) {
        if (!node[layer]) node[layer] = {};
        node = node[layer];
      }
      node[addonName] = printer ? printer(version) : `${addonName}@${version}`;
    }
  }

  const root = Object.keys(tree)[0];
  return archy(transformTree(root, addonName, tree[root]));
};

// Transform the tree from a structure that's convenient to build into the one archy expects
function transformTree(name, addon, tree) {
  return {
    label: name,
    nodes: sortKeys(addon, tree).map((key) => {
      if (key === addon) {
        return tree[key];
      } else {
        return transformTree(key, addon, tree[key]);
      }
    }),
  };
}

// Boost the addon in question to the top, then alphabetize the rest
function sortKeys(addon, tree) {
  return Object.keys(tree).sort((a, b) => {
    if (a === addon) {
      return -1;
    } else if (b === addon) {
      return 1;
    } else {
      return a < b ? -1 : 1;
    }
  });
}
