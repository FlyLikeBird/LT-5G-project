import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Spin, Tabs, DatePicker, message } from 'antd';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import ManualTable from './components/ManualTable';
import UploadForm from './components/UploadForm';
import style from '@/pages/IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { TabPane } = Tabs;
const { Option } = Select;

let startYear = new Date().getFullYear();
let years = [];
for(var i=0;i<30;i++){
    let temp = startYear++;
    years.push(temp);
}

function ManualManager({ dispatch, user, fields, fill }){
    let { authorized } = user;
    let { allFields, currentField, allFieldAttrs, currentAttr, currentEnergy, treeLoading, expandedKeys } = fields;
    let { fillTypes, fillList, mode, year, currentType, currentDate, currentPage, total } = fill;
    let [visible, setVisible] = useState(false);
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'fill/init'});
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
                            dispatch({ type:'fill/fetchFillInfoList' });
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
                                        dispatch({ type:'fill/fetchFillInfoList' });
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
                            dispatch({ type:'fill/fetchFillInfoList' });
                        })
                    }}
                />       
            </div>
        </div>
    );
    const content = (
        <div>
            <div style={{ height:'40px', color:'#fff' }}>                                  
                
                <Select style={{ width:'140px', marginRight:'1rem' }} className={style['custom-select']} value={currentType.type_id} onChange={value=>{
                    let temp = fillTypes.filter(i=>i.type_id === value )[0];
                    dispatch({ type:'fill/setCurrentType', payload:temp });
                    dispatch({ type:'fill/fetchFillInfoList' });

                }}>
                    {
                        fillTypes.map((item)=>(
                            <Option key={item.type_id} value={item.type_id}>{ item.type_name }</Option>
                        ))
                    }
                </Select> 
                <Select style={{ width:'100px', marginRight:'1rem' }} className={style['custom-select']} value={mode} onChange={value=>{
                    dispatch({ type:'fill/setMode', payload:value });
                    dispatch({ type:'fill/fetchFillInfoList' });
                }}>
                    <Option value={3}>年填报</Option>
                    <Option value={2}>月填报</Option>
                    <Option value={1}>日填报</Option>
                </Select>
                <DatePicker style={{ height:'28px', marginRight:'1rem' }} locale={zhCN} picker='month' value={currentDate} onChange={value=>{
                    dispatch({ type:'fill/setCurrentDate', payload:value });
                    dispatch({ type:'fill/fetchFillInfoList' });
                }} />
                <Button type='primary' onClick={()=>dispatch({ type:'fill/exportTplAsync'})} style={{ marginRight:'1rem' }}>下载模板</Button>  
                <Button type='primary' onClick={()=>setVisible(true)}>导入数据</Button>                                               
            </div>
                
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>
                    <ManualTable
                        onDispatch={action=>dispatch(action)}
                        data={fillList}
                        currentDate={currentDate}
                        currentType={currentType}
                        currentPage={currentPage}
                        mode={mode}
                    />
                </div>  
            </div>
            <Modal
                visible={visible}
                footer={null}
                title="填报导入"
                closable={false}
                destroyOnClose={true}
                onCancel={()=>setVisible(false)}
            >
                <UploadForm forFill={true} onDispatch={action=>dispatch(action)} onClose={()=>setVisible(false)} />
            </Modal>  
        </div>
    );

    return (
        <ColumnCollapse sidebar={sidebar} content={content} />    
    )
};

export default connect( ({ user, fields, fill }) => ({ user, fields, fill }))(ManualManager);
