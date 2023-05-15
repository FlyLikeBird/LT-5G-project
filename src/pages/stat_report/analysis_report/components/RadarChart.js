import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

const indicatorTypes = {
    'voltage':'电压偏差',
    'freq':'频率偏差',
    'PFavg':'功率因素',
    'power':'负载率',
    'balance':'三相不平衡'
};

const typesToKeys = {
    '电压偏差':'voltage',
    '频率偏差':'freq',
    '功率因素':'PFavg',
    '负载率':'power',
    '三相不平衡':'balance'
};

function RadarChart({ data }) {
    data = { 'voltage':20, freq:40, PFavg:10, power:60, balance:5 };
    let seriesData = [], indicator = [];
    Object.keys(data).forEach(key=>{
        indicator.push({ name:indicatorTypes[key], max:100 });
        seriesData.push(data[key]);
    });
    return (    
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    trigger:'item'
                },
                radar: {
                    // shape: 'circle',
                    name: {
                        // formatter:(value, indicator)=>{
                        //     return `${value}`
                        // },
                        textStyle: {
                            color: '#fff',
                            padding:4,
                            borderRadius:10,
                            fontSize:14,
                            backgroundColor:'#09c1fd'
                        }
                    },
                    radius:'65%',
                    splitNumber:4,
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(9, 193, 253, 0.2)']
                        }
                    },
                    splitLine:{
                        lineStyle:{
                            width:3,
                            color:'#09c1fd'
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#09c1fd'
                        }
                    },
                    indicator
                },                    
                series:{
                    type: 'radar',
                    name:'综合能效',
                    symbol:'none',
                    label:{
                        distance:2
                    },
                    data: [
                        {
                            value: seriesData,
                            lineStyle:{
                                opacity:0
                            },
                            areaStyle:{
                                opacity:0.8,
                                color:'#09c1fd'
                            }
                        }

                    ]
                }
            }}
        /> 
           
    );
}

export default React.memo(RadarChart);
