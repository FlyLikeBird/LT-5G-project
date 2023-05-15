import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Card, message } from 'antd';
import style from './FieldGroup.css'

function BindMeterContainer({ onDispatch, currentAttr, bindMeters, currentPage, total }){
    const [checkedRowKeys, setCheckedRowKeys] = useState([]);
    const [isAdding, setAdding] = useState(false);
    const [value, setValue] = useState('');
    useEffect(()=>{
        if ( currentAttr.attrId ) {
            onDispatch({ type:'fields/fetchAttrMeters', payload:{ isLinked:isAdding ? 1 : 0 }});
        }
    },[currentAttr]);
    useEffect(()=>{
        onDispatch({ type:'fields/fetchAttrMeters', payload:{ isLinked:isAdding ? 1 : 0 }});
    },[isAdding])
   
    const columns = [
        { title:'设备名称', dataIndex:'meterName' },
        { title:'注册码', dataIndex:'registerCode' },
        { title:'已关联属性', dataIndex:'linkAttrName', render:value=>(<span>{ value || '--' }</span>) }
    ];
            
    const rowSelection = {
        selectedRowKeys:checkedRowKeys,
        onChange: selectedRowKeys => setCheckedRowKeys(selectedRowKeys)
    };
    // console.log(checkedRowKeys);
    return (
        <Card
            style={{ width:'70%' }}
            title={
                <div className={style['button-container']}>
                    <Button type="primary" disabled={ isAdding ? true : false } onClick={()=>setAdding(true)}>添加设备</Button>
                    <Button type="primary" disabled={isAdding ? true : false}  style={{marginLeft:'6px'}} onClick={()=>{
                        if ( checkedRowKeys.length ) {
                            new Promise((resolve, reject)=>{
                                let detailIds = bindMeters.filter(i=>checkedRowKeys.includes(i.machID)).map(i=>i.detailId);
                                onDispatch({type:'fields/delAttrMeterAsync', payload:{ resolve, reject, detailIds }})
                            })
                            .then(()=>{
                                message.success('取消关联设备成功');
                                setCheckedRowKeys([]);
                            })
                            .catch(msg=>message.error(msg))
                        } else {
                            message.info('请至少选中一个设备')
                        }
                    }}>取消关联</Button>
                       
                    <Input style={{ width:'160px', marginLeft:'20px' }} placeholder='请输入设备名查询' value={value} onChange={e=>setValue(e.target.value)} />                                  
                    <Button type='primary' onClick={()=>{
                        onDispatch({ type:'fields/fetchAttrMeters', payload:{ isLinked:isAdding ? 1 : 0, meterName:value }});
                       
                    }}>查询</Button>
                    
                </div>
            }
           
            // footer={isAdding ? (
            //     <div>
            //         <Button type="primary" onClick={()=>{
            //             if ( !checkedRowKeys.length ) {
            //                 message.info('请选择要关联的设备')
            //             } else {
            //                 new Promise((resolve, reject)=>{
            //                     dispatch({type:'fieldDevice/addDevice', payload:{ resolve, reject }})   
            //                 })
            //                 .then(()=>{
            //                     dispatch({ type:'fieldDevice/toggleStatus', payload:false });
            //                 })
            //                 .catch(msg=>{
            //                     message.info(msg);
            //                 })
            //             }
            //             setValue('');
            //         }}>关联设备</Button>
            //         <Button type="primary" style={{marginLeft:'6px'}} onClick={()=>{
            //             dispatch({type:'fieldDevice/toggleStatus', payload:false});
            //             setValue('');
            //         }}>取消</Button>
            //     </div>) : null }
        >
           
            <Table 
                columns={columns} 
                dataSource={bindMeters} 
                bordered={true} 
                locale={{ emptyText: isAdding ? '没有可关联的设备' : '还没有关联任何设备'}}
                rowKey='machID'
                rowSelection={rowSelection} 
                pagination={{ current:currentPage, total, pageSize:10, showSizeChanger:false }}
                onChange={(pagination)=>{
                    onDispatch({ type:'fields/fetchAttrMeters', payload:{ isLinked:isAdding ? 1 : 0, currentPage:pagination.current }});
                }}
                title={()=>{
                    return (
                        <div style={{ display:'flex', justifyContent:'space-between', paddingRight:'1rem' }}>
                            <div style={{ color:'#000', fontSize:'1.4rem' }}>{ isAdding ? '可关联设备' : '已关联设备'}</div>
                            {
                                isAdding 
                                ?
                                <div style={{ textAlign:'left', paddingLeft:'2rem' }}>
                                    <Button type='primary' style={{ marginRight:'0.5rem' }} onClick={()=>{
                                        if ( checkedRowKeys.length ) {
                                            new Promise((resolve, reject)=>{
                                                onDispatch({type:'fields/addAttrMeterAsync', payload:{ resolve, reject, checkedRowKeys }})   
                                            })
                                            .then(()=>{
                                                setAdding(false);
                                                setCheckedRowKeys([]);
                                                message.success('关联设备成功');
                                                
                                            })
                                            .catch(msg=>{
                                                message.error(msg);
                                            })
                                        } else {
                                            message.info('请选择要关联的设备')
                                        }
                                        setValue('');
                                    }}>关联设备</Button>
                                    <Button onClick={()=>setAdding(false)}>取消</Button>
                                </div>
                                :
                                null
                            }
                        </div>
                        
                    )
                }} 
            />                          
        </Card>
    )
}


function areEqual(prevProps, nextProps){
    if ( prevProps.currentAttr !== nextProps.currentAttr || prevProps.bindMeters !== nextProps.bindMeters  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(BindMeterContainer, areEqual);