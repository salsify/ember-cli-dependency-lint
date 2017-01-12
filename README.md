# dependency-lint

This addon adds lint tests that verify only one version of any given addon will be activated for the final app.

## Motivation

Consider two addons, `ember-drop` and `ember-shepherd`, both of which depend on `ember-tether`, initially at version 1.0. Suppose `ember-tether` releases a new major version with breaking changes, and `ember-shepherd` updates to use it.

Your dependencies might now look like this:

```
my-app
├── ember-drop@1.0
│   └── ember-tether@1.0
└── ember-shepherd@1.1
    └── ember-tether@2.0
```

When Ember CLI builds your final application, which version of `ember-tether` is included? You'll actually end up with a merge of both versions, with files from one version clobbering files from the other whenever they have the same name. This also means either `ember-drop` or `ember-shepherd` will wind up attempting to use a version of `ember-tether` that it's not expecting.

## Solution

If you wind up in the situation described above, it may or may not immediately be obvious that something is wrong. The things that break may be subtle, or in untested edges cases in your application.

The purpose of this addon is to detect that situation as soon as it happens and inform you about it by producing a failing lint test, allowing you the opportunity to make an informed decision about how to handle it. In the `ember-tether` example above, you have several options you might choose from:

 - pin your app's `ember-shepherd` dependency to the previous version to continue using `ember-tether` 1.0 until `ember-drop` is updated
 - fork `ember-drop` and make whatever changes are necessary for it to work with `ember-tether` 2.0, then use your fork until those changes are accepted upstream
 - test whether your app still functions correctly even with the version conflict, and opt to allow it for the time being (details below)


## Build-time Addons

Some addons don't actually add files to your application tree, so they don't have the conflict problem described above. In fact, for some addons (like preprocessors such as `ember-cli-babel`), insisting on a single version is undesirable. Different addons your app uses should be able to compile using whatever tooling they like without conflicting with one another.

Out of the box, this addon automatically allows for multiple arbitrary versions of:
 - `ember-cli-htmlbars`
 - `ember-cli-babel`
 - `ember-cli-sass`
 - `ember-cli-node-assets`

Instructions for configuring allowing multiple versions of other addons (or overriding these defaults) can be found below.

## Configuration

By default, dependency-lint expects to find at most one version of any addon in an app's dependency tree, but it doesn't care precisely what that version is. To either tighten or loosen that restriction for a given addon, you can provide a [semver](https://github.com/npm/node-semver) specifier.

```js
// ember-cli-build.js
new EmberApp(defaults, {
  dependencyLint: {
    versions: {
      // Fails unless every instance of addon-a is exactly version 1.2.3
      'addon-a': '1.2.3',

      // Fails unless every instance of addon-b is either 1.2.3 or 1.2.4
      'addon-b': '1.2.3 || 1.2.4',

      // Allows any version of addon-c such that 1.0.4 <= version < 2.0.0
      'addon-c': '^1.0.4',

      // Allows any number of arbitrary versions of addon-d (default for the addons listed above in Build-time Addons)
      'addon-d': '*'
    }
  }
})
```
