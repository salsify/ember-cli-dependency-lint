## Unreleased
### Breaking
- Dropped support for Node 6 and 8

## 1.1.3 Spruce Forest (December 14, 2018)
### Added
- `ember-auto-import` has been added to the default ignore list, as it is only a build-time addon
- `ember-cli-typescript` has been added to the default ignore list, as it is only a build-time addon

## 1.1.2 Stay In Line (December 10, 2018)
### Added
- `ember-cli-htmlbars-inline-precompile` has been added to the default ignore list, as it is only a build-time addon

## 1.1.1 Help Me Out (October 4, 2018)
### Added
- `ember-compatibility-helpers` has been added to the default ignore list, as it has no runtime components that could clash

## 1.0.2 Star Light, Star Bright (March 17, 2017)
### Fixed
- A version specifier of `'*'` now accepts prerelease versions as well. This is contrary to [node-semver's behavior](https://github.com/npm/node-semver#prerelease-tags), which was designed for safety when upgrading a single package across prerelease versions, but is consistent with the need to be able to designate "no really, anything goes" here. ([#5](https://github.com/salsify/ember-cli-dependency-lint/issues/5))
