import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spin, Switch, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import style from '../EleMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import Loading from '@/pages/components/Loading';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const wrapperStyle = {
    width:'33.3%',
    height:'50%',
}
const contentStyle = {
    backgroundColor:'#3b5b85'
}
const infoStyle = {
    display:'inline-block',
    verticalAlign:'top',
    width:'33.3%',
    overflow:'hidden',
    textOverflow:'ellipsis',
    whiteSpace:'nowrap',
    fontSize:'0.8rem',
    color:'#fff'
}
const energyTypes = {
    0:{ type_name:'总', type_code:'total', type_id:0, unit:'kgce' },
    1:{ type_name:'电', type_code:'ele', type_id:1, unit:'kwh' },
    2:{ type_name:'水', type_code:'water', type_id:2, unit:'m³'},
    3:{ type_name:'气', type_code:'gas', type_id:3, unit:'m³'},
    7:{ type_name:'燃气', type_code:'combust', type_id:7, unit:'m³'},
    4:{ type_name:'热', type_code:'hot', type_id:4, unit:'GJ' },
    8:{ type_name:'压缩空气', type_code:'compressed', type_id:8, unit:'m³'},
};
function MachDetail({ dispatch, machLoading, info, data }){
    const [referDate, setReferDate] = useState(moment(new Date()));
    const inputRef = useRef();
    useEffect(()=>{
        dispatch({ type:'highVol/fetchMeterDetail', payload:{ currentDate:referDate, energyType:info.energyType, machId:info.machId }});
    },[]);
    return (
        <div style={{ height:'100%', position:'relative' }}>
            {
                machLoading
                ?
                <Loading />
                :
                null
            }       
            <div className={style['inline-container']}>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']} style={{ position:'relative' }}>
                        <div style={{ position:'absolute', right:'0', top:'0'}}>
                            <div style={{ display:'inline-flex', alignItems:'center' }}>
                                <div className={style['date-picker-button-left']} onClick={()=>{
                                    let temp = new Date(referDate.format('YYYY-MM-DD'));
                                    let result = moment(temp).subtract(1,'days');
                                    dispatch({ type:'highVol/fetchMeterDetail', payload:{ currentDate:result, energyType:info.energyType, machId:info.machId }});
                                    setReferDate(result);
                                }}><LeftOutlined /></div>
                                <DatePicker size='small' ref={inputRef} locale={zhCN} allowClear={false} value={referDate} onChange={value=>{
                                    dispatch({ type:'highVol/fetchMeterDetail', payload:{ currentDate:value, energyType:info.energyType, machId:info.machId }});
                                    setReferDate(value);
                                    if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                                }} />
                                <div className={style['date-picker-button-right']} onClick={()=>{
                                    let temp = new Date(referDate.format('YYYY-MM-DD'));
                                    let result = moment(temp).add(1,'days');
                                    dispatch({ type:'highVol/fetchMeterDetail', payload:{ currentDate:result, energyType:info.energyType, machId:info.machId }});
                                    setReferDate(result);
                                }}><RightOutlined /></div>
                            </div>
                        </div>
                        <div style={{ height:'80%', marginTop:'1rem', display:'flex', justifyContent:'center', alignItems:'center' }}>
                            <div style={{ width:'50%' }}><img src={info.img} style={{ width:'100%' }} /></div>
                            <div>
                                <div className={style['text-container']}>
                                    <span>设备:</span>
                                    <span className={style['text']}>{ info.attrName || '--' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>编号:</span>
                                    <span className={style['text']}>{ info.registerCode || '--' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>支路:</span>
                                    <span className={style['text']}>{ info.fieldName || '--' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>区域:</span>
                                    <span className={style['text']}>{ info.regionName || '--' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>最近更新时间:</span>
                                    <span className={style['text']}>{ data.lastDataUpTime || '--' }</span>
                                </div>
                            </div>
                        </div>
                        {/* <div style={{ height:'30%', borderRadius:'6px', backgroundColor:'#04a3fe', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 6px' }}>
                            <div>
                                <span style={infoStyle}>
                                    <span>编号:</span>
                                    <span>{ info.registerCode }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>支路:</span>
                                    <span>{ info.fieldName || '--' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>区域:</span>
                                    <span>{ info.regionName || '--' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>线电压:</span>
                                    <span>{ data.real_time ? Math.round(data.real_time.Ullavg) + 'V' : '-- --' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>相电压:</span>
                                    <span>{ data.real_time ? Math.round(data.real_time.Uavg) + 'V' : '-- --' }</span>
                                </span>
                            </div>
                            <div>
                                
                                <span style={infoStyle}>
                                    <span>有功功率:</span>
                                    <span>{ data.real_time ? Math.round(data.real_time.P) + 'kw' : '-- --' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>状态:</span>
                                    <span>{ data.is_outline ? '离线' : '在线' }</span>
                                </span>
                            </div>
                        </div> */}
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={{ width:'66.6%', height:'100%' }}>
                    <div className={style['inline-item']} style={{ backgroundColor:'rgb(246, 247, 251)' }}>
                        <ReactEcharts 
                            notMerge={true}
                            style={{ width:'980px', height:'660px'}}
                            option={{
                                tooltip:{
                                    trigger:'axis'
                                },
                                title:{
                                    text:`用${energyTypes[info.energyType].type_name}量(${energyTypes[info.energyType].unit})`,
                                    textStyle:{
                                        fontSize:14
                                    },
                                    left:20,
                                    top:10
                                },
                                legend:{
                                    data:['用' + energyTypes[info.energyType].type_name + '量'],
                                    top:10,
                                    left:'right'
                                },
                                grid:{
                                    left:20,
                                    right:20,
                                    top:60,
                                    bottom:20,
                                    containLabel:true
                                },
                                xAxis:{
                                    type:'category',
                                    axisTick:{ show:false },
                                    axisLine:{
                                        lineStyle:{
                                            color:'#e8e8e8'
                                        }
                                    },
                                    axisLabel:{
                                        color:'#676767'
                                    },
                                    data:data.date || []
                                },
                                yAxis:{
                                    type:'value',
                                    axisLine:{ show:false },
                                    axisTick:{ show:false },
                                    splitLine:{
                                        lineStyle:{
                                            color:'#e8e8e8'
                                        }
                                    },

                                },
                                series:[{
                                    type:'line',
                                    data:data.energy || [],
                                    symbol:'none',
                                    smooth:true,
                                    itemStyle:{
                                        color:'#3a7adf'
                                    },
                                    name:'用' + energyTypes[info.energyType].type_name + '量',
                                    areaStyle:{
                                        color:{
                                            type:'linear',
                                            x:0,
                                            y:0,
                                            x2:0,
                                            y2:1,
                                            colorStops: [{
                                                offset: 0, color:'rgba(91, 150, 243, 0.2)' // 0% 处的颜色
                                            }, {
                                                offset: 0.8, color: 'transparent' // 100% 处的颜色
                                            }]
                                        }
                                    } 
                                }]
                            }}
                        />
                    </div>
                </div>   
            </div>
        </div>
        
    )
}

export default MachDetail;