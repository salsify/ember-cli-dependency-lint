const discoverAddonVersions = require('../../../lib/utils/discover-addon-versions');
const mock = require('../../helpers/mock-project');
const expect = require('chai').expect;

describe('discoverAddonVersions', () => {
  it('emits the versions at the root', () => {
    const project = mock.project('root', [
      mock.addon('foo', '1.2.3'),
      mock.addon('bar', '1.0.0'),
    ]);

    expect(discoverAddonVersions(project)).to.deep.equal({
      foo: {
        '1.2.3': [['root']],
      },
      bar: {
        '1.0.0': [['root']],
      },
    });
  });

  it('emits nested versions', () => {
    const project = mock.project('root', [
      mock.addon('foo', '1.2.3'),
      mock.addon('bar', '1.0.0', [
        mock.addon('baz', '5.0.1'),
      ]),
    ]);

    expect(discoverAddonVersions(project)).to.deep.equal({
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
    const project = mock.project('root', [
      mock.addon('foo', '1.2.3'),
      mock.addon('bar', '1.0.0', [
        mock.addon('foo', '1.2.3'),
        mock.addon('baz', '5.0.1', [
          mock.addon('foo', '1.2.3'),
        ]),
      ]),
    ]);

    expect(discoverAddonVersions(project)).to.deep.equal({
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
    const project = mock.project('root', [
      mock.addon('foo', '2.0.1'),
      mock.addon('bar', '1.0.0', [
        mock.addon('foo', '1.2.5'),
        mock.addon('baz', '5.0.1', [
          mock.addon('foo', '1.2.3'),
        ]),
      ]),
    ]);

    expect(discoverAddonVersions(project)).to.deep.equal({
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
