const expect = require('chai').expect;
const dedent = require('../../helpers/dedent');

const dependentsToString = require('../../../lib/utils/dependents-to-string');

describe('dependentsToString', () => {
  it('prints simple trees', () => {
    const dependents = {
      '1.0.0': [
        ['foo'],
        ['foo', 'bar'],
      ],
    };

    expect(dependentsToString('my-addon', dependents)).to.equal(dedent`
      foo
      ├── my-addon@1.0.0
      └─┬ bar
        └── my-addon@1.0.0
    `);
  });

  it('hoists the addon in question and alphabetizes the rest', () => {
    const dependents = {
      '1.0.0': [
        ['root'],
        ['root', 'qqqqq'],
        ['root', 'qqqqq', 'aaaaa'],
      ],
      '1.2.3': [
        ['root', 'zzzzz'],
        ['root', 'aaaaa'],
        ['root', 'qqqqq', 'zzzzz'],
      ],
    };

    expect(dependentsToString('mmmmm', dependents)).to.equal(dedent`
      root
      ├── mmmmm@1.0.0
      ├─┬ aaaaa
      │ └── mmmmm@1.2.3
      ├─┬ qqqqq
      │ ├── mmmmm@1.0.0
      │ ├─┬ aaaaa
      │ │ └── mmmmm@1.0.0
      │ └─┬ zzzzz
      │   └── mmmmm@1.2.3
      └─┬ zzzzz
        └── mmmmm@1.2.3
    `);
  });

  it('allows for custom formatting of the addon name', () => {
    const printer = version => `${version}<->${version.split('').reverse().join('')}`;
    const dependents = {
      '1.0.0': [['foo']],
      '2.3.4': [['foo', 'bar']],
    };

    expect(dependentsToString('my-addon', dependents, printer)).to.equal(dedent`
      foo
      ├── 1.0.0<->0.0.1
      └─┬ bar
        └── 2.3.4<->4.3.2
    `);
  });
});
