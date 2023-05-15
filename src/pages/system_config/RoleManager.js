import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Drawer, Modal, Select, Button, Popconfirm, message, Table  } from 'antd';
import RoleForm from './components/RoleForm';
import PermissionTree from './components/PermissionTree';
import style from '../IndexPage.css';

function formatTreeData(arr){
    if ( !arr || !arr.length ) return ;
    arr.forEach((item)=>{
        item.title = item.menu_name;
        item.key = item.menu_id;
        item.children = item.child;
        if(item.children && item.children.length){
            formatTreeData(item.children);
        }
    })
}

const { Option } = Select;

function RoleManager({ dispatch, user, userList }){
    const { authorized } = user;
    const { roleList, companyList, menuList, selectedKeys } = userList;
    const [info, setInfo] = useState({ visible:false });
    const [companyVisible, setCompanyVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'userList/initRoleList'});
        }
    },[authorized])

    let columns = [
        {
            title:'角色名',
            dataIndex:'roleName'
        },
        {
            title:'排序值',
            dataIndex:'orderBy'
        },
        {
            title:'创建时间',
            dataIndex:'createTime'
        },
        {
            title:'操作',
            key:'action',
            render:(row)=>{
                return (
                    <div>
                        <a style={{ marginRight:'0.5rem' }} onClick={()=>{ setInfo({ visible:false, current:row });setDrawerVisible(true)}}>权限设置</a>
                        {/* <a onClick={e=>{
                            setInfo({ visible:true, forEdit:true, current:row });
                        }} style={{ marginRight:'0.5rem' }}>编辑</a>
                        {
                            row.roleId === 1 || row.roleId === 2 || row.roleId === 3 
                            ?
                            null
                            :
                            <Popconfirm title={`确定删除${row.roleName}吗`} okText='确定' cancelText='取消' onConfirm={()=>{
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'userList/delRoleAsync', payload:{ resolve, reject, roleId:row.roleId }})
                                })
                                .then(()=>{
                                    message.success(`删除${row.roleName}成功`);
                                })
                                .catch(msg=>message.info(msg))
                            }}><a>删除</a></Popconfirm>
                        } */}
                          
                    </div>
                )
            }
        }
    ];
    useEffect(()=>{
        return ()=>{
        }
    },[]);
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                {/* <div style={{ display:'flex', alignItems:'center', height:'50px', color:'#fff', padding:'1rem' }}>                                  
                    <Button type="primary" style={{ marginRight:'0.5rem'}} onClick={()=>setInfo({ visible:true, forEdit:false }) }>添加角色</Button>                                       
                </div> */}
                <Table
                    className={style['self-table-container'] + ' ' + style['dark']}
                    columns={columns}
                    dataSource={roleList}
                    rowKey="roleId"
                    bordered={true}
                    pagination={false}
                    // pagination={{current:+data.pageNum, total:+data.count}}
                    // onChange={(pagination)=>dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}})}
                />
                <Modal
                    title={info.forEdit ? '修改角色':'添加角色'}
                    visible={info.visible}
                    destroyOnClose={true}
                    onCancel={()=>setInfo({ visible:false, forEdit:false })}
                    footer={null}
                >
                    <RoleForm 
                        info={info}
                        onDispatch={action=>dispatch(action)}
                        onClose={()=>setInfo({ visible:false })}
                    />
                </Modal>
                {/* <Modal
                    title='选择公司企业'
                    visible={companyVisible}
                    destroyOnClose={true}
                    onCancel={()=>setCompanyVisible(false)}
                    okText='确定'
                    cancelText='取消'  
                    onOk={()=>{
                        if ( companyId ){
                            setDrawerVisible(true);
                        } else {
                            message.info('请先选择一家公司')
                        }
                    }}                  
                >
                    <span>公司企业</span>
                    <Select style={{ marginLeft:'1rem', width:'240px' }} value={companyId} onChange={value=>setCompanyId(value)}>
                        {
                            companyList.map((item)=>(
                                <Option key={item.companyId} value={item.companyId}>{ item.companyName }</Option>
                            ))
                        }
                    </Select>
                </Modal> */}
                <PermissionTree
                    visible={drawerVisible}
                    onToggleVisible={visible=>setDrawerVisible(visible)}
                    menuList={menuList}
                    info={info}
                    selectedKeys={selectedKeys}
                    onDispatch={action=>dispatch(action)}
                />
            </div>
            
        </div>
    )
}

export default connect(({ user, userList })=>({ user, userList }))(RoleManager);