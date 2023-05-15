import React from 'react';
import { routerRedux } from 'dva/router';
import style from '@/pages/IndexPage.css';
import ReactEcharts from 'echarts-for-react';


function StatusPieChart({ data, warningColors, theme }){ 
    let { processed, notProcessed, processingRate, warningRuleGroupMap, type, text } = data;
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let total = ( processed ? processed : 0 ) + ( notProcessed ? notProcessed : 0 );
    let pieChart = [];
    pieChart.push({
        name:'已处理',
        value:processed,
        itemStyle:{ color:'#e6e6e6'}
    });
    pieChart.push({
        name:'未处理',
        value:notProcessed,
        itemStyle:{ color:'#198efb'}
    })
    
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
                            data:pieChart.map(i=>i.name),
                            left:'center',
                            itemWidth:8,
                            itemHeight:8,
                            icon:'circle',
                            orient:'horizontal',
                            textStyle:{
                                fontSize:10
                            }
                        },
                        series:[{
                            type: 'pie',
                            radius: ['60%', '70%'],
                            center:['50%','50%'],
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

export default React.memo(StatusPieChart, areEqual);