const validateAddonVersions = require('../../lib/validate-addon-versions');
const { expect } = require('chai');

describe('validateAddonVersions', () => {
  it('passes when only one version is included with no specifier', () => {
    const dependents = { '1.2.3': ['foo', 'bar'] };

    expect(validateAddonVersions('my-addon', dependents)).to.deep.equal({
      name: 'my-addon',
      passed: true,
      errorMessage: 'Expected only one version of my-addon',
    });
  });

  it('fails when multiple versions are included with no specifier', () => {
    const dependents = {
      '1.2.3': ['foo'],
      '1.2.4': ['bar'],
    };

    expect(validateAddonVersions('my-addon', dependents)).to.deep.equal({
      name: 'my-addon',
      passed: false,
      errorMessage: [
        'Expected only one version of my-addon, but found:',
        ' - 1.2.3 (included by foo)',
        ' - 1.2.4 (included by bar)',
      ].join('\\n'),
    });
  });

  it('fails when only one version is included that doesn\'t satisfy the specifier', () => {
    const dependents = { '1.2.3': ['foo', 'bar'] };

    expect(validateAddonVersions('my-addon', dependents, '^1.2.4')).to.deep.equal({
      name: 'my-addon',
      passed: false,
      errorMessage: [
        'Expected all versions of my-addon to satisfy "^1.2.4", but found:',
        ' - 1.2.3 (included by foo, bar)',
      ].join('\\n'),
    });
  });

  it('passes when only one version is included that satisfies the specifier', () => {
    const dependents = { '1.2.3': ['foo', 'bar'] };

    expect(validateAddonVersions('my-addon', dependents, '^1.2.0')).to.deep.equal({
      name: 'my-addon',
      passed: true,
      errorMessage: 'Expected all versions of my-addon to satisfy "^1.2.0"',
    });
  });

  it('fails when multiple versions are included and one doesn\'t satisfy the specifier', () => {
    const dependents = {
      '1.2.3': ['foo', 'bar'],
      '2.0.1': ['baz'],
    };

    expect(validateAddonVersions('my-addon', dependents, '^2.0.0')).to.deep.equal({
      name: 'my-addon',
      passed: false,
      errorMessage: [
        'Expected all versions of my-addon to satisfy "^2.0.0", but found:',
        ' - 1.2.3 (included by foo, bar)',
        ' - 2.0.1 (included by baz)',
      ].join('\\n'),
    });
  });

  it('passes when multiple versions are included that satisfy the specifier', () => {
    const dependents = {
      '1.2.3': ['foo', 'bar'],
      '2.0.1': ['baz'],
    };

    expect(validateAddonVersions('my-addon', dependents, '^1.2.0 || ^2.0.0')).to.deep.equal({
      name: 'my-addon',
      passed: true,
      errorMessage: 'Expected all versions of my-addon to satisfy "^1.2.0 || ^2.0.0"',
    });
  });

  it('truncates the list of dependents in a failure after the third', () => {
    const dependents = {
      '1.2.3': ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta'],
    };

    expect(validateAddonVersions('my-addon', dependents, '^2.0.0')).to.deep.equal({
      name: 'my-addon',
      passed: false,
      errorMessage: [
        'Expected all versions of my-addon to satisfy "^2.0.0", but found:',
        ' - 1.2.3 (included by alpha, beta, gamma, and 4 others)',
      ].join('\\n'),
    });
  });
});
