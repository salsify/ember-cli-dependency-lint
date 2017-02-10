# ember-cli-dependency-lint [![Build Status](https://travis-ci.org/salsify/ember-cli-dependency-lint.svg?branch=master)](https://travis-ci.org/salsify/ember-cli-dependency-lint)

This addon adds lint tests that verify only one version of any given addon will be activated in the final built application.

## Motivation

Suppose you're happily building an application using [`ember-modal-dialog`](https://github.com/yapplabs/ember-modal-dialog), which in turn relies on [`ember-wormhole`](https://github.com/yapplabs/ember-wormhole) at `0.3.x`. You then go add [`ember-power-select`](https://github.com/cibernox/ember-power-select), which relies also relies on `ember-wormhole` via [`ember-basic-dropdown`](https://github.com/cibernox/ember-basic-dropdown), but at `0.5.x`. Your dependencies might now look like this:

```
my-app
├─┬ ember-modal-dialog
│ └── ember-wormhole@0.3.6
└─┬ ember-power-select
  └─┬ ember-basic-dropdown
    └── ember-wormhole@0.5.1
```

Your package manager notices the conflicting version requirements for `ember-wormhole` and helpfully makes sure each addon gets the version it's asking for. But your final built application will only have one copy of `ember-wormhole`—which version will it be?

In the end, Ember CLI will merge both versions together, with files from one version clobbering files from the other whenever they have the same name. This also means either `ember-modal-dialog` or `ember-power-select` will wind up attempting to use a version of `ember-wormhole` that it's not expecting, which can lead to anything from hard exceptions to subtle behavioral bugs.

## Solution

In the scenario described above, the version conflict arose because of adding a new dependency, but it can also happen when you update an existing one. Regardless of how it happens, it may or may not immediately be obvious that something is wrong. The things that break may be subtle, or in untested edges cases in your application.

The purpose of this addon is to detect that situation as soon as it happens and inform you about it, allowing you the opportunity to make an informed decision about how to handle it.

### Usage

For each addon in your project, ember-cli-dependency-lint will create a passing or failing test case depending on whether you have conflicting versions of that addon present. This way, the next time you run your tests after introducing a dependency conflict, you'll immediately know about the problem.

![image](https://cloud.githubusercontent.com/assets/108688/22833669/c5d35a9a-ef80-11e6-8043-9c6de18e8d6e.png)

You can also manually run `ember dependency-lint` to get a more detailed report. This can be useful while debugging a dependency conflict, as it's much faster than rebuilding your test suite each time.

![image](https://cloud.githubusercontent.com/assets/108688/22833728/009c1bd0-ef81-11e6-853c-8516f13b58fd.png)

Run `ember help dependency-lint` for more details on this command.

### Dealing with Conflicts

In the `ember-wormhole` example above, you have several options you might choose from:

 - pin your app's `ember-power-select` dependency to an older version that uses `ember-wormhole` 0.3 (if one exists) until `ember-modal-dialog` is updated
 - fork `ember-modal-dialog` and make whatever changes are necessary for it to work with `ember-wormhole` 0.5, then use your fork until those changes are accepted upstream
 - test whether your app still functions correctly even with the version conflict, and opt to allow it for the time being (details below)

### Build-time Addons

Some addons don't actually add files to your application tree, so they don't have the conflict problem described above. In fact, for some addons (like preprocessors such as `ember-cli-babel`), insisting on a single version is undesirable. Different addons your app uses should be able to compile using whatever tooling they like without conflicting with one another.

Out of the box, this addon automatically allows for multiple arbitrary versions of:
 - `ember-cli-htmlbars`
 - `ember-cli-babel`
 - `ember-cli-sass`
 - `ember-cli-node-assets`

Instructions for allowing multiple versions of other addons (or overriding these defaults) can be found below.

## Configuration

Configuration for this addon is specified in a dedicated file in your project's `config` folder. For apps, this will be `config/dependency-lint.js`, and for addons, this will be the dummy app's `tests/dummy/config/dependency-lint.js`.

### Lint Tests

For each addon dependency in your project, ember-cli-dependency-lint will generate a passing or failing test case (similar to other linting addons like `ember-cli-eslint`). If you only ever want to manually check your dependencies, you can set the `generateTests` flag to `false`.

```js
// config/dependency-lint.js
module.exports = {
  generateTests: false
};
```

### Allowed Versions

Out of the box, ember-cli-dependency-lint expects to find at most one version of any addon in an app's dependency tree, but it doesn't care precisely what that version is. To either tighten or loosen that restriction for a given addon, you can provide a [semver](https://github.com/npm/node-semver) specifier.

```js
// config/dependency-lint.js
module.exports = {
  allowedVersions: {
    // Fails unless every instance of addon-a is exactly version 1.2.3
    'addon-a': '1.2.3',

    // Fails unless every instance of addon-b is either 1.2.3 or 1.2.4
    'addon-b': '1.2.3 || 1.2.4',

    // Allows any version of addon-c such that 1.0.4 <= version < 2.0.0
    'addon-c': '^1.0.4',

    // Allows any number of arbitrary versions of addon-d (default for the addons listed above in Build-time Addons)
    'addon-d': '*'
  }
};
```
