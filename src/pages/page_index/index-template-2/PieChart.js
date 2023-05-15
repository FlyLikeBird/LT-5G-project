import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

let textMaps = {
    'baseCost':'基本电费',
    'eleCost':'电度电费',
    'adjustCost':'力调电费'
}
function PieChart({ data }) {
    const seriesData = [];
    let total = data.baseCost + data.eleCost + data.adjustCost;
    seriesData.push({
        type:'pie',
        name:'节俭空间',
        radius:['64%', '72%'],
        center:['38%','50%'],
        // avoidLabelOverlap: false,
        // roseType: 'radius',
        label:{
            show:false,
        },
        labelLine: {
            show:false
        },
            
        itemStyle: {
            borderColor:'#eaf6f8',
            borderWidth:4,
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
            return Math.random() * 200;
        },
        data: [
            { 
                value: data.baseCost, 
                name: textMaps['baseCost'], 
                itemStyle:{
                    color:'#ff9937'
                }
            },
            { 
                value:data.eleCost, 
                name: textMaps['eleCost'], 
                itemStyle:{
                    color:'#00c86e',
                }
            },
            { 
                value:data.adjustCost, 
                name: textMaps['adjustCost'], 
                itemStyle:{
                    color:'#5dbbee',
                }
            }
        ]
    });
    
    seriesData.push({
        type:'pie',
        name:'center',
        radius:'60%',
        center:['38%','50%'],
        data:[{ value:100 }],
        labelLine:{ show:false },
        label:{
            position:'center',
            show:true,
            formatter:total + '元',
            color:'rgba(0, 0, 0, 0.85)',
            fontSize: 18,
            fontWeight:'bold',
        },
        tooltip:{ show:false },
        itemStyle:{ color:'#fff' }
        // itemStyle:{
        //     color: {
        //         type: 'radial',
        //         x: 0.5,
        //         y: 0.5,
        //         r: 0.5,           
        //         colorStops: [
        //             { offset:0, color:'transparent' },
        //             { offset:1, color:'rgba(22,100,117,0.8)' }
        //         ]
        //     },
        //     shadowColor: 'rgba(255,255,255, 0.2)',
        //     shadowBlur: 10
        // }
    });
    return ( 
        
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{   
                tooltip:{
                    trigger:'item',
                    formatter:'{a}<br/>{b} :{c} ({d}%)'
                },
                legend: {
                    itemWidth:10,
                    itemHeight:10,
                    icon:'rect',
                    right:'15%',
                    top:'middle',
                    orient:'vertical',
                    // data:['基本电费','电度电费','力调电费'],
                    formatter:(name)=>{
                        let temp;
                        Object.keys(textMaps).forEach(key=>{
                            if ( textMaps[key] === name ) {
                                temp = data[key];
                            }
                        })
                        return `{value|${temp}}{unit|元}\n{unit|${name}}`
                    },
                    textStyle:{
                        rich: {
                            unit: {
                                fontSize: 12,
                                lineHeight: 20,
                                color: '#9a9a9a'
                            },
                            value: {
                                fontSize: 18,
                                fontWeight:'bold',
                                lineHeight: 24,
                                color:'rgba(0, 0, 0, 0.85)',
                                padding:[0,4,0,0]
                            }
                        }
                    }
                },
                
                series:seriesData
            }}
        /> 
           
    );
}

export default PieChart;
