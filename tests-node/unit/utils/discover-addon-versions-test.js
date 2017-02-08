const discoverAddonVersions = require('../../../lib/utils/discover-addon-versions');
const { project, addon } = require('../../helpers/mock-project');
const { expect } = require('chai');

describe('discoverAddonVersions', () => {
  it('emits the versions at the root', () => {
    const projectInstance = project('root', [
      addon('foo', '1.2.3'),
      addon('bar', '1.0.0'),
    ]);

    expect(discoverAddonVersions(projectInstance)).to.deep.equal({
      foo: {
        '1.2.3': [['root']],
      },
      bar: {
        '1.0.0': [['root']],
      },
    });
  });

  it('emits nested versions', () => {
    const projectInstance = project('root', [
      addon('foo', '1.2.3'),
      addon('bar', '1.0.0', [
        addon('baz', '5.0.1'),
      ]),
    ]);

    expect(discoverAddonVersions(projectInstance)).to.deep.equal({
      foo: {
        '1.2.3': [['root']],
      },
      bar: {
        '1.0.0': [['root']],
      },
      baz: {
        '5.0.1': [['root', 'bar']],
      },
    });
  });

  it('coalesces same versions found in different locations', function() {
    const projectInstance = project('root', [
      addon('foo', '1.2.3'),
      addon('bar', '1.0.0', [
        addon('foo', '1.2.3'),
        addon('baz', '5.0.1', [
          addon('foo', '1.2.3'),
        ]),
      ]),
    ]);

    expect(discoverAddonVersions(projectInstance)).to.deep.equal({
      foo: {
        '1.2.3': [['root'], ['root', 'bar'], ['root', 'bar', 'baz']],
      },
      bar: {
        '1.0.0': [['root']],
      },
      baz: {
        '5.0.1': [['root', 'bar']],
      },
    });
  });

  it('records different versions found in different locations', function() {
    const projectInstance = project('root', [
      addon('foo', '2.0.1'),
      addon('bar', '1.0.0', [
        addon('foo', '1.2.5'),
        addon('baz', '5.0.1', [
          addon('foo', '1.2.3'),
        ]),
      ]),
    ]);

    expect(discoverAddonVersions(projectInstance)).to.deep.equal({
      foo: {
        '2.0.1': [['root']],
        '1.2.5': [['root', 'bar']],
        '1.2.3': [['root', 'bar', 'baz']],
      },
      bar: {
        '1.0.0': [['root']],
      },
      baz: {
        '5.0.1': [['root', 'bar']],
      },
    });
  });
});
