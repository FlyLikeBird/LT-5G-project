import React from 'react';
import { routerRedux } from 'dva/router';
import style from '@/pages/IndexPage.css';
import ReactEcharts from 'echarts-for-react';


function TypedPieChart({ data, warningColors, theme }){ 
    let { processed, notProcessed, processingRate, warningRuleGroupMap, type, text } = data;
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let total = ( processed ? processed : 0 ) + ( notProcessed ? notProcessed : 0 );
    let pieChart = [];
    if ( warningRuleGroupMap ) {
        Object.keys(warningRuleGroupMap).forEach(type=>{
            pieChart.push({ name:type, value:warningRuleGroupMap[type] });
        })
    }
    return (
        
            <div style={{ height:'100%' }}>
                <ReactEcharts
                    notMerge={true}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        tooltip:{
                            trigger:'item'
                        },
                        legend:{
                            type:'scroll',
                            orient:'vertical',
                            align:'right',
                            right:20,
                            top:'middle',
                            data:pieChart.map(i=>i.name),
                            itemWidth: 10,
                            itemHeight: 10,
                            textStyle:{
                                color:textColor,
                                fontSize:12
                            }
                        },
                        color:['#92d050', '#09c1fd', '#bfbfbf', '#ffff00', '#36637b', '#edab5b', '#62a4e2', '#65cae3', '#57e29f' ],
                        series:[{
                            type: 'pie',
                            radius: ['60%', '70%'],
                            center:['30%','50%'],
                            avoidLabelOverlap: false,
                            label:{
                                show:true,
                                position:'center',
                                formatter:(params)=>{
                                    return `{b|${text}}\n{a|${total}次}`
                                },
                                rich:{
                                    'a':{
                                        color:textColor,
                                        fontSize:20,
                                        padding:[0,4,0,0]                                
                                    },
                                    'b':{
                                        color:'#8a8a8a',
                                        fontSize:12,
                                        padding:[6,0,6,0]
                                    }
                                }
                            }, 
                            
                            itemStyle:{
                                borderWidth:4,
                                borderColor: theme === 'dark' ? '#191a2f' : '#fff',
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: '30',
                                    fontWeight: 'bold'
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data:pieChart
                        }]
                    }}
                />
            </div>                   
           
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(TypedPieChart, areEqual);