import React from 'react';
import ReactEcharts from 'echarts-for-react';


function DemandGauge({ data }){
    let { dateValueDetailMap, maxMonthDemand } = data;
    let currentHour = new Date().getHours();
    let currentDemand = 0;
    if ( dateValueDetailMap ) {
        let keys = Object.keys(dateValueDetailMap).filter(i=>{
            let temp = i.split(':')[0];
            return +temp === currentHour
        });
        let temp = keys[keys.length-1];
        currentDemand = dateValueDetailMap[temp] || 0;
    }
    return (
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                series:[
                    {
                        type:'gauge',
                        name:'当前需量',
                        center:['50%','55%'],
                        min:0,
                        max:maxMonthDemand ? maxMonthDemand : 100,
                        radius:'85%',
                        startAngle:210,
                        endAngle:-30,
                        axisLine:{
                            lineStyle:{
                                width:24,
                                color:[
                                    [ maxMonthDemand ? currentDemand/maxMonthDemand : 0,'#1890ff'],
                                    [1,'#a5e0fe']
                                ]
                            }
                        },
                        axisTick:{ show:false },
                        axisLabel:{ 
                            show:true,
                            distance:-60,
                            formatter:(value)=>{
                                if ( !maxMonthDemand ) {
                                    return '';
                                }
                                if ( value === 0 || value === maxMonthDemand ) {
                                    return Math.floor(value);
                                } else {
                                    return '';
                                }
                            }
                        },
                        splitLine:{ show:false },
                        detail:{
                            offsetCenter:[0,40],
                            fontSize:20,
                            fontWeight:'bold',
                            color:'#1890ff',
                        },
                        data:[
                            { value:Math.floor(currentDemand), name:''}
                        ]
                    }
                ]
            }}
        />
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(DemandGauge, areEqual);