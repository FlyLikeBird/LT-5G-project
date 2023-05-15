import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm } from 'antd';
import RateForm from './RateForm';
import QuarterForm from './QuarterForm';
import BaseInfoForm from './BaseInfoForm';
import style from '@/pages/IndexPage.css';

const { Option } = Select;

const allTimeType = {
    1:'峰时段',
    2:'平时段',
    3:'谷时段',
    4:'尖时段'
};
let msg = '';
function EleBilling({ dispatch, user, billing }){
    let { authorized, theme } = user;
    let { rateList, is_actived, rateInfo, tplList } = billing;
    let [rateFormInfo, setRateFormInfo] = useState({ visible:false, current:null, forEdit:false });
    let [quarterFormInfo, setQuarterFormInfo] = useState({ visible:false, currentRate:null, currentQuarter:null });
    let [currentRate, setCurrentRate] = useState({});
    let [currentTpl, setCurrentTpl] = useState({});
    let [rateVisible, setRateVisible] = useState(false);
    let ratecolumns = [
        { title:'计费类型', dataIndex:'calcType', render: (value)=>(<span>{ value === 1 ? '按需量计算' : '按容量计算' }</span>)},
        { title:'总变压器容量(kva)', dataIndex:'totalKva'},
        { title:'容量基本电费单价(元/kva)', dataIndex:'kvaPrice'},
        { title:'需量基本电费单价(元/kw)', dataIndex:'demandPrice'},
        { title:'水费率(元/m³)', dataIndex:'waterRate'},
        { title:'燃气费率(元/m³)', dataIndex:'gasRate'},
        {
            title:'操作',
            render:row=>{
                return (<Button type='primary' size='small' onClick={()=>setRateVisible(true)}>设置费率</Button>)
            }
        }
    ]
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'billing/fetchTpl' });
            dispatch({ type:'billing/fetchFeeRate'});
            new Promise((resolve, reject)=>{
                dispatch({ type:'billing/fetchRateList', payload:{ resolve, reject }});
            })
            .catch(msg=>{
                message.error(msg);
                setRateVisible(true); 
            })
        }
    },[authorized])
    const columns = [
        {
            title: '季度',
            dataIndex: 'quarterName'
        },
        {
            title: '月份',
            render:(value, row)=>{
                return <div>{`${row.beginMonth}月-${row.endMonth}月`}</div>
            }
        },
        {
            title: '时段',
            render: (value, row, index) => {
                const renderNode = (
                    <div>
                        {
                            row.energyEleRateTimeVOList.map((time,index)=>(
                                 <div className={style['item']} key={index}>{`${time.timeTypeName}: ${time.beginTime}时 - ${time.endTime}时`}</div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            },
        },
        {
            title: '费率(元/kwh)',
            render: (value, row)=>{
                const renderNode = (
                    <div>
                        {
                            row.energyEleRateTimeVOList.map((time,index)=>(
                                 <div className={style['item']} key={index}><span style={{color:'#1890ff'}}>{`${time.feeRate}元`}</span></div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            }
        },
        {
            title:'操作',
            render:(row)=>{
                return (
                    <div>
                        <a onClick={()=>setQuarterFormInfo({ visible:true, currentRate:{ rateId:row.rateId }, currentQuarter:row })}>编辑</a>
                        <Popconfirm title="确定删除此条计费规则吗?" onText="确定" cancelText="取消" onConfirm={()=>{
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'billing/delQuarterAsync', payload:{ quarterId:row.quarterId, resolve, reject }})
                            })
                            .then(()=>message.success('删除计费规则成功'))
                            .catch(msg=>message.error(msg))
                        }}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ]; 
    
    return (
        
        <div style={{ height:'100%', position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', height:'50px', color:'#fff', padding:'1rem' }}>                                  
                <Button type="primary" style={{ marginRight:'0.5rem'}} onClick={()=>setRateFormInfo({ visible:true, current:null, forEdit:false })}>添加方案</Button>                                     
            </div>
            {/*  */}
            <div style={{ padding:'1rem' }}>
                <Table
                    className={style['self-table-container']}
                    style={{ padding:'0' }}
                    columns={ratecolumns}
                    dataSource={[{ id:1, calcType:rateInfo.calcType || 2, totalKva:rateInfo.totalKva || 0, kvaPrice:rateInfo.kvaPrice || 0, demandPrice:rateInfo.demandPrice || 0, waterRate:rateInfo.waterRate || 0, gasRate:rateInfo.gasRate || 0 }]}
                    pagination={false}
                    bordered={true}
                    rowKey="id"
                /> 
            </div>
            <>
                {
                    rateList.length
                    ?
                    rateList.map((item,i)=>(
                        <div key={item.rateId} className={style['card-container']} style={{ height:'auto', margin:'1rem', background:theme === 'dark' ? '#22264b' : '#f0f0f0' }}>
                            <div className={style['card-title']} style={{ color: theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.85)'}}>
                                {
                                    item.frontType === 1
                                    ?
                                    <div><span>{ item.rateName }</span></div>
                                    :
                                    <div>
                                        <span style={{ marginRight:'1rem' }}>{ item.rateName }</span>
                                        <span style={{ marginRight:'1rem' }}>城市: { item.frontCityName || '--' }</span>
                                        <span style={{ marginRight:'1rem' }}>温度阈值 { item.frontType === 2 ? '≥' : item.frontType === 3 ? '≤' : '' } { item.frontValue }</span>
                                        {/* <span style={{ marginRight:'1rem' }}>优先级 { item.order_by }</span> */}
                                    </div>
                                }                       
                                <div>
                                    <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>{
                                        // dispatch({ type:'billing/applyTplAsync', payload:{ rate_id:item.rate_id, tpl_id:7 }});
                                        setCurrentRate(item);
                                    }}>获取模板</span>

                                    <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>setQuarterFormInfo({ visible:true, currentRate:item, currentQuarter:null })}>添加规则</span>
                                    <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>setRateFormInfo({ visible:true, current:item, forEdit:true })}>编辑</span>
                                    <Popconfirm placement="leftTop" title="确定删除此方案吗?" onText="确定" cancelText="取消" onConfirm={()=>{
                                        new Promise((resolve, reject)=>{
                                            dispatch({ type:'billing/delRateAsync', payload:{ rateId:item.rateId, resolve, reject }})
                                        })
                                        .then(()=>message.success(`删除${item.rateName}成功`))
                                        .catch(msg=>message.error(msg))
                                    }}><span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }}>删除</span></Popconfirm>
                                    
                                </div>
                            </div>
                            <div className={style['card-content']}>
                                <Table
                                    className={style['self-table-container'] + ' ' + ( theme === 'dark' ? style['dark'] : '')}
                                    style={{ padding:'0' }}
                                    columns={columns}
                                    dataSource={item.energyEleRateQuarterVOList && item.energyEleRateQuarterVOList.length ? item.energyEleRateQuarterVOList.map(i=>({ ...i, rateId:item.rateId })) : []}
                                    pagination={false}
                                    locale={{
                                        emptyText:<div style={{ margin:'1rem 2rem' }}>还没有添加计费规则</div>
                                    }}
                                    rowKey="quarterId"
                                /> 
                            </div>
                        </div>
                    ))
                    :
                    <Table
                        className={style['self-table-container'] + ' ' + ( theme === 'dark' ? style['dark'] : '')}
                        columns={columns}
                        dataSource={[]}
                        pagination={false}
                        locale={{
                            emptyText:<div style={{ margin:'1rem 2rem' }}>还没有添加计费方案</div>
                        }}
                    />               
                }
            </>
            <Modal
                visible={rateFormInfo.visible}
                footer={null}
                width="40%"
                destroyOnClose={true}
                bodyStyle={{ padding:'3rem 2rem' }}
                onCancel={()=>setRateFormInfo({ visible:false, current:null, forEdit:false })}
                >
                <RateForm
                    dispatch={dispatch}
                    info={rateFormInfo}                    
                    onClose={()=>setRateFormInfo({ visible:false, current:null, forEdit:false })}
                />
            </Modal>
            <Modal
                visible={quarterFormInfo.visible}
                footer={null}
                width="50%"
                destroyOnClose={true}
                bodyStyle={{ padding:'2rem'}}
                closable={false}
                onCancel={()=>setQuarterFormInfo({ visible:false, currentRate:null, currentQuarter:null })}
            >
                <QuarterForm 
                    info={quarterFormInfo} 
                    dispatch={dispatch} 
                    onClose={()=>setQuarterFormInfo({ visible:false, currentRate:null, currentQuarter:null })} 
                />    
            </Modal>
            {/* <Modal
                visible={visible}
                footer={null}
                width="40%"
                destroyOnClose={true}
                bodyStyle={{ padding:'2rem'}}
                closable={false}
                onCancel={()=>setVisible(false)}
            >
                <BaseInfoForm dispatch={dispatch} info={rateInfo} onClose={()=>setVisible(false)}/>   
            </Modal> */}
            <Modal
                visible={currentRate.rateId ? true : false }
                width="40%"
                destroyOnClose={true}
                bodyStyle={{ padding:'2rem'}}
                onCancel={()=>setCurrentRate({})}
                cancelText='取消'
                okText='应用模板'
                onOk={()=>{
                    if ( currentTpl.tmpId ){
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'billing/applyTplAsync', payload:{ rateId:currentRate.rateId, tmpId:currentTpl.tmpId, resolve, reject }})
                        })
                        .then(()=>{
                            message.success(`应用${currentTpl.tmpName}成功`);
                            setCurrentRate({});
                            
                        })
                        .catch(msg=>message.error(msg));
                    } else {
                        message.info('请选择要应用的模板');
                    }
                }}
            >
                <Select style={{ width:'320px' }} value={currentTpl.tmpId} onChange={value=>{
                    let temp = tplList.filter(i=>i.tmpId === value )[0];
                    setCurrentTpl(temp);
                }}>
                    {
                        tplList.map((item,i)=>(
                            <Option key={item.tmpId} value={item.tmpId}>{ item.tmpName } </Option>
                        ))
                    }
                </Select>
            </Modal>
            {/* 设置费率提示弹窗 */}
            <Modal
                visible={rateVisible}
                footer={null}
                onCancel={()=>setRateVisible(false)}
            >
                <BaseInfoForm rateInfo={rateInfo} onDispatch={action=>dispatch(action)} onClose={()=>setRateVisible(false)} />
            </Modal>
        </div>                
       
    )
};

EleBilling.propTypes = {
};

export default connect( ({ user, billing }) => ({ user, billing }))(EleBilling);

