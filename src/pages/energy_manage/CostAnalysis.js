import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import MultiLineChart from './components/MultiLineChart';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
import { getNodeAllChildren } from '@/utils/array';


const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function CostAnalysis({ dispatch, user, fields, energy }){
    const { timeType, startDate, endDate, authorized, theme } = user;
    const { allFields, currentField, currentAttr, allFieldAttrs, currentEnergy, energyTypes, expandedKeys, treeLoading } = fields;
    const { isLoading, selectedKeys, costAnalysis, chartLoading } = energy;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'energy/initCostAnalysis'});
        }
    },[authorized]);
    const items = allFields.map(( item, index)=>{
        return { 
            label:energyTypes[item.energyType].type_name, 
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
                        .then((fieldAttrs)=>{
                            let temp = [];
                            if ( fieldAttrs.length ) {
                                temp.push({ attrId:fieldAttrs[0].attrId, attrName:fieldAttrs[0].attrName });
                                if ( fieldAttrs[0].subEnergyFieldAttr && fieldAttrs[0].subEnergyFieldAttr.length ) {
                                    fieldAttrs[0].subEnergyFieldAttr.forEach(i=>temp.push({ attrId:i.attrId, attrName:i.attrName }));
                                }
                            } 
                            dispatch({ type:'energy/setSelectedKeys', payload:temp });
                            dispatch({ type:'energy/fetchCostAnalysis' });
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
                                    checkable
                                    checkStrictly
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    checkedKeys={selectedKeys.map(i=>i.attrId)}
                                    treeData={allFieldAttrs[currentField.fieldId]}
                                    onCheck={(checkedKeys, e)=>{
                                        let { checked, checkedNodes, node }  = e;
                                        let result = checkedNodes;
                                        if ( checked ){
                                            // 选中当前节点和此节点的下一级节点                                              
                                            node.children.map(i=>{
                                                if(!result.map(i=>i.attrId).includes(i.key)) {
                                                    result.push({ attrId:i.key, attrName:i.title });
                                                }
                                            });
                                        } else {
                                            // 删除当前节点所有的子节点
                                            let childKeys = [];
                                            getNodeAllChildren(node, childKeys);
                                            result = checkedNodes.filter(i=>!childKeys.includes(i.key)).map(i=>({ attrId:i.key, attrName:i.title }));
                                        }                                    
                                        dispatch({type:'energy/setSelectedKeys', payload:result });
                                        dispatch({ type:'energy/fetchCostAnalysis' });
                                    }}
                                />
                            )
                        }
                    })}
                />
                :
                <div style={{ padding:'1rem'}}>
                    <div className={style['text']} >当前能源类型还没有设置维度</div>
                    <div style={{ marginTop:'1rem' }}><Button type="primary" onClick={()=>{
                        history.push('/energy/info_manage/field_manage');
                    }}>添加维度</Button></div>
                </div>                
            )
        }
    })
    const sidebar = (
        <div className={style['card-container']}>        
            <Tabs
                className={style['custom-tabs']}
                items={items}
                activeKey={currentEnergy}
                onChange={activeKey=>{
                    dispatch({ type:'fields/setEnergyType', payload:activeKey });
                    let temp = allFields.filter(i=>i.energyType === activeKey)[0];
                    let field = temp.energyFieldList && temp.energyFieldList.length ? temp.energyFieldList[0] : {};
                    dispatch({ type:'fields/setCurrentField', payload:field });
                    // 更新不同能源的维度属性树
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
                    })
                    .then((fieldAttrs)=>{
                        let temp = [];
                        if ( fieldAttrs && fieldAttrs.length ) {
                            temp.push({ attrId:fieldAttrs[0].attrId, attrName:fieldAttrs[0].attrName });
                            if ( fieldAttrs[0].subEnergyFieldAttr && fieldAttrs[0].subEnergyFieldAttr.length ) {
                                fieldAttrs[0].subEnergyFieldAttr.forEach(i=>temp.push({ attrId:i.attrId, attrName:i.attrName }));
                            }
                        } 
                        dispatch({ type:'energy/setSelectedKeys', payload:temp });
                        dispatch({ type:'energy/fetchCostAnalysis' });
                    })
                }}                
            /> 
        </div>
    );
    
    const content = (     
        <div>
            {
                chartLoading 
                ?
                <Loading />
                :
                null
            } 
            <div style={{ height:'40px' }}>              
                <CustomDatePicker onDispatch={()=>dispatch({ type:'energy/fetchCostAnalysis' })} />             
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>
                    <MultiLineChart data={costAnalysis} selectedKeys={selectedKeys} timeType={timeType} theme={theme} />    
                </div>
            </div>
        </div>
         
    );
   
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, energy })=>({ user, fields, energy }))(CostAnalysis);