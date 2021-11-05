# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed 
- Send payload to backend in order to enable api calls for request awb endpint

### Fixed
- Total weight processing delay that resulted in a shipping simulation with 0 weight and errors.
### Added
- Innoship AWB automatic updates can now be enabled/disabled from the innoship `Shipping List` page
- Innoship lockers functionality
### Changed
- Total weight is now editable
### Fixed
- Innoship error handling
### Removed
- Smartbill

## [0.3.1] - 2021-04-28
### Fixed
- Total weight sum and individual parcel weight input validation

## [0.3.0] - 2021-04-27
### Added
- Option to select a carrier after shipping simulation.
- Invoice shipping cost support for the `vtex.smartbill` invoicing app
- CHANGELOG support
