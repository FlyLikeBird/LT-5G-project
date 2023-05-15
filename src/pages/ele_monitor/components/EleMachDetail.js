import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spin, Switch, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../EleMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import MachLineChart from './MachLineChart';
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
                                {/* <div className={style['text-container']}>
                                    <span>告警:</span>
                                    <span className={style['text']} style={{ color:'#ffa63f' }}>{ currentMach.rule_name || '-- --' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>合闸状态:</span>
                                    
                                    <span className={style['text']} style={{ color:'#ffa63f' }}>
                                        <span className={IndexStyle['tag-on']} style={{ background:'green' }}>合闸</span>
                                        <Switch defaultChecked checked={true}  onChange={()=>{
                                            setModalVisible(true);
                                        }} />
                                    </span>
                                </div> */}
                            </div>
                        </div>
                        {/* <div style={{ height:'30%', borderRadius:'6px', backgroundColor:'#04a3fe', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 6px' }}>
                            <div>
                                <span style={infoStyle}>
                                    <span>设备:</span>
                                    <span>{ info.attrName }</span>
                                </span>
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
                                    <span>最近更新时间:</span>
                                    <span>{ data.lastDataUpTime || '--' }</span>
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
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>功率(kw)</div>
                        <div className={style['inline-item-content']}>
                            <MachLineChart xData={data.date || []} yData={data.p || []} />
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>相电流(A)</div>
                        <div className={style['inline-item-content']}>
                            
                            <MachLineChart xData={data.date || []} yData={data.i1 || []} y2Data={data.i2 || []} y3Data={data.i3} multi={true} />
                            
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    {/* 占位 */}
                    <div className={style['inline-item']}></div>                        
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>相电压(V)</div>
                        <div className={style['inline-item-content']}>                       
                            <MachLineChart xData={data.date || []} yData={data.u1 || []} y2Data={data.u2 || []} y3Data={data.u3 || []} multi={true} />
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>功率因素(cosΦ)</div>
                        <div className={style['inline-item-content']}>                          
                            <MachLineChart xData={data.date || []} yData={data.pfavg || []}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default MachDetail;