import React from 'react';
import { routerRedux } from 'dva/router';
import style from '@/pages/IndexPage.css';
import ReactEcharts from 'echarts-for-react';

const warningColors = {
    'total':'#ff7862',
    'ele':'#1778d3',
    'limit':'#29ccf4',
    'link':'#58e29f'
};
function TotalPieChart({ data, theme, forReport  }){ 
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let pieData = [];
    pieData.push({
        name:'电气安全',
        value:data['电气安全'] ? data['电气安全'].warningCateTimes : 0,
        itemStyle:{ color:'#1778d3'}
    });
    pieData.push({
        name:'指标越限',
        value:data['指标越限'] ? data['指标越限'].warningCateTimes : 0,
        itemStyle:{ color:'#29ccf4'}
    });
    pieData.push({
        name:'通讯异常',
        value:data['通讯采集'] ? data['通讯采集'].warningCateTimes : 0,
        itemStyle:{ color:'#58e29f'}
    });
    
    return (          
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    trigger:'item'
                },
                legend: forReport ?
                {
                    data:pieData.map(i=>i.name),
                    left:'center',
                    itemWidth:8,
                    itemHeight:8,
                    icon:'circle',
                    orient:'horizontal',
                    textStyle:{
                        fontSize:10
                    }
                } 
                :
                {
                    data:pieData.map(i=>i.name),
                    right:29,
                    top:'middle',
                    orient:'vertical',
                    itemWidth:8,
                    itemHeight:8,
                    icon:'circle',
                    formatter:(name)=>{
                        let value = data.totalWarningTimes ? name === '通讯异常' ? data['通讯采集'].warningCateTimes : data[name].warningCateTimes : 0;
                        let ratio = data.totalWarningTimes ? name === '通讯异常' ? data['通讯采集'].warningCateTimesRate : data[name].warningCateTimesRate : 0.0;
                        return `{value|${value}}{title|次}\xa0\xa0\xa0\xa0{value|${ratio}%}\n{title|${name}}`
                    },
                    textStyle:{
                        rich: {
                            title: {
                                fontSize: 12,
                                lineHeight: 12,
                                color: textColor
                            },
                            value: {
                                fontSize: 14,
                                fontWeight:'bold',
                                lineHeight: 20,
                                color: textColor
                            }
                        }
                    }
                },
                series:[{
                    type: 'pie',
                    radius: ['60%', '70%'],
                    center: forReport ? ['50%', '50%'] : ['30%','50%'],
                    avoidLabelOverlap: false,
                    label:{
                        show:true,
                        position:'center',
                        formatter:(params)=>{
                            return `{b|总告警数}\n{a|${data.totalWarningTimes || 0}次}`
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
                    data:pieData
                }]
            }}
        />  
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(TotalPieChart, areEqual);