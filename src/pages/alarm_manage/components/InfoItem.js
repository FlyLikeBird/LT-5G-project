import React from 'react';
import { routerRedux } from 'dva/router';
import style from '@/pages/IndexPage.css';
import ReactEcharts from 'echarts-for-react';


function InfoItem({ data, onDispatch, warningColors, theme }){ 
    let { processed, notProcessed, processingRate, warningRuleGroupMap, type, text } = data;
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let pieChart = [];
    if ( warningRuleGroupMap ) {
        Object.keys(warningRuleGroupMap).forEach(type=>{
            pieChart.push({ name:type, value:warningRuleGroupMap[type] });
        })
    }
    return (
        <div className={style['card-container-wrapper']} style={{ display:'block', height:'33.3%', paddingRight:'0', paddingBottom: data.type === 'link' ? '0' : '1rem' }}>
            <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                <div className={style['card-container']} style={{ textAlign:'center', boxShadow:'none' }}>
                    <div className={style['card-title']} style={{ display:'block', borderBottom:'none', textDecoration:'underline', color:warningColors[type]}} >{`${text}告警`}</div>
                    <div className={style['card-content']}>
                        <div className={style['flex-container']}>
                            <div className={style['flex-item'] + ' ' + style['data']} style={{ color:warningColors[type]}} onClick={()=>{
                                onDispatch(routerRedux.push({
                                    pathname:'/energy/alarm_manage/alarm_execute',
                                    query: { type }
                                }))
                            }}>{ processed }件</div>
                            <div className={style['flex-item']} style={{ textAlign:'left' }}>
                                <div>已处理: <span style={{ fontWeight:'bold', color:theme === 'dark' ? '#fff' : 'rgba(0,0,0,.65)' }}>{ processed }次</span></div>
                                <div>未处理: <span style={{ fontWeight:'bold', color:theme === 'dark' ? '#fff' : 'rgba(0,0,0,.65)' }}>{ notProcessed }次</span></div>
                                <div>处理率: <span style={{ fontWeight:'bold', color:theme === 'dark' ? '#fff' : 'rgba(0,0,0,.65)' }}>{ processingRate + '%' }</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:'0', paddingBottom:'0' }}>
                <div className={style['card-container']} style={{ boxShadow:'none' }}>
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
                                top:10,
                                data:pieChart.map(i=>i.name),
                                itemWidth: 10,
                                itemHeight: 10,
                                textStyle:{
                                    color:textColor,
                                    fontSize:10
                                }
                            },
                            color:['#92d050', '#09c1fd', '#bfbfbf', '#ffff00', '#36637b', '#edab5b', '#62a4e2', '#65cae3', '#57e29f' ],
                            series:[{
                                type: 'pie',
                                radius: ['50%', '70%'],
                                center:['30%','50%'],
                                avoidLabelOverlap: false,
                                label: {
                                    position: 'inner',
                                    color:'#000',
                                    formatter:(params)=>{
                                        return params.data.value || '';
                                    }
                                },
                                
                                itemStyle:{
                                    shadowBlur: 100,
                                    shadowColor: 'rgba(0, 0, 0, 0.2)'
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
            </div>
           
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

export default React.memo(InfoItem, areEqual);