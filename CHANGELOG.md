# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.8] - 2023-05-29
- fixed inactive lockers synchronization

## [2.2.7] - 2023-02-03
- added ListOrders to the policies
## [2.2.6] - 2022-10-14
- updated permissions in manifest to fix 403 Forbidden error & fixed routes cache issues
- moved invoice tracking update to service events to avoid internal 429 To Many Requests error
- updated documentation for innoship locker synchronization setup

## [2.2.5] - 2022-10-11
- added missing button to `AWB Carriers Settings` and fixed uninitialised masterdata configuration

## [2.2.4] - 2022-10-05
- fixed Innopship AWBs auto-update "Too many requests" by grouping AWBs per single courier request

## [2.2.3] - 2022-09-29
- fixed bulk awb status update async calls

## [2.2.2] - 2022-08-08

## [2.2.1] - 2022-06-09
- super inline variable for pickup point update

### Added
- French, Japanese, Korean and Thai translations

### Fixed
- Spanish and Portuguese translations
- removed RO hardcoding for locations
- using a new library which converts the 2 digits country code to 3 digits country code (for saving in MasterData in VTEX)

### Fixed
- Add phoenNumbers and emails in payload

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
