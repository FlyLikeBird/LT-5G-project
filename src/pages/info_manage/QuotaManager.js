import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Spin, Tabs, Radio, Form, Upload, message } from 'antd';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import QuotaTable from './components/QuotaTable';
import UploadForm from './components/UploadForm';
import style from '@/pages/IndexPage.css';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;

let startYear = new Date().getFullYear();
let years = [];
for(var i=0;i<30;i++){
    let temp = startYear++;
    years.push(temp);
}

function QuotaManager({ dispatch, user, fields, quota }){
    let { authorized } = user;
    let { allFields, currentField, allFieldAttrs, currentAttr, currentEnergy, treeLoading, expandedKeys } = fields;
    let { fillTypes, fillList, mode, year, currentType, currentPage, total } = quota;
    let [visible, setVisible] = useState(false);
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'quota/init'});
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
                            dispatch({ type:'quota/fetchQuotaList' });
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
                                        dispatch({ type:'quota/fetchQuotaList' });
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
                            dispatch({ type:'quota/fetchQuotaList' });
                        })
                    }}
                />       
            </div>
        </div>
    );
    const content = (
        <div>
            <div style={{ display:'flex', height:'40px', color:'#fff' }}>                                  
                
                <Select style={{ width:'140px', marginRight:'1rem' }} className={style['custom-select']} value={currentType.typeId} onChange={value=>{
                    let temp = fillTypes.filter(i=>i.typeId === value )[0];
                    dispatch({ type:'quota/setCurrentType', payload:temp });
                    dispatch({ type:'quota/fetchQuotaList', payload:{ currentPage }});

                }}>
                    {
                        fillTypes.map((item)=>(
                            <Option key={item.typeId} value={item.typeId}>{ item.typeName }</Option>
                        ))
                    }
                </Select> 
                <Select style={{ width:'100px', marginRight:'1rem' }} className={style['custom-select']} value={mode} onChange={value=>{
                    dispatch({ type:'quota/setMode', payload:value });
                    dispatch({ type:'quota/fetchQuotaList', payload:{ currentPage }});
                }}>
                    <Option key={1} value={1}>月定额</Option>
                    <Option key={2} value={2}>年定额</Option>
                </Select> 
                <Select style={{ width:'140px', marginRight:'1rem' }} className={style['custom-select']} value={year} onChange={value=>{
                    dispatch({ type:'quota/setYear', payload:value });
                    dispatch({ type:'quota/fetchQuotaList', payload:{ currentPage }});
                }}>
                    {
                        years.map((value)=>(
                            <Option key={value} value={value}>{ value }</Option>
                        ))
                    }
                </Select>   
                <Button type='primary' onClick={()=>dispatch({ type:'quota/exportTplAsync'})} style={{ marginRight:'1rem' }}>下载模板</Button>  
                <Button type='primary' onClick={()=>setVisible(true)}>导入数据</Button>                                                  
            </div>
                
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>
                    <QuotaTable
                        onDispatch={action=>dispatch(action)}
                        data={fillList}
                        year={year}
                        onChangeYear={value=>setYear(value)}
                        currentType={currentType}
                        mode={mode}
                        currentPage={currentPage}
                        total={total}
                    />
                </div>  
            </div>
            <Modal
                visible={visible}
                footer={null}
                title="定额导入"
                closable={false}
                destroyOnClose={true}
                onCancel={()=>setVisible(false)}
            >
                <UploadForm onDispatch={action=>dispatch(action)} onClose={()=>setVisible(false)} />
            </Modal>  
        </div>
    );

    return (
        <ColumnCollapse sidebar={sidebar} content={content} />    
    )
};

QuotaManager.propTypes = {
};

export default connect( ({ user, quota, fields}) => ({ user, quota, fields}))(QuotaManager);
