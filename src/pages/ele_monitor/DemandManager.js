import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Select, Tabs, Button, message, Skeleton } from 'antd';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import DemandGauge from './components/DemandGauge';
import DemandLineChart from './components/DemandLineChart';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';

function DemandManager({ dispatch, user, eleMonitor, fields }) {
    const { authorized, startDate, timeType, theme } = user;
    const { allFields, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { demandInfo } = eleMonitor;
    const energyFieldInfo = allFields.filter(i=>i.energyType === currentEnergy )[0];
    const fieldList = energyFieldInfo && energyFieldInfo.energyFieldList ? energyFieldInfo.energyFieldList : [];
    const [activeKey, setActiveKey] = useState(1);
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'user/toggleTimeType', payload:'3' });
            dispatch({ type:'eleMonitor/initDemand'});
        }
    },[authorized]);
    const sidebar = (
        <div className={style['card-container']}>
            {
                fieldList.length 
                ?
                <Tabs
                    className={style['custom-tabs']}
                    onChange={activeKey=>{
                        let temp = fieldList.filter(i=>i.fieldId === activeKey)[0];
                        dispatch({ type:'fields/setCurrentField', payload:temp });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                        })
                        .then(()=>{
                            dispatch({ type:'eleMonitor/fetchDemandInfo'});
                        })
                    }}                     
                    items={fieldList.map(field=>{
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
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    selectedKeys={[currentAttr.key]}
                                    treeData={allFieldAttrs[currentField.fieldId]}
                                    onSelect={(selectedKeys, {node})=>{
                                        dispatch({type:'fields/setCurrentAttr', payload:node });
                                        dispatch({ type:'eleMonitor/fetchDemandInfo'});
                                    }}
                                />
                            )
                        }
                    })}
                />
                :
                <div style={{ padding:'1rem' }}>
                    <div>还没有配置维度信息</div>
                    <Button type='primary' style={{ marginTop:'1rem' }} onClick={()=>{
                        history.push('/energy/info_manage/field_manage');
                    }}>前往设置</Button>
                </div>
            }      
        </div>
    );
    const content = (
        <div style={{ position:'relative' }}>
            <div style={{ height:'40px' }}>
                {
                    activeKey === 1
                    ?
                    <CustomDatePicker noToggle onDispatch={()=>dispatch({ type:'eleMonitor/fetchDemandInfo'})} />
                    :
                    <CustomDatePicker onDispatch={()=>dispatch({ type:'eleMonitor/fetchDemandInfo'})} />
                }
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <Tabs
                    className={style['custom-tabs'] + ' ' + style['flex-tabs']}
                    activeKey={activeKey}
                    onChange={activeKey=>setActiveKey(activeKey)}
                    items={[
                        {
                            label:'实时需量',
                            key:1,
                            children:(
                                <div style={{ height:'100%' }}>
                                    <div style={{ height:'26%' }}>
                                        <div className={style['card-container-wrapper']} style={{ width:'33.3%' }}>
                                            <div className={style['card-container']}>
                                                <DemandGauge data={demandInfo} />
                                            </div>
                                        </div>
                                        <div className={style['card-container-wrapper']} style={{ width:'33.3%' }}>
                                            <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                                <div>
                                                    <div>当日最小需量(kw)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.minDemand : 0 }</div>
                                                </div>
                                                <div>
                                                    <div>当日最大需量(kw)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.maxDemand : 0 }</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={style['card-container-wrapper']} style={{ width:'33.3%' }}>
                                            <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                                <div>
                                                    <div>本月最大需量(kw)</div>
                                                    <div className={style['data']}>{ demandInfo ? Math.round(demandInfo.maxMonthDemand) : 0 }</div>
                                                </div>
                                                <div>
                                                    <div>变压器容量(kva)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.totalKva : 0 }</div>
                                                </div>
                                               
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height:'74%' }} className={style['card-container']}>
                                        <DemandLineChart data={demandInfo} multi={true} />
                                    </div>
                                </div>
                            )
                        },
                        {
                            label:'需量分析',
                            key:2,
                            children:(
                                <div style={{ height:'100%' }}>
                                    <div style={{ height:'26%' }}>
                                        <div className={style['card-container-wrapper']} style={{ width:'25%' }}>
                                            <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                                <div>
                                                    <div>平均需量(kw)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.avgDemand : 0 }</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={style['card-container-wrapper']} style={{ width:'25%' }}>
                                            <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                                <div>
                                                    <div>最大需量(kw)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.maxDemand : 0 }</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={style['card-container-wrapper']} style={{ width:'25%' }}>
                                            <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                                <div>
                                                    <div>最小需量(kw)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.minDemand : 0 }</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={style['card-container-wrapper']} style={{ width:'25%' }}>                                           
                                            <div className={style['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                                <div>
                                                    <div>需量电费效率(%)</div>
                                                    <div className={style['data']}>{ demandInfo ? demandInfo.demandEfficiency + '%' : 0 + '%' }</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height:'74%' }} className={style['card-container']}>
                                        <DemandLineChart data={demandInfo} />
                                    </div>
                                </div>
                            )
                        }
                    ]}
                />
                
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
}

export default connect(({ user, eleMonitor, fields})=>({ user, eleMonitor, fields }))(DemandManager);
