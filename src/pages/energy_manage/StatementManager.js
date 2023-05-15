import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import style from '../IndexPage.css';
import ReportDocument from './components/ReportDocument';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function EleStatementManager({ dispatch, fields, user, cost }){
    const { allFields, energyTypes, allFieldAttrs, currentField, currentAttr, currentEnergy, expandedKeys, treeLoading } = fields;
    const { userInfo, authorized } = user;
    const { timeRateInfo, reportInfo } = cost;
    let energyInfo = energyTypes[currentEnergy] || {};
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'cost/initStatement'});
        }
    },[authorized])
    const items = allFields.map(( item, index)=>{
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
                        .then((fieldAttrs)=>{
                            dispatch({ type:'cost/fetchCostCalendar' });
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
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    selectedKeys={[currentAttr.key]}
                                    treeData={allFieldAttrs[currentField.fieldId]}
                                    onSelect={(selectedKeys, { node })=>{
                                        dispatch({type:'fields/setCurrentAttr', payload:node });
                                        dispatch({ type:'cost/fetchCostCalendar' });
                                    }}
                                />
                            )
                        }
                    })}
                />
                :
                <div style={{ padding:'1rem'}}>
                    <div className={style['text']}>{`${item.typeName}能源类型还没有设置维度`}</div>
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
                    dispatch({ type:'fields/fetchFieldAttrs' });
                    
                }}                
            /> 
        </div>
    );
    
    const content = (
        <div>       
            {
                Object.keys(timeRateInfo).length 
                ?
                <ReportDocument 
                    theme={user.theme}
                    currentField={currentField} 
                    currentAttr={currentAttr}
                    energyInfo={energyInfo} 
                    rateInfo={timeRateInfo}
                    companyName={userInfo.companyName}
                    documentInfo={reportInfo} 
                    onDispatch={action=>dispatch(action)}
                /> 
                :
                <Spin size='large' className={style['spin']} />
            }               
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ fields, user, cost })=>({ fields, user, cost }))(EleStatementManager);