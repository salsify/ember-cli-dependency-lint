const discoverAddonVersions = require('../../lib/discover-addon-versions');
const { expect } = require('chai');

describe('discoverAddonVersions', () => {
  it('emits the versions at the root', () => {
    const addons = [
      addon('foo', '1.2.3'),
      addon('bar', '1.0.0'),
    ];

    expect(discoverAddonVersions('root', addons)).to.deep.equal({
      foo: {
        '1.2.3': ['root'],
      },
      bar: {
        '1.0.0': ['root'],
      },
    });
  });

  it('emits nested versions', () => {
    const addons = [
      addon('foo', '1.2.3'),
      addon('bar', '1.0.0', [
        addon('baz', '5.0.1'),
      ]),
    ];

    expect(discoverAddonVersions('root', addons)).to.deep.equal({
      foo: {
        '1.2.3': ['root'],
      },
      bar: {
        '1.0.0': ['root'],
      },
      baz: {
        '5.0.1': ['root > bar'],
      },
    });
  });

  it('coalesces same versions found in different locations', function() {
    const addons = [
      addon('foo', '1.2.3'),
      addon('bar', '1.0.0', [
        addon('foo', '1.2.3'),
        addon('baz', '5.0.1', [
          addon('foo', '1.2.3'),
        ]),
      ]),
    ];

    expect(discoverAddonVersions('root', addons)).to.deep.equal({
      foo: {
        '1.2.3': ['root', 'root > bar', 'root > bar > baz'],
      },
      bar: {
        '1.0.0': ['root'],
      },
      baz: {
        '5.0.1': ['root > bar'],
      },
    });
  });

  it('records different versions found in different locations', function() {
    const addons = [
      addon('foo', '2.0.1'),
      addon('bar', '1.0.0', [
        addon('foo', '1.2.5'),
        addon('baz', '5.0.1', [
          addon('foo', '1.2.3'),
        ]),
      ]),
    ];

    expect(discoverAddonVersions('root', addons)).to.deep.equal({
      foo: {
        '2.0.1': ['root'],
        '1.2.5': ['root > bar'],
        '1.2.3': ['root > bar > baz'],
      },
      bar: {
        '1.0.0': ['root'],
      },
      baz: {
        '5.0.1': ['root > bar'],
      },
    });
  });

  function addon(name, version, children = []) {
    return {
      pkg: { name, version },
      addons: children,
    };
  }
});
