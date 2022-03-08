# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

## Unreleased

## v1.0.2 - 03/17/2017
#### Fixed                                                                                                                                                                                                                                                                 
- A version specifier of `'*'` now accepts prerelease versions as well. This is contrary to [node-semver's behavior](https://github.com/npm/node-semver#prerelease-tags), which was designed for safety when upgrading a single package across prerelease versions, but is consistent with the need to be able to designate "no really, anything goes" here. ([#5](https://github.com/salsify/ember-cli-dependency-lint/issues/5))