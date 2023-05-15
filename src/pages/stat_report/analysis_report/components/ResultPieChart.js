import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function ResultPieChart({ data }) {
    data = { grade:80 };
    const seriesData = [];
    seriesData.push({
        type:'pie',
        name:'异常处理',
        radius:['50%', '64%'],
        center:['50%','46%'],
        // avoidLabelOverlap: false,
        // roseType: 'radius',
        label:{
            show:false,
            position:'inside',
            fontSize:14,
        },
        itemStyle:{
            borderWidth: 3,
            borderColor: '#fff',
        },
        labelLine: {
            show:false
        },
        itemStyle: {
            color: '#c23531',
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
            return Math.random() * 200;
        },
        data: [
            { 
                value: data.grade, 
                name: '已处理', 
                itemStyle:{
                    color:'#5bad04'
                }
            },
            { 
                value:data.grade && data.grade <= 100 ? 100 - (+data.grade) : 0, 
                name:'未处理', 
                itemStyle:{
                    color:'#b1c899',
                }
            }
        ]
    });
    return ( 
        
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{   
                tooltip:{
                    show:false,
                    trigger:'item',
                    formatter:'{a}<br/>{b} :{c} ({d}%)'
                },
                graphic:{
                    type:'text',
                    left:'center',
                    top:'40%',
                    style:{
                        text:data.grade ? data.grade + '分' :'',
                        textAlign:'center',
                        fill:'#000',
                        fontSize:40,
                        fontWeight:'bold'
                    }
                },
                series:seriesData
            }}
        /> 
           
    );
}

export default ResultPieChart;
