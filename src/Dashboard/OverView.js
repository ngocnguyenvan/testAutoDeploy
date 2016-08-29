import React, { Component } from 'react';
import { render } from 'react-dom';
import template from './OverView.rt';
import update from 'react-addons-update';
import { isEmpty, forEach, isEqual, upperFirst } from 'lodash'
import javascriptTodo from '../script/javascript.todo.js';
import Constant from '../Constant.js';
import { makeRequest } from '../utils/http.js'
import $, { JQuery } from 'jquery';
var OverView = React.createClass
({
	getInitialState() {
	    return {
            scan: {
                result: {}
            },
            configChart: {
                categoryLanguage: [],
                confidentiality: {},
                doctypes: {}
            }
		};
	},

    componentWillMount() {
        if(this.state.scan.result.scan_status == Constant.scan.IS_NO_SCAN) {
           this.startScan();
        }
    },

	componentDidMount() {
        javascriptTodo();
        if(this.state.scan.result.scan_status != Constant.scan.IS_NO_SCAN) {
            this.getScanResult();
        }
                      
  	},

    shouldComponentUpdate(nextProps, nextState) {
        var { scan, dataChart, configChart } = this.state,
            { categoryLanguageChart, confidentiality, doctypes } = configChart,
            nextConfig = nextState.configChart;

        return !isEqual(scan.result, nextState.scan.result) || !isEqual( configChart, nextConfig );
    },

    componentDidUpdate(prevProps, prevState) {
        var prevResult = prevState.scan.result,
            result = this.state.scan.result;

        if(!isEqual( result, prevResult )) {
            var { iconCategories } = Constant

            forEach(result.categories, (val, index) => {
                if( val.name == iconCategories[index].name )
                    val.class = iconCategories[index].class
            })

            this.updateChart( result, prevResult );
        }
    },

    startScan() {
        makeRequest({
            method: 'POST',
            path: 'api/scan/',
            success: (data) => {
                console.log('start scan', data)
            },
            error: (err) => {
                console.log('scan error', err)
            }
        })
    },
    getScanResult(){
        makeRequest({
            path: 'api/scan/',
            success: (data) => {
                var setResult = update(this.state.scan, {
                    result: { $set: data }
                });
                this.setState({ scan: setResult });
            }
        })
    },

    updateChart(result, prevResult) {
        var categoryLanguageData = [], confidentialityData = {}, doctypeData = {},
            { categoryLanguage, confidentiality, doctypes } = this.state.configChart;
        
        if( !isEqual( result.categories_chart_data, prevResult.categories_chart_data )
            || !isEqual( result.languages, prevResult.languages) ) {
            categoryLanguageData = this.categoryLanguageChart();
        } else {
            categoryLanguageData = categoryLanguage;
        }
        if( !isEqual( result.confidentialities_chart_data, prevResult.confidentialities_chart_data )) {
            confidentialityData = this.confidentialityChart();
        } else {
            confidentialityData = confidentiality;
        }
        if( !isEqual( result['doc-types'], prevResult['doc-types'] ) ) {
            doctypeData = this.doctypesChart();
        } else {
            doctypeData = doctypes;
        }

        let updateData = update(this.state.configChart, {
            categoryLanguage: { $set: categoryLanguageData },
            confidentiality: { $set: confidentialityData },
            doctypes: { $set: doctypeData }
        });

        this.setState({ configChart: updateData });
    },

    categoryLanguageChart() {
        var categoryChart = {
                name: 'Category',
                innerSize: '80%',
                disabled: false,
                colors: ['#5bc0de', '#349da2', '#7986cb', '#ed9c28', '#e36159', '#3c5896'],
                colorsHover: ['#DFF2F8', '#D7EBEC', '#E4E7F6', '#FBEBD4', '#F9DFDE', '#E4E7F6'],
                data: []
            },
            languageChart = {
                name: 'Language',
                size: '80%',
                innerSize: '60%',
                disabled: false,
                colors: [ '#2ecd71', '#9b58b5', '#33495e'],
                colorsHover: [ '#94e5b7', '#ccaada', '#98a2ad'],
                data: []
            },
            categoryLanguageChart = [],
            categoryNumber = 0,
            languageNumber = 0,
            { dataChart } = this.state,
            { languages, categories_chart_data } = this.state.scan.result;
        //add categories
        for(let i = categories_chart_data.length - 1; i >= 0; i--) {
            categoryChart.data[i] = {
                name: upperFirst(categories_chart_data[i].name),
                y: categories_chart_data[i].total_docs
            };
        }
        //add languages
        for(let i = languages.length - 1; i >= 0; i--) {
            languageChart.data[i] = {
                name: upperFirst(languages[i].name),
                y: languages[i].total_docs
            };
        }

        categoryNumber = categoryChart.data.length;
        languageNumber = languageChart.data.length;

        if(languageNumber > 1 && categoryNumber > 1) {
            categoryLanguageChart[0] = categoryChart;
            categoryLanguageChart[1] = languageChart;
        }

        if( languageNumber <= 1 && categoryNumber > 1) {
            categoryChart.innerSize = '60%';
            categoryLanguageChart[0] = categoryChart;
        }

        if( categoryNumber <= 1 && languageNumber > 1) {
            languageChart.size = '100%';
            categoryLanguageChart[0] = languageChart;
        } else {
            categoryLanguageChart[0] = categoryChart;
        }

        if( categoryNumber <= 1 && languageNumber <= 1 ) {
            categoryChart.disabled = true;
            languageChart.disabled = true;

            categoryLanguageChart[0] = categoryChart;
            categoryLanguageChart[1] = languageChart;
        }
        
        return categoryLanguageChart;
    },

    confidentialityChart() {
        var confidentialityChart = {
            name: 'Confidentiality',
            disabled: false,
            innerSize: '60%',
            colors: [ '#5bc0de', '#349da2', '#7986cb', '#ed9c28', '#e36159'],
            colorsHover: [ '#DFF2F8', '#D7EBEC', '#E4E7F6', '#FBEBD4', '#F9DFDE'],
            data: []
        }, { confidentialities_chart_data } = this.state.scan.result;
        
        for( let i = confidentialities_chart_data.length - 1; i >= 0; i-- ) {
            confidentialityChart.data[i] = {
                name: upperFirst(confidentialities_chart_data[i].name),
                y: confidentialities_chart_data[i].total_docs
            };
        }

        if( confidentialityChart.data.length <= 1 ) {
            confidentialityChart.disabled = true;
        }

        return confidentialityChart;
    },

    doctypesChart() {
        var doctypesChart = {
                name: 'Document Type',
                disabled: false,
                innerSize: '60%',
                colors: [ '#5bc0de', '#349da2', '#7986cb', '#ed9c28', '#e36159'],
                colorsHover: [ '#DFF2F8', '#D7EBEC', '#E4E7F6', '#FBEBD4', '#F9DFDE'],
                data: []
            },
            doctypes = this.state.scan.result['doc-types'];
        
        for( let i = doctypes.length - 1; i >= 0; i-- ) {
            doctypesChart.data[i] = {
                name: upperFirst(doctypes[i].name),
                y: doctypes[i].total_docs
            };
        }

        if( doctypesChart.data.length <= 1 ) {
            doctypesChart.disabled = true;
        }

        return doctypesChart;
    },

    handleFilter: function(bodyRequest) {
        if(!isEmpty(bodyRequest)) {
            makeRequest({
                method: 'POST',
                path: 'api/scan/filter/',
                params: JSON.stringify(bodyRequest),
                success: (data) => {
                    var setResult = update(this.state.scan, {
                        result: { $set: data }
                    });
                    this.setState({ scan: setResult });
                }
            })
        } else {
            this.getScanResult();
        }
    },
    
	render:template
});
module.exports = OverView;
