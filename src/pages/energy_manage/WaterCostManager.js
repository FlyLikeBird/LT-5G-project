import React, { useEffect, useState, useRef } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import InfoItem from './components/InfoItem';
import RangeBarChart from './components/RangeBarChart';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';

const { TabPane } = Tabs;

function WaterCostManager({ dispatch, user, fields, cost, location }){
    const { timeType, startDate, endDate, currentMenu, authorized, theme } = user;
    const { allFields, energyTypes, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { isLoading, infoList, waterCost } = cost;
    const energyFieldInfo = allFields.filter(i=>i.energyType === currentEnergy )[0];
    const fieldList = energyFieldInfo && energyFieldInfo.energyFieldList ? energyFieldInfo.energyFieldList : [];
    let energyInfo = energyTypes[currentEnergy] || {};
    useEffect(()=>{ 
        if ( authorized ) {  
            // 先判断能源成本的类型，水或燃气或其他类型
            let strArr = location.pathname.split('/');
            let routePath = strArr[strArr.length - 1];
            dispatch({ type:'cost/initWaterCost', payload:routePath });
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
    
    const content = (
            
            <div style={{ height:'100%'}}>
                {
                    isLoading 
                    ?
                    <Loading />
                    :
                    null
                }
                <div style={{ height:'20%', paddingBottom:'1rem' }}>
                    {
                        infoList.map((item, index)=>(
                            <div key={index} className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:index === infoList.length - 1 ? '0' : '1rem', paddingBottom:'0'}}>
                                <div className={style['card-container']}>
                                    <InfoItem key={index} data={item} energyInfo={energyInfo} showType='cost' />
                                </div>
                            </div>
                        ))
                    }                  
                </div>
                <div style={{ height:'80%' }}>
                    <div className={style['card-container']}>
                        <RangeBarChart 
                            data={waterCost.dateData || {}}
                            energyInfo={energyInfo}
                            showType="cost" 
                            onDispatch={action=>dispatch(action)}
                            theme={user.theme}
                            timeType={timeType}
                            forWater={true}
                        /> 
                    </div>
                </div>
            </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, cost })=>({ user, fields, cost }))(WaterCostManager);