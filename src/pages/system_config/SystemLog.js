import React, { Component, useState, useEffect } from 'react';
import { connect } from 'dva';
import { Tabs, Table, Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';
const { TabPane } = Tabs;

const SystemLog = ({ dispatch, user, userList }) => {
    const { authorized } = user;
    const { logList, isLoading, currentPage, total } = userList;
    const [value, setValue] = useState('');
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        {
            title:'操作人',
            dataIndex:'operateUserName',
        },
        {
            title:'操作类型',
            dataIndex:'operateType'
        },
        {
            title:'操作描述',
            dataIndex:'operateDesc',
        },
        {
            title:'操作时间',
            dataIndex:'operateTime'
        },
        {
            title:'IP',
            dataIndex:'ip'
        }
        // {
        //     title:'所属公司',
        //     dataIndex:'company_id',
        //     render:(text)=>{
        //         let filterCompany = companyList.filter(i=>i.company_id == text)[0];
        //         return <div>{ filterCompany ? filterCompany.company_name : '' }</div>
        //     }
        // }
    ];
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'userList/fetchLogList'});
        }
    },[authorized])
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <div style={{ display:'flex', alignItems:'center', height:'50px', color:'#fff', padding:'1rem' }}>    
                    <Input placeholder='可输入操作人名称查询' style={{ width:'280px'}} className={style['custom-input']} allowClear value={value} onChange={e=>setValue(e.target.value)}  />
                    <Button type='primary' onClick={()=>{
                        dispatch({ type:'userList/fetchLogList', payload:{ value } });
                    }}><SearchOutlined />查询</Button>                                
                </div>
                <Table
                    columns={columns}
                    dataSource={logList|| []}
                    className={style['self-table-container'] + ' ' + style['dark']}
                    rowKey="logId"
                    bordered={true}
                    pagination={{current:currentPage, total, pageSize:12, showSizeChanger:false }}
                    onChange={(pagination)=>{
                        dispatch({type:'userList/fetchLogList', payload:{ currentPage:pagination.current, value }});                        
                    }}
                />
                {/* <Tabs activeKey={logType} className={style['custom-tabs']} onChange={activeKey=>{
                    toggleLogType(activeKey);                 
                    dispatch({type:'log/fetchLog', payload:{ logType:activeKey, page:1 }});
                    setPageNum(1);
                }}>
                    <TabPane key='login' tab='登录日志'>
                        <Table
                            columns={columns}
                            dataSource={logData.logs || []}
                            className={style['self-table-container']}
                            rowKey="log_id"
                            loading={isLoading}
                            bordered={true}
                            pagination={{current:pageNum, total:+logData.count, pageSize:pagesize, showSizeChanger:false }}
                            onChange={(pagination)=>{
                                dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}});
                                setPageNum(pagination.current);
                                
                            }}
                        />
                    </TabPane>
                    <TabPane key='action' tab='操作日志'>
                        <Table
                            columns={columns}
                            dataSource={logData.logs || []}
                            rowKey="log_id"
                            className={style['self-table-container']}
                            loading={isLoading}
                            bordered={true}
                            pagination={{current:pageNum, total:+logData.count, pageSize:pagesize, showSizeChanger:false }}
                            onChange={(pagination)=>{
                                dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}});
                                setPageNum(pagination.current);
                            }}
                        />
                    </TabPane>
                </Tabs> */}
            </div>
        </div>
    )
}

SystemLog.propTypes = {
};

export default connect(({ user, userList })=>({ user, userList }))(SystemLog);
