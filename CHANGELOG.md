# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

Formatting inspired by: [http://keepachangelog.com/](http://keepachangelog.com/)

## [v1.7.0] - 2016-08-04
#### Added
- Advanced search (LaunchDeck)
- Ability to edit lead email address (Alex)

## [v1.6.0] - 2016-07-26
#### Fixed
- Mobile layout fixes. LADEV-194
- Show _all_ stormpath accounts (instead of first 20). LADEV-210
- API Key for google AutoComplete LADEV-229
- Sorting of saved searches LADEV-224
- Sensitive error masking LADEV-233

#### Added
- Icon next to "dynamic" saved searches. LADEV-118, LADEV-222
- Script to import stormpath accounts based on CSV from Emily. LADEV-210

#### Changed
- ForgotPassword form now supports emailAddress query parameter. LADEV-210

## [v1.5.0] - 2016-06-28
#### Changed
- Added login / security identity management. (Alex) LADEV-84

## [v1.4.1] - 2016-05-18
#### Fixed
- Minor UI Fixes

#### Added
- `Created` date in lead detail box.

## [v1.4.0] - 2016-05-09
#### Changes
- Minor UI changes

## [v1.3.1] - 2016-04-25
#### Fixed
- ie11 issue with saved searches (Alex) LADEV-68
- Client specific FUB link (Ben) LADEV-107
- Consistent verbiage for FUB / Follow up Boss LADEV-102

## [v1.3.0] - 2016-04-20
#### Added
- FUB info to lead details view (Alex, Semyon)
- Expanded session details (Alex)

## [v1.2.0] - 2016-04-12
#### Changed
- `internalApplicationId` changed to a unique value: 10003.
- UI improvements around saved search editing. (Alex)

#### Added
- New tabbed views for lead activity now have favorites and sessions. (Alex)
- pre-prod deploy config

## [v1.1.0] - 2016-03-23
#### Changed
- Complete overhaul of styles (Alex).
- Saved Search create/edit (Alex).
- Security: uuid routes now enforce uuid format with regex. (Ben)
- Save `SavedSearch.params.s_locations` as stringified JSON. (Ben)

#### Fixed
- Unique session name in each environment.

#### Added
- This CHANGELOG (Ben)
