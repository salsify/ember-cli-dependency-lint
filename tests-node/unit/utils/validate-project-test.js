const mock = require('../../helpers/mock-project');
const config = require('../../helpers/mock-config');
const expect = require('chai').expect;

const validateProject = require('../../../lib/utils/validate-project');

describe('validateAddonVersions', () => {
  afterEach(() => {
    config.clearConfig();
  });

  it('passes when only one version is included with no specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.2.3'),
    ]);

    expect(validateProject(project)).to.deep.equal([{
      addon: 'my-addon',
      valid: true,
      specifier: undefined,
      dependents: {
        '1.2.3': [['my-app']],
      },
    }]);
  });

  it('lists all dependents for a given version of an addon', function() {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.2.3'),
      mock.addon('foo', '1.0.0', [
        mock.addon('my-addon', '1.2.3'),
        mock.addon('bar', '1.0.0', [
          mock.addon('baz', '1.0.0', [
            mock.addon('my-addon', '1.2.3'),
          ]),
        ]),
      ]),
    ]);

    expect(validateProject(project)).to.deep.equal([
      {
        addon: 'my-addon',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.2.3': [
            ['my-app'],
            ['my-app', 'foo'],
            ['my-app', 'foo', 'bar', 'baz'],
          ],
        },
      },
      {
        addon: 'foo',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app']],
        },
      },
      {
        addon: 'bar',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app', 'foo']],
        },
      },
      {
        addon: 'baz',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app', 'foo', 'bar']],
        },
      },
    ]);
  });

  it('allows prerelease versions with a `*` specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.2.3'),
      mock.addon('foo', '1.0.0', [
        mock.addon('my-addon', '2.0.0-beta.1'),
      ]),
    ]);

    config.setConfig({
      allowedVersions: {
        'my-addon': '*',
      },
    });

    expect(validateProject(project)).to.deep.equal([
      {
        addon: 'my-addon',
        valid: true,
        specifier: '*',
        dependents: {
          '1.2.3': [['my-app']],
          '2.0.0-beta.1': [['my-app', 'foo']]
        }
      },
      {
        addon: 'foo',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app']]
        }
      }
    ]);
  });

  it('fails when multiple versions are included with no specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.2.4'),
      mock.addon('foo', '1.0.0', [
        mock.addon('my-addon', '1.2.3'),
      ]),
    ]);

    expect(validateProject(project)).to.deep.equal([
      {
        addon: 'my-addon',
        valid: false,
        specifier: undefined,
        dependents: {
          '1.2.3': [['my-app', 'foo']],
          '1.2.4': [['my-app']],
        },
      },
      {
        addon: 'foo',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app']],
        },
      },
    ]);
  });

  it('fails when only one version is included that doesn\'t satisfy the specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.2.3'),
    ]);

    config.setConfig({
      allowedVersions: {
        'my-addon': '^1.2.4',
      },
    });

    expect(validateProject(project)).to.deep.equal([{
      addon: 'my-addon',
      valid: false,
      specifier: '^1.2.4',
      dependents: {
        '1.2.3': [['my-app']],
      },
    }]);
  });

  it('passes when only one version is included that satisfies the specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.2.3'),
    ]);

    config.setConfig({
      allowedVersions: {
        'my-addon': '^1.2.0',
      },
    });

    expect(validateProject(project)).to.deep.equal([{
      addon: 'my-addon',
      valid: true,
      specifier: '^1.2.0',
      dependents: {
        '1.2.3': [['my-app']],
      },
    }]);
  });

  it('fails when multiple versions are included and one doesn\'t satisfy the specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.4.2'),
      mock.addon('foo', '1.0.0', [
        mock.addon('my-addon', '1.2.3'),
      ]),
    ]);

    config.setConfig({
      allowedVersions: {
        'my-addon': '^1.4.0',
      },
    });

    expect(validateProject(project)).to.deep.equal([
      {
        addon: 'my-addon',
        valid: false,
        specifier: '^1.4.0',
        dependents: {
          '1.2.3': [['my-app', 'foo']],
          '1.4.2': [['my-app']],
        },
      },
      {
        addon: 'foo',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app']],
        },
      },
    ]);
  });

  it('passes when multiple versions are included that satisfy the specifier', () => {
    const project = mock.project('my-app', [
      mock.addon('my-addon', '1.4.2'),
      mock.addon('foo', '1.0.0', [
        mock.addon('my-addon', '1.4.3'),
      ]),
    ]);

    config.setConfig({
      allowedVersions: {
        'my-addon': '^1.4.0',
      },
    });

    expect(validateProject(project)).to.deep.equal([
      {
        addon: 'my-addon',
        valid: true,
        specifier: '^1.4.0',
        dependents: {
          '1.4.3': [['my-app', 'foo']],
          '1.4.2': [['my-app']],
        },
      },
      {
        addon: 'foo',
        valid: true,
        specifier: undefined,
        dependents: {
          '1.0.0': [['my-app']],
        },
      },
    ]);
  });
});
