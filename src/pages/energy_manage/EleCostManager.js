import React, { useEffect, useState, useRef } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import MeasureCostManager from './MeasureCostManager';
import BaseCostManager from './BaseCostManager';
import Loading from '@/pages/components/Loading';
import AdjustCostManager from './AdjustCostManager';
import style from '@/pages/IndexPage.css';


const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function EleCostManager({ dispatch, user, fields, baseCost }){
    const { timeType, startDate, endDate, authorized, theme } = user;
    const { allFields, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { activeKey, isLoading, measureCostInfo, baseCostInfo, adjustCostInfo } = baseCost;
    // console.log(fieldAttrs);
    const energyFieldInfo = allFields.filter(i=>i.energyType === currentEnergy )[0];
    const fieldList = energyFieldInfo && energyFieldInfo.energyFieldList ? energyFieldInfo.energyFieldList : [];
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'baseCost/initEleCost'});
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
                            dispatch({ type:'baseCost/fetchEleCost' });
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
                                    defaultExpandAll
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    selectedKeys={[currentAttr.key]}
                                    treeData={allFieldAttrs[currentField.fieldId]}
                                    onSelect={(selectedKeys, {node})=>{
                                        dispatch({type:'fields/setCurrentAttr', payload:node });
                                        dispatch({ type:'baseCost/fetchEleCost' });
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
    const contentItems = [
        {
            label:'电度电费',
            key:'measure',
            children:(
                Object.keys(measureCostInfo).length 
                ?
                <MeasureCostManager data={measureCostInfo} currentAttr={currentAttr} timeType={timeType} theme={theme}  />
                :
                <Skeleton active className={style['skeleton']} />
            )
        },
        {
            label:'基本电费',
            key:'base',
            children:(
               
                <BaseCostManager data={baseCostInfo} currentAttr={currentAttr} timeType={timeType} theme={theme} />
               
            )
        },
        {
            label:'力调电费',
            key:'adjust',
            children:(
                <AdjustCostManager data={adjustCostInfo} currentAttr={currentAttr} theme={theme} />
            )
        }
    ]
    const content = (
       
        <div>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                {
                    activeKey === 'measure'
                    ?
                    <CustomDatePicker noDay onDispatch={()=>dispatch({ type:'baseCost/fetchEleCost' })} />
                    :
                    <CustomDatePicker noToggle onDispatch={()=>{
                        dispatch({type:'baseCost/fetchEleCost' });
                    }} />
                }
                
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <Tabs 
                    className={style['custom-tabs'] + ' ' + style['flex-tabs']} 
                    tabBarStyle={{ paddingLeft:'20px', marginBottom:'0' }} 
                    activeKey={activeKey} 
                    items={contentItems}
                    tabBarExtraContent={{
                        right:(
                            activeKey === 'measure' 
                            ?
                            <div className={style['text']} style={{ display:'inline-flex', alignItems:'baseline', padding:'0 1rem' }}>
                                <span>总电费:</span>
                                <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px'}}>{  measureCostInfo.totalCost ? measureCostInfo.totalCost : '--' }</span>
                                <span>元</span>
                              
                            </div>
                            :
                            null
                        )
                    }}
                    onChange={activeKey=>{
                        if ( activeKey === 'measure' ) {
                            dispatch({ type:'user/toggleTimeType', payload:'2' });
                        } else {
                            dispatch({ type:'user/toggleTimeType', payload:'1' });
                        }
                        dispatch({ type:'baseCost/setActiveKey', payload:activeKey });
                        dispatch({ type:'baseCost/fetchEleCost' });
                    }} 
                />        
            </div>
        </div>
         
    );
    useEffect(()=>{
        
    },[]);
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, baseCost })=>({ user, fields, baseCost }))(EleCostManager);