import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Select, message, Tree, Spin, Tag } from 'antd';
import UserForm from './components/UserForm';
import style from '../IndexPage.css';

const { Option } = Select;

function AdminManager({ dispatch, user, userList }){
    const { authorized } = user;
    const { adminList, roleList, companyList, isLoading, total, currentPage, checkedRowKeys } = userList;
    const [info, setInfo] = useState({ visible:false });
    const columns = [
        {
            title:'序号',
            width:'60px',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 14 + index + 1}`;
            }
        },
        {
            title:'用户名',
            key:'userName',
            render:(value, row)=>{
                if ( +row.userId === +localStorage.getItem('user_id') ) {
                    return <span>{ row.userName } <Tag color="geekblue">登录账号</Tag></span>
                } else {
                    return <span>{ row.userName }</span>
                }
            }
        },
        {
            title:'手机号',
            dataIndex:'phone',
            render:value=>(<span>{ value || '--' }</span>)
        },
        {
            title:'邮箱',
            dataIndex:'email',
            render:value=>(<span>{ value || '--' }</span>)
        },
        // {
        //     title:'归属代理商',
        //     dataIndex:'agent_name',
        //     key:'agent_name'
        // },
        // {
        //     title:'归属公司',
        //     dataIndex:'company_name',
        //     key:'company_name'
        // },
        {
            title:'真实姓名',
            dataIndex:'realName',
        },
        {
            title:'角色类型',
            dataIndex:'roleName',
            render: value=>(<span>{ value ? value : '还未分配角色' }</span>)
        },
        {
            title:'最后登录IP',
            dataIndex:'lastLoginIp',
            render: value=>(<span>{ value ? value : '--' }</span>)
        },
        {
            title:'最后登录时间',
            dataIndex:'lastLoginTime',
            render: value=>(<span>{ value ? value : '还未登录过' }</span>)
        },
        // {
        //     title:'是否为管理员',
        //     dataIndex:'isAdmin',
        //     render:value=>(<span>{ value ? '是' : '否' }</span>)
        // },
        {
            title:'是否可登录',
            dataIndex:'isActived',
            render:(value)=>(
                <span>{ value ? '是':'否'}</span>
            )
        },
        {
            title:'操作',
            render:(row)=>(
                <div>
                    <a style={{ marginRight:'0.5rem' }} onClick={()=>setInfo({ visible:true, forEdit:true, current:row })}>编辑</a>
                    <Popconfirm title={`确定删除${row.userName}吗`} okText='确定' cancelText='取消' onConfirm={()=>{
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'userList/delUserAsync', payload:{ resolve, reject, userId:row.userId }})
                        })
                        .then(()=>{
                            message.success(`删除${row.userName}成功`);
                        })
                        .catch(msg=>message.error(msg))
                    }}><a>删除</a></Popconfirm>
                </div>
            )       
        }
    ];
    const rowSelection = {
        checkedRowKeys,
        onChange: selectedRowKeys => dispatch({type:'userList/setCheckedRowKeys', payload:selectedRowKeys })
    };
    
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'userList/initUserList'})
        }
    },[authorized])
    return (
            <div className={style['page-container']}>
                <div className={style['card-container']}>
                    <div style={{ display:'flex', alignItems:'center', height:'50px', color:'#fff', padding:'1rem' }}>                                  
                        <Button type="primary" style={{ marginRight:'0.5rem'}} onClick={()=>setInfo({ visible:true, forEdit:false }) }>添加用户</Button> 
                        <Button type="primary" onClick={()=>{
                            if ( !checkedRowKeys.length ) {
                                message.info('请先选择要删除的用户');
                            } else {
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'userList/delUserAsync', payload:{ resolve, reject, isPatch:true }});
                                })
                                .then(()=>{
                                    message.success('删除用户成功');
                                })
                                .catch(msg=>message.error(msg));
                            }
                        }}>批量删除</Button>                                     
                    </div>
                   
                    <Table 
                        rowKey="userId" 
                        columns={columns} 
                        dataSource={adminList} 
                        bordered={true}
                        className={style['self-table-container'] + ' ' + style['dark']}
                        rowSelection={rowSelection}
                        pagination={{current:currentPage, total, pageSize:14, showSizeChanger:false }}
                        onChange={(pagination)=>{
                            dispatch({type:'userList/fetchUserList', payload:{ currentPage:pagination.current}});
                        }}
                    />
                    <Modal
                        title={info.forEdit ? '修改用户':'添加用户'}
                        visible={info.visible}
                        destroyOnClose={true}
                        onCancel={()=>setInfo({ visible:false })}
                        footer={null}
                    >
                        <UserForm 
                            info={info}
                            companyList={companyList}
                            roleList={roleList}
                            onDispatch={action=>dispatch(action)}
                            onClose={()=>setInfo({ visible:false })}
                        />
                    </Modal>
                </div>         
            </div>
    )
}
AdminManager.propTypes = {
};

export default connect(({userList, user })=>({userList, user }))(AdminManager);
