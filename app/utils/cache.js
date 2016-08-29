/*

Cache

Very simple array based cache

*/

'use strict';

var cachedCollections = [];

export default {
	getCachedCollection: (collectionName) => {
		if (!cachedCollections[collectionName]) {
			cachedCollections[collectionName] = [];
		}
		return cachedCollections[collectionName];
	}
};
