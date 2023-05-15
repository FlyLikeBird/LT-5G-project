import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Select, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import MultiLineChart from './components/MultiLineChart';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';

const { Option } = Select;


function EleMonitorManager({ dispatch, user, eleMonitor, fields }) {
    const { authorized, startDate, timeType, theme } = user;
    const { allFields, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { chartInfo, optionList, currentOption, typeRule, chartLoading } = eleMonitor;
    const energyFieldInfo = allFields.filter(i=>i.energyType === currentEnergy )[0];
    const fieldList = energyFieldInfo && energyFieldInfo.energyFieldList ? energyFieldInfo.energyFieldList : [];
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'eleMonitor/initEleMonitor'});
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
                            dispatch({ type:'eleMonitor/fetchEleMonitor' });
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
                                        dispatch({ type:'eleMonitor/fetchEleMonitor' });
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
                <Select className={style['custom-select']} style={{ width:'180px', marginRight:'1rem' }} value={currentOption.code} onChange={value=>{
                    let temp = optionList.filter(i=>i.code === value)[0];
                    dispatch({ type:'eleMonitor/setCurrentOption', payload:temp });
                    dispatch({ type:'eleMonitor/updateChartInfo'});
                }}>
                    {
                        optionList.map((item)=>(
                            <Option key={item.code} value={item.code}>{ item.title }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker onDispatch={()=>dispatch({ type:'eleMonitor/fetchEleMonitor'})} />
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px)'}}>
                <MultiLineChart 
                    dispatch={dispatch} 
                    typeRule={typeRule} 
                    currentAttr={currentAttr} 
                    theme={theme} 
                    xData={chartInfo.date || []} 
                    energy={chartInfo.energy || []} 
                    energyA={ chartInfo.energyA || []} 
                    energyB={chartInfo.energyB || []} 
                    energyC={chartInfo.energyC || []} 
                    info={currentOption} 
                    startDate={startDate} 
                    timeType={timeType}
                />
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
}

export default connect(({ user, eleMonitor, fields})=>({ user, eleMonitor, fields }))(EleMonitorManager);
