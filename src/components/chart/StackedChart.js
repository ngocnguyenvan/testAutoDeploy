'use strict';
import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { forEach, isEqual } from 'lodash'
import HelpButton from '../dathena/HelpButton'

var StackedChart = React.createClass({
    displayName: 'StackedChart',

    getInitialState() {
        return {
            disabled: false,
            colorDisabled: ['#D7D8DA', '#CBCCCE', '#CFCED3', '#D8D7DC', '#CECFD1', '#CBCCCE', '#CFCED3']
        };
    },
    
    PropTypes: {
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        config: PropTypes.array.isRequired,
        help: PropTypes.string,
        style: PropTypes.object
    },

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props.config, nextProps.config) || this.state.disabled !== nextState.disabled;
    },

    componentDidUpdate(prevProps, prevState) {
        this.draw();
    },

    draw() {
        var { id, config } = this.props, chart = this;

        for( let i = config.length - 1; i >= 0; i-- ) {
            if(!(config[i].disabled != true)) {
                this.setState({ disabled: true });
            } else {
                this.setState({ disabled: false });
            }
        }   

        var div = $('#' + id);
        var parentDiv = div.parent();
        if (div.length){
            var context = null
            var chart = div.highcharts({
                chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                backgroundColor: null,
                events: {
                    load: function () {
                        var { series } = this;
                        
                        if (chart.state.disabled){
                            for( let i = series.length - 1; i >= 0; i-- ) {
                                for(let j = series[i].points.length - 1; j >= 0; j--) {

                                    series[i].points[j].graphic.attr({

                                        fill: chart.state.colorDisabled[j]

                                    });
                                }
                            }
                        }
                    }
                },
                },
                title: {
                text: ''
                },
                credits: {
                enabled: false
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<span style="color: {point.color}; font-weight: bold;">{point.name}: </span>{point.percentage:.1f}% / {point.y} Documents'
                },
                plotOptions: {
                pie: {
                        allowPointSelect: false,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        states: {
                            hover: {
                                brightness: 0,
                            }
                        },
                        showInLegend: true,
                        point:  {
                            events: {
                                mouseOver: function(event){
                                    var { series } = this, { points } = series;

                                    this.graphic.attr({
                                        fill: this.color
                                    });

                                    for(let i = points.length - 1; i >= 0; i--) {
                                        points[i].graphic.attr({
                                            fill: series.userOptions.colorsHover[i]
                                        });
                                    }
                                },
                                mouseOut: function(event) {
                                    var { series } = this, { points } = series;

                                    for(let i = points.length - 1; i >= 0; i--) {
                                        points[i].graphic.attr({
                                            fill: points[i].color
                                        });
                                    }
                                }
                            }
                        }
                    }
                },
                    
                    legend: {
                        enabled: false
                    },
                    series: config
            });
        }
    },

    render() {
        var legendChart = [], { id, title, config } = this.props,
            { disabled, colorDisabled } = this.state;
        if(config) {
            for(let i = config.length - 1; i >= 0; i--) {
                var children = [];
                for(let j = config[i].data.length - 1; j >= 0; j--) {
                    let colorSymbol = disabled === true ? colorDisabled[j] : config[i].colors[j];
                    children[j] = <li style={config[i].data.length <= 3 ? {
                                        margin: '0 auto 5px',
                                        width: config[i].data[0].name.length * 8,
                                        float: 'none'
                                    } : {}}>
                                        <i className={'legend-symbol'} style={{backgroundColor: colorSymbol }}></i>
                                    {config[i].data[j].name}
                                </li>;
                }
                legendChart[i] = React.createElement('ul', { className: 'list-unstyled chart-legend serie-' + i }, children);
            }
        }
        return (
            <section className="panel">
                <div className="panel-body widget-panel">
                    <h4 className="widget-title">{title + ' '}
                        <HelpButton classNote="overview_timeframe help_timeframe"
                                    setValue="Of the total number of documents scanned, when 99 detects two or more files, these are considered duplicates and are registered here." />
                    </h4>
                    <div className="widget-chart chart-stacked">
                        <div style={{'margin-left': '0px'}} className="chart chart-md" id={id}></div>
                        {legendChart}
                    </div>
                    { disabled &&
                        <div id={id} className="chart-disabled-overlay"></div>
                    }
                </div>
            </section>
            );
    }

});
module.exports = StackedChart;