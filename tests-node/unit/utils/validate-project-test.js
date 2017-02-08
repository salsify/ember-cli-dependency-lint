const { project, addon } = require('../../helpers/mock-project');
const { setConfig, clearConfig } = require('../../helpers/mock-config');
const { expect } = require('chai');

const validateProject = require('../../../lib/utils/validate-project');

describe('validateAddonVersions', () => {
  afterEach(() => {
    clearConfig();
  });

  it('passes when only one version is included with no specifier', () => {
    const projectInstance = project('my-app', [
      addon('my-addon', '1.2.3'),
    ]);

    expect(validateProject(projectInstance)).to.deep.equal([{
      addon: 'my-addon',
      valid: true,
      specifier: undefined,
      dependents: {
        '1.2.3': [['my-app']],
      },
    }]);
  });

  it('lists all dependents for a given version of an addon', function() {
    const projectInstance = project('my-app', [
      addon('my-addon', '1.2.3'),
      addon('foo', '1.0.0', [
        addon('my-addon', '1.2.3'),
        addon('bar', '1.0.0', [
          addon('baz', '1.0.0', [
            addon('my-addon', '1.2.3'),
          ]),
        ]),
      ]),
    ]);

    expect(validateProject(projectInstance)).to.deep.equal([
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

  it('fails when multiple versions are included with no specifier', () => {
    const projectInstance = project('my-app', [
      addon('my-addon', '1.2.4'),
      addon('foo', '1.0.0', [
        addon('my-addon', '1.2.3'),
      ]),
    ]);

    expect(validateProject(projectInstance)).to.deep.equal([
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
    const projectInstance = project('my-app', [
      addon('my-addon', '1.2.3'),
    ]);

    setConfig({
      allowedVersions: {
        'my-addon': '^1.2.4',
      },
    });

    expect(validateProject(projectInstance)).to.deep.equal([{
      addon: 'my-addon',
      valid: false,
      specifier: '^1.2.4',
      dependents: {
        '1.2.3': [['my-app']],
      },
    }]);
  });

  it('passes when only one version is included that satisfies the specifier', () => {
    const projectInstance = project('my-app', [
      addon('my-addon', '1.2.3'),
    ]);

    setConfig({
      allowedVersions: {
        'my-addon': '^1.2.0',
      },
    });

    expect(validateProject(projectInstance)).to.deep.equal([{
      addon: 'my-addon',
      valid: true,
      specifier: '^1.2.0',
      dependents: {
        '1.2.3': [['my-app']],
      },
    }]);
  });

  it('fails when multiple versions are included and one doesn\'t satisfy the specifier', () => {
    const projectInstance = project('my-app', [
      addon('my-addon', '1.4.2'),
      addon('foo', '1.0.0', [
        addon('my-addon', '1.2.3'),
      ]),
    ]);

    setConfig({
      allowedVersions: {
        'my-addon': '^1.4.0',
      },
    });

    expect(validateProject(projectInstance)).to.deep.equal([
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
    const projectInstance = project('my-app', [
      addon('my-addon', '1.4.2'),
      addon('foo', '1.0.0', [
        addon('my-addon', '1.4.3'),
      ]),
    ]);

    setConfig({
      allowedVersions: {
        'my-addon': '^1.4.0',
      },
    });

    expect(validateProject(projectInstance)).to.deep.equal([
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
