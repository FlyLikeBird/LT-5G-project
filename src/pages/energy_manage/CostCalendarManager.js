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
import CalendarContainer from './components/CalendarContainer';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function CostCalendarManager({ dispatch, user, fields, cost }){
    const { startDate, endDate, authorized, theme } = user;
    const { allFields, energyTypes, currentField, currentAttr, allFieldAttrs, currentEnergy, expandedKeys, treeLoading } = fields;
    const { isLoading, mode, currentDate, calendarInfo } = cost;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'cost/initCalendar'});
        }
    },[authorized]);
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
                        dispatch({ type:'cost/fetchCostCalendar' });
                    })
                }}                
            /> 
        </div>
    );
    
    const content = (     
        <CalendarContainer 
            data={calendarInfo}
            currentDate={currentDate}
            energyInfo={energyTypes[currentEnergy] || {}}
            mode={mode}
            isLoading={isLoading}
            onDispatch={action=>dispatch(action)}
            theme={theme}
        />
    );
   
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, cost })=>({ user, fields, cost }))(CostCalendarManager);