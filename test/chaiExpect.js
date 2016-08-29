/**
 * Configure chai and return the 'expect' function ready for use in tests.
 */

'use strict';

var chai = require('chai');

// We need this because regular chai is dangerous.
// Background here: https://github.com/moll/js-must#asserting-on-property-access
chai.use( require('dirty-chai') );

// turn on stack trace
chai.config.includeStack = true;

module.exports = chai.expect;
