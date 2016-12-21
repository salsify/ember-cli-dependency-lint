/* eslint-env node */
/* eslint quotes:0 quote-props:0 */
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "report_file": "./tmp/test-output/browser/output.xml",
  "disable_watching": true,
  "launch_in_ci": [
    "PhantomJS",
  ],
  "launch_in_dev": [
    "PhantomJS",
    "Chrome",
  ],
};
