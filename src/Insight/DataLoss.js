import React, { Component } from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, Link, IndexLink, browserHistory } from 'react-router'
import template from './DataLoss.rt'
import LinkedStateMixin from 'react-addons-linked-state-mixin'
//import javascript from '../script/script.insights.js'
import $ from 'jquery'

 var DataLost = React.createClass({
  	mixins: [LinkedStateMixin],
  	getInitialState() {
	    return {
	    	
	    };
	},
	componentDidMount() 
	{
		//javascript();
	},
    render:template
});
 module.exports = DataLost;