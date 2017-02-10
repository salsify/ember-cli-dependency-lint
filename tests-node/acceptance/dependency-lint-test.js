'use strict';

const dedent = require('../helpers/dedent');
const expect = require('chai').expect;
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;
const ui = new (require('console-ui'))({
  outputStream: process.stdout,
  ci: process.env.CI,
});

describe('Acceptance Tests', () => {
  let app;

  before(function() {
    this.timeout(300000);

    app = new AddonTestApp();

    ui.startProgress('Creating dummy app...');
    return app.create('test-app', { fixturesPath: 'tests-node/fixtures' }).then(() => {
      ui.stopProgress();
    });
  });

  describe('valid dependencies', () => {
    beforeEach(() => {
      app.editPackageJSON((pkg) => {
        pkg['ember-addon'] = {
          paths: [
            'lib/addon-v1',
            'lib/requires-v1',
          ],
        };
      });
    });

    it('command exits with zero status and no output', function() {
      this.timeout(5000);

      return app.run('ember', 'dependency-lint').then((result) => {
        expect(result.code).to.equal(0);
        expect(result.output.join('')).not.to.include('Allowed:');
      });
    });

    it('command includes valid dependencies when requested', function() {
      this.timeout(5000);

      return app.run('ember', 'dependency-lint', '--include-valid').then((result) => {
        const expected = dedent`
          addon
          Allowed: (any single version)
          Found: 1.0.0
          test-app
          ├── addon@1.0.0
          └─┬ requires-v1
            └── addon@1.0.0

          requires-v1
          Allowed: (any single version)
          Found: 1.0.0
          test-app
          └── requires-v1@1.0.0
        `;

        expect(result.code).to.equal(0);
        expect(result.output.join('')).to.include(expected);
      });
    });

    it('generated lint tests pass', function() {
      this.timeout(30000);

      return app.run('ember', 'test').then((result) => {
        const output = result.output.join('');

        expect(result.code).to.equal(0);
        expect(output).to.match(/\nok[^\n]*DependencyLint: addon/);
        expect(output).to.match(/\nok[^\n]*DependencyLint: requires-v1/);
      });
    });
  });

  describe('invalid dependencies', () => {
    beforeEach(() => {
      app.editPackageJSON((pkg) => {
        pkg['ember-addon'] = {
          paths: [
            'lib/addon-v1',
            'lib/requires-v2',
          ],
        };
      });
    });

    it('command exits with nonzero status and shows errors', function() {
      this.timeout(5000);

      return app.run('ember', 'dependency-lint').then(
        () => Promise.reject(new Error('Expected command to fail')),
        (result) => {
          const output = result.output.join('');

          expect(result.code).to.equal(1);

          expect(output).to.include(dedent`
            addon
            Allowed: (any single version)
            Found: 1.0.0, 2.0.0
            test-app
            ├── addon@1.0.0
            └─┬ requires-v2
              └── addon@2.0.0
          `);

          expect(output).not.to.include(dedent`
            requires-v2
            Allowed: (any single version)
            Found: 1.0.0
          `);
        }
      );
    });

    it('command includes valid dependencies when requested', function() {
      this.timeout(5000);

      return app.run('ember', 'dependency-lint', '--include-valid').then(
        () => Promise.reject(new Error('Expected command to fail')),
        (result) => {
          const output = result.output.join('');

          expect(result.code).to.equal(1);

          expect(output).to.include(dedent`
            addon
            Allowed: (any single version)
            Found: 1.0.0, 2.0.0
            test-app
            ├── addon@1.0.0
            └─┬ requires-v2
              └── addon@2.0.0
          `);

          expect(output).to.include(dedent`
            requires-v2
            Allowed: (any single version)
            Found: 1.0.0
          `);
        }
      );
    });

    it('generated lint tests fail', function() {
      this.timeout(30000);

      return app.run('ember', 'test').then(
        () => Promise.reject(new Error('Expected command to fail')),
        (result) => {
          const output = result.output.join('');

          expect(result.code).to.equal(1);
          expect(output).to.match(/\nnot ok[^\n]*DependencyLint: addon/);
          expect(output).to.match(/\nok[^\n]*DependencyLint: requires-v2/);
        }
      );
    });
  });

  describe('custom configuration', () => {
    before(() => {
      app.editPackageJSON((pkg) => {
        pkg['ember-addon'] = {
          paths: [
            'lib/addon-with-custom-version-specifier',
          ],
        };
      });
    });

    it('honors explicit version specifiers', function() {
      this.timeout(5000);

      return app.run('ember', 'dependency-lint').then(
        () => Promise.reject(new Error('Expected command to fail')),
        (result) => {
          const output = result.output.join('');

          expect(result.code).to.equal(1);

          expect(output).to.include(dedent`
            addon-with-custom-version-specifier
            Allowed: xxx
            Found: 1.0.0
            test-app
            └── addon-with-custom-version-specifier@1.0.0
          `);
        }
      );
    });
  });
});
