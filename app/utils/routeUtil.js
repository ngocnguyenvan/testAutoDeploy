import UserStore from '../stores/UserStore';
import objectPath from 'object-path';

export var authenticationDefaultPath = '/auth';

export function redirectToAuth(nextState, replace) {
	replace({
		pathname: authenticationDefaultPath,
		query: {
			redirect: objectPath.get( nextState, 'location.pathname' ) || authenticationDefaultPath
		}
	});
}

/**
 * authenticationRequired
 *
 * Ensures that the user is authenticated when accessing this route.
 *
 * @param {Object} req - server side only request object
 * @param {Object} nextState
 * @param {Function} replace
 * @returns {void}
 */
export function authenticationRequired(req, nextState, replace ) {
	if (!process.env.BROWSER) {
		if (!req.ylopoSession || !req.ylopoSession.isAuthenticated()) {
			redirectToAuth(nextState, replace);
		}
	}
	else if (!UserStore.isAuthenticated()) {
		redirectToAuth(nextState, replace);
	}
}

/**
 * authenticationCheck
 *
 * returns true/false based upon this user being authenticated
 *
 * @param {Object} req - server side only request object
 * @returns {Boolean}
 */
export function authenticationCheck(req) {
	if (!process.env.BROWSER) {
		return req.ylopoSession && req.ylopoSession.isAuthenticated();
	}
	else {
		return UserStore.isAuthenticated();
	}
}

export function authenticatedGetDefaultRedirectPath() {
	return '/';
}

export default {
	authenticationDefaultPath,
	redirectToAuth,
	authenticationCheck,
	authenticationRequired,
	authenticatedGetDefaultRedirectPath
};
