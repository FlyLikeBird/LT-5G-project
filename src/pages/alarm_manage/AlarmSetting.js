import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm, Form, Input } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import RuleForm from './components/RuleForm';
import style from '@/pages/IndexPage.css';

const { Option } = Select;

function AlarmSetting({ dispatch, user, alarm, fields }){
    let { authorized } = user;
    let { currentEnergy, currentField, allFields, allFieldAttrs } = fields;
    let { ruleList, ruleTypes, ruleDetail, currentPage } = alarm;
    const fieldAttrs = allFieldAttrs[currentField.fieldId] ? allFieldAttrs[currentField.fieldId] : [];
    let [info, setInfo] = useState({ visible:false, forEdit:false });
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'fields/init'});
            dispatch({ type:'alarm/fetchRuleList'});
            dispatch({ type:'alarm/fetchRuleTypes'});
        }
    },[authorized]);
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'alarm/reset'});
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
        { title:'规则名称', dataIndex:'ruleName' }, 
        // { title:'所属公司', dataIndex:'company_name' },
        { title:'告警等级(1级为最高)', dataIndex:'level' },
        { title:'告警类型', dataIndex:'typeName'},
        { title:'告警最小阈值', dataIndex:'warningMin', render:(value)=>(<span style={{ color:'#1890ff'}}>{ value }</span>)},
        { title:'告警最大阈值', dataIndex:'warningMax', render:(value)=>(<span style={{ color:'#1890ff'}}>{ value }</span>)},
        { 
            title:'单位',
            dataIndex:'unitName',
            render:(value)=>(<span>{ value || '--' }</span>)
        },
        { 
            title:'创建时间',  
            dataIndex:'createTime',
        },
        {
            title:'操作',
            render:(row)=>{
                return (
                    <div>
                        <a onClick={()=>{
                            setInfo({ visible:true, forEdit:true });
                            dispatch({ type:'alarm/fetchRuleDetail', payload:{ ruleId:row.ruleId }});
                        }}>修改</a>
                        <Popconfirm title="确定删除此条规则吗?" okText="确定" cancelText="取消" onConfirm={()=> dispatch({type:'alarm/delRuleAsync', payload:{ ruleId:row.ruleId }})}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>

                    </div>
                )
            }
        }
    ];
    console.log(fieldAttrs);
    return (
            <div className={style['page-container']}>
                <div className={style['card-container']}>
                    <div style={{ padding:'10px 20px 0 20px'}}>
                        <Button type="primary"  onClick={() => setInfo({ visible:true, forEdit:false }) }>添加告警规则</Button>                
                    </div>
                    <Table
                        className={style['self-table-container']}
                        columns={columns}
                        dataSource={ruleList}
                        locale={{emptyText:(<div style={{ margin:'1rem 0'}}>还没有设置规则</div>)}}
                        bordered={true}
                        rowKey="ruleId"
                        pagination={{ total:ruleList.length, current:currentPage, pageSize:12, showSizeChanger:false }}
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
                        <RuleForm 
                            info={info}
                            ruleDetail={ruleDetail}
                            ruleTypes={ruleTypes}
                            fieldAttrs={fieldAttrs}
                            onClose={()=>setInfo({})} 
                            onDispatch={action=>dispatch(action)}
                        />
                    </Modal>
                </div>
            </div>    
             
    )
};

export default connect( ({ user, alarm, fields }) => ({ user, alarm, fields }))(AlarmSetting);