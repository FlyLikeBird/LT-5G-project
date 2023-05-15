import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tabs, Button, Input, Select, Table, Modal, Tag } from 'antd';
import AlarmForm from './components/AlarmForm';
import style from '@/pages/IndexPage.css';
const { Option } = Select;
const statusMaps = {
    1:{ text:'未处理', color:'volcano' }, 
    2:{ text:'跟进中', color:'geekblue'},
    3:{ text:'已结单', color:'green'},
    4:{ text:'挂起', color:'magenta'}
}

const tabList = [
    { key:1, tab:'电气告警' }, { key:2, tab:'越限告警'}, { key:3, tab:'通讯告警'}
]
function AlarmList({ dispatch, user, alarm }){
    const { authorized } = user;
    const { alarmList, cateCode, isLoading, currentPage, total, actionTypes, alarmHistory } = alarm;
    const [info, setInfo] = useState({});
    const [status, setStatus] = useState(0);
    const [value, setValue] = useState('');
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'alarm/fetchAlarmList'});
            dispatch({ type:'alarm/fetchActionTypes'});
        }
    },[authorized]);
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'alarm/reset'});
        }
    },[])
    let columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { width:'120px', ellipsis:true, title:'设备名称', dataIndex:'attrName'},
        { width:'200px', ellipsis:true, title:'区域', dataIndex:'regionName', render:value=>(<span>{ value || '--' }</span>)},
        { width:'200px', ellipsis:true, title:'支路', dataIndex:'positionName', render:value=>(<span>{ value || '--' }</span>) },
        { title:'告警分类', dataIndex:'typeName'},
        { 
            title:'告警信息',
            width:'280px',
            ellipsis:true,
            render:(row)=>{
                return `${row.warningInfo}实际:${row.warningValue}`;
            }
        },
        {
            title:'告警级别',
            dataIndex:'level'
        },
        {
            title:'当前状态',
            dataIndex:'status',
            render:(value)=>{
                return (
                    <Tag color={statusMaps[value].color}>{statusMaps[value].text}</Tag>
                )
            }
        },
        { title:'发生时间', dataIndex:'lastWarningTime' },
        { 
            title:'操作',
            render:(row)=>(
                row.status === 3 
                ?
                <div>
                    <a onClick={()=>setInfo(row)}>查看详情</a>
                </div>
                :
                <div>
                    <a style={{ marginRight:'0.5rem' }} onClick={()=>setInfo({ ...row, actionType:2 })}>添加进度</a>
                    <a style={{ marginRight:'0.5rem' }} disabled={row.status === 4 ? true : false } onClick={()=>{
                        if ( row.status !== 4 ) {
                            setInfo({ ...row, actionType:4 });
                        }
                    }}>挂起</a>
                    <a style={{ marginRight:'0.5rem' }} onClick={()=>setInfo({ ...row, actionType:3 })}>结单</a>
                </div>
            )
        }
    ];
    const items = tabList.map(item=>({
        key:item.key,
        label:item.tab,
        children:(
            <Table
                dataSource={alarmList || []}
                bordered={true}
                rowKey='recordId'
                className={style['self-table-container']}
                columns={columns}
                locale={{ emptyText:(<div style={{ margin:'1rem 0'}}>{ '没有' + item.tab + '记录' }</div>) }}
                loading={isLoading}
                pagination={{ total, current:currentPage, pageSize:12, showSizeChanger:false  }}
                onChange={pagination=>{
                    dispatch({ type:'alarm/fetchAlarmList', payload:{ currentPage:pagination.current, attrName:value, status }} )
                }}
            />
        )
    }))
    return (
        <div className={style['page-container']}>
            <div style={{ height:'40px' }}>
                <Input style={{ width:'160px', marginRight:'1rem' }} allowClear placeholder='可输入设备名查询' value={value} onChange={e=>setValue(e.target.value)} />
                <Select style={{ width:'120px', marginRight:'1rem' }} value={status} onChange={(value)=>setStatus(value)}>
                    <Option value={0}>全部</Option>
                    {
                        [1,2,3,4].map((item)=>(
                            <Option key={item} value={item}>{ statusMaps[item].text }</Option>
                        ))
                    }
                </Select>
                <Button type='primary' onClick={()=>{
                    dispatch({ type:'alarm/fetchAlarmList', payload:{ attrName:value, status }});
                }}>查询</Button>
            </div>
            <div className={style['card-container']}>
                <Tabs items={items} className={style['custom-tabs'] + ' ' + style['flex-tabs']} activeKey={cateCode}  onChange={activeKey=>{
                    dispatch({ type:'alarm/setCateCode', payload:activeKey });
                    dispatch({type:'alarm/fetchAlarmList' });
                }} />                    
            </div>
            <Modal 
                visible={Object.keys(info).length ? true : false} 
                footer={null} 
                width='50%'
                destroyOnClose={true} 
                bodyStyle={{ padding:'40px' }}
                onCancel={()=>setInfo({})}
            >
                <AlarmForm 
                    info={info} 
                    actionTypes={actionTypes}
                    onClose={()=>setInfo({})} 
                    onDispatch={(action)=>dispatch(action)}
                    alarmHistory={alarmHistory}
                />
            </Modal>
        </div>
    )
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmList)

