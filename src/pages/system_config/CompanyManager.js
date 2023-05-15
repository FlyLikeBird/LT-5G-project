import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Drawer, Modal, Input, Select, Button, Popconfirm, Table, message  } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import CompanyForm from './components/CompanyForm';
import style from '../IndexPage.css';


const { Option } = Select;

function CompanyManager({ dispatch, user, userList }){
    const { authorized, AMap } = user;
    const { companyList, currentPage, total, checkedRowKeys, isLoading } = userList;
    const [value, setValue] = useState('');
    const [info, setInfo] = useState({ visible:false });
    let columns = [
        {
            title:'序号',
            width:'60px',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 14 + index + 1}`;
            }
        },
        {
            title:'公司名称',
            dataIndex:'companyName'
        },
        {
            title:'地址',
            dataIndex:'companyAddress'
        },
        {
            title:'归属地',
            render:(row)=>(<span>{`${row.province}/${row.city}/${row.area}`}</span>)
        },
        {
            title:'负责人联系方式',
            dataIndex:'linkPhone'
        },
        {
            title:'操作',
            render:row=>(
                <div>
                    <a style={{ marginRight:'0.5rem' }} onClick={()=>setInfo({ visible:true, forEdit:true, current:row })}>编辑</a>
                    <Popconfirm title={`确定删除${row.companyName}吗`} okText='确定' cancelText='取消' onConfirm={()=>{
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'userList/delCompanyAsync', payload:{ resolve, reject, companyId:row.companyId }})
                        })
                        .then(()=>{
                            message.success(`删除${row.companyName}成功`);
                        })
                        .catch(msg=>message.info(msg))
                    }}><a>删除</a></Popconfirm>   
                </div>
            )
        }
    ];
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'userList/fetchCompanys'})
        }
    },[authorized]);
    const rowSelection = {
        checkedRowKeys,
        onChange: selectedRowKeys => dispatch({type:'userList/setCheckedRowKeys', payload:selectedRowKeys }) 
    };
    
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <div style={{ display:'flex', alignItems:'center', height:'50px', color:'#fff', padding:'1rem' }}>              
                    <Input placeholder='输入公司名查询' style={{ width:'280px'}} className={style['custom-input']} allowClear value={value} onChange={e=>setValue(e.target.value)}  />
                    <Button type='primary' style={{ marginRight:'3rem' }} onClick={()=>{
                        dispatch({ type:'userList/fetchCompanys', payload:{ company_name:value } });
                    }}><SearchOutlined />查询</Button>                    
                    <Button type="primary" style={{ marginRight:'0.5rem'}} onClick={()=>setInfo({ visible:true, forEdit:false }) }>添加公司</Button>
                    <Button type='primary' onClick={()=>{
                        if ( checkedRowKeys.length ) {
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'userList/delCompanyAsync', payload:{ isPatch:true, resolve, reject }})
                            })
                            .then(()=>{
                                message.success('删除公司成功');
                            })
                            .catch(msg=>message.error(msg))
                        } else {
                            message.info('请选择要删除的设备');
                        }
                    }}>批量删除</Button>
                                                          
                </div>
                <Table
                    className={style['self-table-container'] + ' ' + style['dark']}
                    columns={columns}
                    dataSource={companyList}
                    rowKey="companyId"
                    bordered={true}
                    rowSelection={rowSelection}
                    pagination={{current:currentPage, total }}
                    onChange={(pagination)=>dispatch({type:'userList/fetchCompanys', payload:{ currentPage:pagination.current }})}
                />
                <Modal
                    title={info.forEdit ? '修改公司':'添加公司'}
                    visible={info.visible}
                    destroyOnClose={true}
                    onCancel={()=>setInfo({ visible:false, forEdit:false })}
                    footer={null}
                >
                    <CompanyForm 
                        info={info}
                        AMap={AMap}
                        onDispatch={action=>dispatch(action)}
                        onClose={()=>setInfo({ visible:false })}
                    />
                </Modal>
            </div>
            
        </div>
    )
}

export default connect(({ user, userList })=>({ user, userList }))(CompanyManager);