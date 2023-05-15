import React, { useState, useEffect, useRef } from 'react';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Form, InputNumber, Table, DatePicker, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined  } from '@ant-design/icons';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import EleReport from './PreviewReport/EleReport';
import style from '@/pages/IndexPage.css';
const curDate = new Date();

function validator(a,value){
    if ( !value && typeof value !== 'number' ){
        return Promise.reject('单价不能为空');
    }
    if ( typeof +value !== 'number') {
        return Promise.reject('请填入合适的单价');
    } else if ( value < 0 ){
        return Promise.reject('单价不能为负数');
    } else {
        return Promise.resolve();
    }
}
const layout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 15 },
};

function ReportDocument({ currentField, currentAttr, companyName, documentInfo, rateInfo, energyInfo, onDispatch, theme }) {
    let textColor = theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.85)';
    const inputRef = useRef();
    const [preview, setPreview] = useState(false);
    const [cost_mode, setCostMode] = useState('company');
    const [date, setDate] = useState(moment().startOf('month'));
    const [form] = Form.useForm();
    const [isLoading, setLoading] = useState(false);
    useEffect(()=>{ 
        if ( rateInfo ){
            if ( energyInfo.typeCode === 'ele' ) {
                form.setFieldsValue({
                    cost_mode:'company',
                    tipPrice:rateInfo['4'],
                    highPrice:rateInfo['1'],
                    middlePrice:rateInfo['2'],
                    bottomPrice:rateInfo['3'],
                });
                return ;
            } else {
                form.setFieldsValue({
                    cost_mode:'company'
                })
            } 
            
        }
    },[rateInfo]);
    return (  
        <div className={style['card-container']}>
            <Form
                {...layout}
                form={form}
                style={{ width:'600px', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:'red' }}
            >
                <Form.Item label='当前公司'>
                    <span style={{ color:textColor }}>{ companyName || '--' }</span>
                </Form.Item>
                <Form.Item label='当前维度属性'>
                    <span style={{ color:textColor }}>{`${currentField.fieldName || '未设置'} - ${currentAttr.title || '未设置' }`}</span>
                </Form.Item>
                <Form.Item label='选择日期' rules={[{ required: true, message:'请选择一个时间' }]}>
                    <DatePicker style={{ width:'100%' }} ref={inputRef} allowClear={false} picker="month" onChange={date=>{
                        setDate(date);
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }} locale={zhCN} value={date} />
                </Form.Item>
                {
                    energyInfo.typeCode === 'ele' 
                    ?
                    <Form.Item name='cost_mode' label='计费模式' rules={[ {required:true, messsage:'请选择一种计费模式'}]}>
                        <Radio.Group onChange={e=>setCostMode(e.target.value)}>
                            <Radio value='company'>工业</Radio>
                            <Radio value='person'>民用</Radio>
                        </Radio.Group>
                    </Form.Item>
                    :
                    null
                }
                
                {
                    energyInfo.typeCode === 'ele' && cost_mode === 'company' 
                    ?
                    <Form.Item name='tipPrice' label="尖时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }    
                {
                    energyInfo.typeCode === 'ele' && cost_mode === 'company' 
                    ?
                    <Form.Item name='highPrice' label="峰时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                {
                    energyInfo.typeCode === 'ele' && cost_mode === 'company'
                    ?
                    <Form.Item name='middlePrice' label="平时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                {
                    energyInfo.typeCode === 'ele' && cost_mode === 'company'
                    ?
                    <Form.Item name='bottomPrice' label="谷时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                {
                    energyInfo.typeCode !== 'ele' || cost_mode === 'person' 
                    ?
                    <Form.Item name='price' label={`${energyInfo.typeName}费单价`} rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 9 }}>
                    <Button type="primary" style={{ marginRight:'10px' }} onClick={()=>{
                        form.validateFields()
                            .then(values=>{
                               
                                if ( Object.keys(currentAttr).length && Object.keys(currentField).length ){
                                    setLoading(true);
                                    values.beginDate = date.format('YYYY-MM-DD');
                                    new Promise((resolve, reject)=>{
                                        onDispatch({ type:'cost/fetchDocument', payload:{ resolve, reject, values }})
                                    })
                                    .then(()=>{
                                        setPreview(true);
                                        setLoading(false);                      
                                    })
                                } else {
                                    message.info(`请先设置${energyInfo.typeName}能源维度信息`);
                                }                       
                            })
                            .catch(err=>{
                                console.log(err);
                            })
                    }}>预览报告</Button>
                </Form.Item>
            </Form>
            <Modal visible={preview} footer={null} onCancel={()=>setPreview(false)} closable={false} destroyOnClose={true} width='1200px' bodyStyle={{ padding:'0' }}>               
                {/* 根据不同能源类型显示不同能源预览报告 */}         
                <EleReport 
                    currentField={currentField}
                    currentAttr={currentAttr}
                    companyName={companyName}
                    documentInfo={documentInfo} 
                    energyInfo={energyInfo}
                    rateInfo={rateInfo}
                    onCancel={()=>setPreview(false)} 
                    costMode={cost_mode}
                    date={date}
                    onDispatch={onDispatch}
                />                                        
            </Modal>
            {
                isLoading
                ?
                <div style={{ position:'fixed', top:'0', left:'0', right:'0', bottom:'0', backgroundColor:'rgba(0,0,0,0.8)'}}>
                    <Spin size='large' style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)'}} tip="结算单生成中，请稍后..." />
                </div>
                :
                null
            }
        </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentAttr !== nextProps.currentAttr || prevProps.documentInfo !== nextProps.documentInfo || prevProps.rateInfo !== nextProps.rateInfo ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(ReportDocument, areEqual);
