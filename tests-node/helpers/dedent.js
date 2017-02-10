'use strict';

const stripIndent = require('strip-indent');

module.exports = function dedent(parts) {
  return stripIndent(parts[0].substring(1)).trim() + '\n';
};
