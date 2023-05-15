import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm, Form, Input } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import IncomingForm from './components/IncomingForm';
import style from '@/pages/IndexPage.css';

const { Option } = Select;

function IncomingManager({ dispatch, user, incoming }){
    let { authorized } = user;
    let { list, currentPage } = incoming;
    let [info, setInfo] = useState({ visible:false, forEdit:false });
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'incoming/fetchIncomingList'});
        }
    },[authorized]);
    useEffect(()=>{
        return ()=>{
        }
    },[])
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { title:'进线名称', dataIndex:'name' }, 
        // { title:'所属公司', dataIndex:'company_name' },
        { title:'变压器容量(KVA)', dataIndex:'totalKva' },
        {
            title:'操作',
            render:(row)=>{
                return (
                    <div>
                        <a onClick={()=>setInfo({ visible:true, current:row, forEdit:true })}>编辑</a>
                        <Popconfirm title="确定删除此进线吗?" okText="确定" cancelText="取消" onConfirm={()=> dispatch({type:'incoming/delIncomingAsync', payload:{ inId:row.inId }})}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ];
    return (
            <div className={style['page-container']}>
                <div className={style['card-container']}>
                    <div style={{ padding:'10px 20px 0 20px'}}>
                        <Button type="primary"  onClick={()=>setInfo({ visible:true, forEdit:false }) }>添加进线</Button>                
                    </div>
                    <Table
                        className={style['self-table-container']}
                        columns={columns}
                        dataSource={list}
                        locale={{emptyText:(<div style={{ margin:'1rem 0'}}>还没有添加进线</div>)}}
                        bordered={true}
                        rowKey="inId"
                        pagination={{ total:list.length, current:currentPage, pageSize:12, showSizeChanger:false }}
                        onChange={pagination=>{
                            dispatch({ type:'alarm/setCurrentPage', payload:pagination.current });
                        }}
                    />
                    <Modal
                        visible={info.visible}
                        footer={null}
                        width="40%"
                        destroyOnClose={true}
                        bodyStyle={{ padding:'40px'}}
                        closable={false}
                        className={style['modal-container']}
                        onCancel={()=>setInfo({})}
                    >
                        <IncomingForm info={info} onClose={()=>setInfo({})} onDispatch={action=>dispatch(action)} />
                    </Modal>
                </div>
            </div>    
             
    )
};

export default connect( ({ user, incoming }) => ({ user, incoming }))(IncomingManager);