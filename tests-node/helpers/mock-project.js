'use strict';

exports.project = function mockProject(name, addons) {
  return {
    name: () => name,
    configPath: () => require.resolve('./mock-config'),
    addons,
  };
};

exports.addon = function(name, version, children) {
  return {
    pkg: { name, version },
    addons: children || [],
  };
};
