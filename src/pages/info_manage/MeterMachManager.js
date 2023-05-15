import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Button, Popconfirm, Input, Table, Modal } from 'antd';
import AddMeterForm from './components/AddMeterForm';
import { SearchOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';

function MeterMachManager({ dispatch, user, meter }){
    const { authorized } = user;
    const [value, setValue] = useState('');
    const [info, setInfo] = useState({ visible:false, current:null });
    const { meterList, modelList, currentPage, total, checkedRowKeys, isLoading } = meter;
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'meter/fetchMeters'});
            dispatch({ type:'meter/fetchModelList'});
        }
    },[authorized]);
    const columns = [
        {
            title:'序号',
            width:'60px',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 14 + index + 1}`;
            }
        },
        {
            title: '设备名称',
            dataIndex: 'meterName'
        },
        {
            title:'识别码',
            dataIndex:'registerCode'
        },
        {
            title:'型号',
            dataIndex:'modelId',
            render:(id)=>{
                let obj = modelList.filter(i=>i.modelId === id)[0];
                return <span>{ obj ? obj.modelDesc : '--' }</span>
            }
        },
        {
            title:'添加时间',
            dataIndex:'createTime'
        },
        {
            title:'是否启用',
            dataIndex:'isAble',
            render:value=>(<span>{ value ? '未启用' : '已启用' }</span>)
        },
        {
            title:'操作',
            render:(row)=>{
                return (
                    <div>
                        <a onClick={()=>setInfo({ visible:true, forEdit:true, current:row })}>编辑</a>
                        <Popconfirm title="确定删除此设备吗?" onText="确定" cancelText="取消" onConfirm={()=>{
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'meter/delMeterAsync', payload:{ machId:row.machId, resolve, reject }})
                            })
                            .then(()=>message.success('删除' + row.meterName + '成功'))
                            .catch(msg=>message.error(msg))
                        }}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ]; 
    const rowSelection = {
        checkedRowKeys,
        onChange: selectedRowKeys => dispatch({type:'meter/setCheckedRowKeys', payload:selectedRowKeys }) 
    };
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <div style={{ display:'flex', alignItems:'center', height:'50px', color:'#fff', padding:'1rem' }}>                                  
                    <Input placeholder='可输入设备名或注册码查询' style={{ width:'280px'}} className={style['custom-input']} allowClear value={value} onChange={e=>setValue(e.target.value)}  />
                    <Button type='primary' style={{ marginRight:'3rem' }} onClick={()=>{
                        dispatch({ type:'meter/fetchMeters', payload:{ meterName:value, registerCode:value, currentPage } });
                    }}><SearchOutlined />查询</Button> 
                    <Button type="primary" style={{ marginRight:'0.5rem'}} onClick={()=>setInfo({ visible:true, forEdit:false }) }>添加设备</Button> 
                    <Button type="primary" onClick={()=>{
                        if ( !checkedRowKeys.length ) {
                            message.info('请先选择要删除的设备');
                        } else {
                            new Promise((resolve, reject)=>{
                                dispatch({type:'meter/delMeterAsync', payload:{ resolve, reject, isPatch:true }});
                            })
                            .then(()=>{
                                message.success('删除设备成功');
                            })
                            .catch(msg=>message.error(msg));
                        }
                    }}>批量删除</Button>                                
                </div>
                
                <Table
                    className={style['self-table-container'] + ' ' + style['dark']}
                    columns={columns}
                    dataSource={meterList}
                    rowKey="machId"
                    rowSelection={rowSelection}
                    pagination={{current:currentPage, total }}
                    onChange={(pagination)=>dispatch({type:'meter/fetchMeters', payload:{ currentPage:pagination.current }})}
                    locale={{
                        emptyText:<div style={{ margin:'1rem 2rem' }}>还没有添加任何设备</div>
                    }}
                />
                
                <Modal
                    title={info.forEdit ? '修改用户':'添加用户'}
                    visible={info.visible}
                    destroyOnClose={true}
                    onCancel={()=>dispatch({type:'userList/toggleVisible', payload:{ visible:false}})}
                    footer={null}
                >
                    <AddMeterForm 
                        info={info}
                        dispatch={dispatch}
                        modelList={modelList}
                        onClose={()=>setInfo({ visible:false })}
                        onDispatch={action=>dispatch(action)}
                    />
                </Modal>
            </div>         
        </div>
    )
}

export default connect(({ user, meter })=>({ user, meter }))(MeterMachManager);