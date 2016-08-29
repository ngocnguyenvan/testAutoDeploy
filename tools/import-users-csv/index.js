"use strict";
require("babel-register");
var _ = require('lodash');
var BPromise = require('bluebird');
var fs = require('fs');
var config = require( 'config' );
var csv = require('csv');
var generatePassword = require('password-generator');
var stormpathService = require('../../server/services/stormpathService');
var clientService = require('../../server/services/clientService');
var directoryConstants = require('@ylopo/utils/dist/lib/security').directoryConstants;
BPromise.promisifyAll(csv);

var inputFilename = process.argv[2];
var emptyIndexes = [];

if (!inputFilename) {
	console.log("Must specity input filename! Usage: node index.js input.csv");
	return;
}

var inputFileContant = fs.readFileSync(inputFilename).toString('utf8');

csv.parseAsync(inputFileContant)
	.tap(function () {
		console.log(inputFilename + " file content is loaded");
	})
	.then(function(inputFileData) {
		inputFileData.shift(); // Shifting becacuse first row are headers

		return inputFileData.filter(function(inputRow, index) {
			var passed = !_.isEmpty(inputRow[4].trim()) && !_.isEmpty(inputRow[5].trim());
			if (!passed) {
				emptyIndexes.push(index);
			}
			return passed;
		}).map(function(inputRow) {
			var clientId = Number(inputRow[5].trim());
			var partyIds = [inputRow[5].trim(), inputRow[6].trim(), inputRow[7].trim(), inputRow[8].trim()]
				.filter(function(partyId) { return !_.isEmpty(partyId); });

			return {
				directory: directoryConstants.DIRECTORY_CLIENTS,
				fullName: inputRow[2].trim(),
				emailAddress: inputRow[4].trim(),
				password: customPassword(),
				customData: {
					clientId: clientId,
					permissions: partyIds.map(function(partyId) {
						return {
							partyId: Number(partyId),
							roles: ["user"]
						}
					})
				}
			};
		});
	})
	.tap(function() {
		return stormpathService.initialize();
	})
	.tap(function () {
		console.log("Stormpath initialized");
	})
	.mapSeries(function(user) {
		return stormpathService.create(user)
			.catch(function(error) {
				console.error("\nUser: ", user, "\nError: ", error);
			});
	})
	.then(function(result) {
		console.log("Stormpath accounts created:");
		console.log("Count", result.length);
		console.log("Blank lines", emptyIndexes);
		console.log("Count with blank lines", emptyIndexes.length + result.length);
		//console.log(require('util').inspect(result, false, null));
		var alreadyUsedIndexes = 0;
		var emails = (result.map(function(acc, index) {
			var returnVal = '';
			if (emptyIndexes.indexOf(index + alreadyUsedIndexes) !== -1) {
				alreadyUsedIndexes++;
				returnVal += "\n";
			}
			returnVal += 'https://stars.ylopo.com/auth/forgotPassword?emailAddress=' + acc.emailAddress;
			return returnVal;
		}));
		console.log(emails.join("\n"));
	})
	.catch(function(error){
		console.error(error);
	});

/*stormpathService.initialize()
	.then(() => stormpathService.getUsers())
	.then(function(users) {
		console.log(users);
	});*/

/* [ '',
 'Shana Gates',
 'Shana Gates',
 'Account Owner',
 'agentshanagates@gmail.com',
 '10121',
 '',
 '',
 '' ] */




function customPassword() {
	var maxLength = 10;
	var minLength = 10;
	var uppercaseMinCount = 1;
	var lowercaseMinCount = 1;
	var numberMinCount = 1;
	var specialMinCount = 1;
	var UPPERCASE_RE = /([A-Z])/g;
	var LOWERCASE_RE = /([a-z])/g;
	var NUMBER_RE = /([\d])/g;
	var SPECIAL_CHAR_RE = /([\?\-])/g;
	var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

	function isStrongEnough(password) {
		var uc = password.match(UPPERCASE_RE);
		var lc = password.match(LOWERCASE_RE);
		var n = password.match(NUMBER_RE);
		var sc = password.match(SPECIAL_CHAR_RE);
		var nr = password.match(NON_REPEATING_CHAR_RE);
		return password.length >= minLength &&
			!nr &&
			uc && uc.length >= uppercaseMinCount &&
			lc && lc.length >= lowercaseMinCount &&
			n && n.length >= numberMinCount &&
			sc && sc.length >= specialMinCount;
	}

	var password = "";
	var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
	while (!isStrongEnough(password)) {
		password = generatePassword(randomLength, false, /[\w\d\?\-]/);
	}
	return password;
}
