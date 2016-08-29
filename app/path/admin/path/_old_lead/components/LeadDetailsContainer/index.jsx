'use strict';

import React from 'react'; // eslint-disable-line no-unused-vars

import LeadLoadContainer from '../../../../../../components/lead/LeadLoadContainer';
import LeadDetails from '../LeadDetails';

export default class LeadDetailsContainer extends LeadLoadContainer {
	LeadComponent = LeadDetails;
	include = [ 'party', 'party.partyWebsites', 'partyWebsite' ];
}
