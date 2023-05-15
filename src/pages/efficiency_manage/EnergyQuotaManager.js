import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, DatePicker, Tree, Select, Spin, Tabs, Radio, Form, Upload, message } from 'antd';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import QuotaBarChart from './components/QuotaBarChart';
import style from '@/pages/IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { Option } = Select;
function EnergyQuotaManager({ dispatch, user, fields, efficiency }){
    let { authorized, currentMenu, theme } = user;
    let { allFields, energyTypes, currentField, allFieldAttrs, currentAttr, currentEnergy, expandedKeys, treeLoading } = fields;
    let { energyQuota, timeType, currentDate } = efficiency;
    let energyInfo = energyTypes[currentEnergy] || {};
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'efficiency/initEnergyQuota'});
        }
    },[authorized]);
    const items = allFields.map(( item, index )=>{
        return { 
            label:item.typeName, 
            key:item.energyType,
            children:(           
                item.energyFieldList && item.energyFieldList.length  
                ?
                <Tabs
                    className={style['custom-tabs']}
                    type='card' 
                    onChange={activeKey=>{
                        let temp = item.energyFieldList.filter(i=>i.fieldId === activeKey)[0];
                        dispatch({ type:'fields/setCurrentField', payload:temp });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                        })
                        .then(()=>{
                            dispatch({ type:'efficiency/fetchEnergyQuota'});
                        })
                    }}                     
                    items={item.energyFieldList.map(field=>{
                        return {
                            label:field.fieldName,
                            key:field.fieldId,
                            children:(
                                treeLoading
                                ?
                                <Spin className={style['spin']} />
                                :
                                <Tree
                                    className={style['custom-tree']}
                                    defaultExpandAll
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    selectedKeys={[currentAttr.key]}
                                    treeData={allFieldAttrs[currentField.fieldId]}
                                    onSelect={(selectedKeys, {node})=>{
                                        dispatch({type:'fields/setCurrentAttr', payload:node });
                                        dispatch({ type:'efficiency/fetchEnergyQuota'});
                                    }}
                                />
                            )
                        }
                    })}
                />            
                :
                <div className={style['text']} style={{ padding:'1rem'}}>
                    <div>{`${item.typeName}能源类型还没有设置维度`}</div>
                    <div style={{ padding:'1rem 0'}}>
                        <Button type='primary' onClick={()=>{
                            dispatch({ type:'fields/setEnergyType', payload:item.energyType });
                            history.push('/energy/info_manage/field_manage');
                        }}>设置维度</Button>
                    </div>
                </div>
                              
            )
        }
    })
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs 
                    className={style['custom-tabs']} 
                    activeKey={currentEnergy} 
                    items={items}
                    onChange={activeKey=>{
                        dispatch({ type:'fields/setEnergyType', payload:activeKey });
                        dispatch({ type:'fields/fetchField'});
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                        })
                        .then(()=>{
                            dispatch({ type:'efficiency/fetchEnergyQuota'});
                        })
                    }}
                />       
            </div>
        </div>
    );
    const content = (
        <div>
            <div style={{ height:'40px', color:'#fff' }}>                                  
                <Select style={{ width:'160px', marginRight:'1rem' }} className={style['custom-select']} value={timeType} onChange={value=>{
                    dispatch({ type:'efficiency/setTimeType', payload:value });
                    dispatch({ type:'efficiency/fetchEnergyQuota'});
                }} >
                    <Option value={2}>年定额</Option>
                    <Option value={1}>月定额</Option>
                </Select>  
                <DatePicker style={{ height:'28px' }} picker='year' locale={zhCN} value={currentDate} allowClear={false} onChange={value=>{
                    dispatch({ type:'efficiency/setCurrentDate', payload:value });
                    dispatch({ type:'efficiency/fetchEnergyQuota'});
                }} />                                             
            </div>
                
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'20%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'50%' }}>
                        <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                            <div>
                                <div>{ `${timeType === 2 ? '年度' : '本月'}实际能耗(${energyInfo.unit})` }</div>
                                <div className={style['data']}>{ energyQuota ? energyQuota.yearActual : 0 }</div>
                            </div>
                            <div>
                                <div>{ `${timeType === 2 ? '年度' : '本月'}定额值(${energyInfo.unit})` }</div>
                                <div className={style['data']}>{ energyQuota ? energyQuota.yearQuota : 0 }</div>
                            </div>
                            <div>
                                <div>{ `${timeType === 2 ? '年度' : '本月'}剩余定额(${energyInfo.unit})` }</div>
                                <div className={style['data']}>{ energyQuota ? energyQuota.remainder : 0 }</div>
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'50%' }}>
                        <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                            <div>
                                <div>{ `上期定额值(${energyInfo.unit})` }</div>
                                <div className={style['data']}>{ energyQuota ? energyQuota.lastYearQuota : 0 }</div>
                            </div>
                            <div>
                                <div>{ `${timeType === 2 ? '年度' : '本月'}定额同比(%)` }</div>
                                <div className={style['data']}>{ energyQuota ? energyQuota.yearQuotaYoy : 0 }</div>
                            </div>    
                        </div>
                    </div>
                </div>
                <div style={{ height:'80%' }}>
                    <div className={style['card-container']}>
                        <QuotaBarChart data={energyQuota.dateData || {}} energyInfo={energyInfo} timeType={timeType} theme={theme} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ColumnCollapse sidebar={sidebar} content={content} />    
    )
};


export default connect( ({ user, fields, efficiency }) => ({ user, fields, efficiency }))(EnergyQuotaManager);
