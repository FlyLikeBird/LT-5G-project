import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Select, Skeleton, Tooltip, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import StackBarChart from './components/StackBarChart';
import Loading from '@/pages/components/Loading';
import EnergyFlowChart from './components/EnergyFlowChart';
import style from '@/pages/IndexPage.css';

const { Option } = Select;
const labelStyle = {
    display:'inline-block',
    textAlign:'center',
    width:'40px',
    height:'40px',
    lineHeight:'40px',
    borderRadius:'10px',
    color:'#fff',
    fontWeight:'bold',
    background:'#af2aff'
};

function EfficiencyManager({ dispatch, user, fields, efficiency }){ 
    const { authorized, timeType, theme } = user;
    const { currentEnergy, energyTypes, currentField, allFields } = fields;
    const { chartInfo, infoList, stackBarData, chartLoading } = efficiency;
    const energyFieldInfo = allFields.filter(i=>i.energyType === currentEnergy )[0];
    const fieldList = energyFieldInfo && energyFieldInfo.energyFieldList ? energyFieldInfo.energyFieldList : [];
    let energyInfo = energyTypes[currentEnergy] || {};
    useEffect(()=>{
        // 当组件卸载时重置loaded的状态
        if ( authorized ) {
            dispatch({ type:'user/toggleTimeType', payload:'2' });
            dispatch({ type:'efficiency/initEfficiency'});
        }
    },[authorized]);
    const containerRef = useRef();
    
    return (
        <div 
            className={style['page-container']} 
            ref={containerRef} 
        >
            {/* 遮罩层 */}
           
            <div style={{ height:'40px'}}>
                <Radio.Group buttonStyle='solid' size='small' style={{ marginRight:'1rem' }} value={currentEnergy} className={style['custom-radio']} onChange={(e)=>{
                    if ( chartLoading ) {
                        message.info('能流图还在加载中');
                    }
                    dispatch({ type:'fields/setEnergyType', payload:e.target.value });
                    let temp = allFields.filter(i=>i.energyType === e.target.value )[0];
                    let fieldList = temp.energyFieldList && temp.energyFieldList.length ? temp.energyFieldList : null;
                    let currentField = fieldList && fieldList.length ? fieldList[0] : {};
                    dispatch({ type:'fields/setCurrentField', payload:currentField });
                    dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                    })
                    .then(()=>{
                        dispatch({ type:'efficiency/fetchSankeyChart' });
                    })     
                }}>
                    {
                        allFields.map((item,index)=>(
                            <Radio.Button key={item.energyType} value={item.energyType}>{ item.typeName }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <Select className={style['custom-select']} style={{ width:'160px', marginRight:'1rem' }} value={currentField.fieldId} onChange={value=>{
                    
                    if ( chartLoading ) {
                        message.info('能流图还在加载中');
                    }
                    let temp = fieldList.filter(i=>i.fieldId === value )[0];
                    dispatch({ type:'fields/setCurrentField', payload:temp });
                    dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                    })
                    .then(()=>{
                        dispatch({ type:'efficiency/fetchSankeyChart' });
                    })

                }}>
                    {
                        fieldList.map(item=>(
                            <Option key={item.fieldId} value={item.fieldId}>{ item.fieldName }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker onDispatch={()=>dispatch({ type:'efficiency/fetchSankeyChart'})} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'54%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
                        <div className={style['card-container']}>
                            {
                                chartLoading 
                                ?
                                <Loading />
                                :
                                null
                            }
                            
                            <EnergyFlowChart data={chartInfo} dispatch={dispatch} energyInfo={energyInfo} theme={theme} />
                            
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                        {
                            infoList.map((item,index)=>(
                                <div key={item.key} style={{ height:'25%', paddingBottom:index === infoList.length - 1 ? '0' : '1rem' }}>
                                    <div className={style['card-container']} style={{ display:'flex', justifyContent:'space-around', alignItems:'center' }}>
                                        <div style={{ ...labelStyle, backgroundColor:item.color }}><MoneyCollectOutlined /></div>
                                        <div>
                                            <div>本年{ item.text }</div>
                                            <div>
                                                <span className={style['data']}>{ item.yearValue || '--' }</span>
                                                <span className={style['sub-text']}>{ item.key === 2 ? item.unit : energyInfo.unit + '/' + item.unit }</span>                                   
                                            </div>
                                        </div>
                                        <div>
                                            <div>本月{ item.text }</div>                               
                                            <div>
                                                <span className={style['data']}>{ item.monthValue || '--' }</span>
                                                <span className={style['sub-text']}>{ item.key === 2 ? item.unit : energyInfo.unit + '/' + item.unit }</span>                                   
                                            </div>
                                        </div>
                                    </div>                               
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div style={{ height:'46%'}}>
                    <div className={style['card-container-wrapper']} style={{ width:'100%', paddingRight:'0', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                stackBarData.length 
                                ?
                                <StackBarChart data={stackBarData} allFields={allFields} theme={theme} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>
                    </div>
                    {/* <div className={style['card-container-wrapper']} style={{ width:'30%' }}>
                        <div className={style['card-container']}></div>
                    </div> */}
                </div>
            </div>
            
        </div>
            
    )
        
}

export default connect(({ user, fields, efficiency })=>({ user, fields, efficiency }))(EfficiencyManager);
