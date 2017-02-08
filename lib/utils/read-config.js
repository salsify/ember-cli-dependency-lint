'use strict';

const path = require('path');

/**
 * Given a Project instance, returns the custom dependency-lint config
 * for that project (if any).
 */
module.exports = function(project) {
  const configDirectory = path.dirname(project.configPath());
  try {
    return require(`${configDirectory}/dependency-lint`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return {};
    } else {
      throw error;
    }
  }
};
