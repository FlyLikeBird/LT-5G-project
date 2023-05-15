import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Spin, Tabs, message } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import EfficiencyBarChart from './components/EfficiencyBarChart';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';

const fillTypes = { 2:'产值', 5:'产量', 1:'人数', 4:'面积'};
function OutputManager({ dispatch, user, fields, efficiency }){
    let { authorized, currentMenu, timeType, theme } = user;
    let { allFields, currentField, allFieldAttrs, currentAttr, currentEnergy, expandedKeys, treeLoading } = fields;
    let { fillChart, typeId, chartLoading } = efficiency;
    useEffect(()=>{
        if ( authorized ) {
            let typeId = currentMenu.menuCode === 'energy_eff_ratio' ? 2 : currentMenu.menuCode === 'energy_eff_output' ? 5 : currentMenu.menuCode === 'energy_eff_person' ? 1 : currentMenu.menuCode === 'energy_eff_area' ?  4 : 1;
            dispatch({ type:'efficiency/initFillChart', payload:{ typeId }});
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
                            dispatch({ type:'efficiency/fetchFillChart'})
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
                                        dispatch({ type:'efficiency/fetchFillChart'})
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
                            dispatch({ type:'efficiency/fetchFillChart'})
                        })
                    }}
                />       
            </div>
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
            <div style={{ display:'flex', height:'40px', color:'#fff' }}>                                  
                <CustomDatePicker onDispatch={()=>dispatch({ type:'efficiency/fetchFillChart'})} />                                               
            </div>
                
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>
                    {
                        Object.keys(fillChart).length 
                        ?
                        <EfficiencyBarChart 
                            data={fillChart}
                            typeId={typeId} 
                            theme={theme}
                            timeType={timeType}
                        />
                        :
                        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)', fontSize:'1.2rem' }}>
                            <div>
                                <InfoCircleOutlined style={{ marginRight:'0.5rem' }} />
                                <span style={{ marginRight:'0.5rem' }}>{ `还未填报${fillTypes[typeId]}` }</span>
                                <span style={{ color:'#1890ff', cursor:'pointer' }} onClick={()=>history.push('/energy/info_manage/manual_input')}>去填报信息</span>
                            </div>
                        </div>
                    }
                </div>  
            </div>
        </div>
    );

    return (
        <ColumnCollapse sidebar={sidebar} content={content} />    
    )
};


export default connect( ({ user, fields, efficiency }) => ({ user, fields, efficiency }))(OutputManager);
