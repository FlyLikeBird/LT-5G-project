import React, { useState } from 'react';
import { Row, Col, Table, Button, Card, Tree, Tag, Select, Skeleton, Tooltip } from 'antd';
import style from '@/pages/IndexPage.css';
let warningType = {
    '1':'安全类',
    '2':'指标类',
    '3':'通讯类'
};

function SumAlarmList({ data, forReport }){
    const columns = [
        {
            title:'告警时间',
            dataIndex:'lastWarningTime',
        },
        {
            title:'告警分类',
            dataIndex:'typeName',
            render:(value)=>{
                return <span className={style['tag-off']}>{ value }</span>
            },
        },
        {
            title:'设备名称',
            dataIndex:'attrName'
        }
    ];
    
    return (
        <Table
            columns={columns}
            dataSource={data}
            bordered={true}
            rowKey='recordId'
            size='small'
            // className={ style['self-table-container']}
            style={{ padding:'0' }}
            locale={{ emptyText:(<div style={{ margin:'1rem 0'}}>没有告警记录</div>) }}
            pagination={{ total:data.length, pageSize:10, showSizeChanger:false }}
        />
    )
};

export default SumAlarmList;