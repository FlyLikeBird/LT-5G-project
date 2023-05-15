import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Radio, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

function BaseInfoForm({ onDispatch, rateInfo, onClose }){
    let [form] = Form.useForm();
    useEffect(()=>{
        if ( rateInfo ){
            let { calcType, totalKva, kvaPrice, demandPrice, waterRate, gasRate } = rateInfo;
            form.setFieldsValue({
                calcType,
                totalKva,
                kvaPrice,
                demandPrice,
                waterRate:waterRate || null,
                gasRate:gasRate || null
            });
        }
    },[rateInfo])
   
    return (    
        <Form
            { ...layout }
            form={form}
            onFinish={values=>{
                if ( rateInfo.id ) {
                    values.id = rateInfo.id;
                }
                new Promise((resolve, reject)=>{
                    onDispatch({type:'billing/setFeeRateAsync', payload:{ resolve, reject, values }})
                })
                .then(()=>{
                    message.success('设置费率成功');
                    onClose();
                })
                .catch(msg=>{
                    message.error(msg);
                })
            }}
        >
            <Form.Item label='计费类型' name='calcType'>
                <Radio.Group>
                    <Radio value={1} key={1}>按需量计算</Radio>
                    <Radio value={2} key={2}>按容量计算</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label='总变压器容量' name='totalKva'>
                <InputNumber style={{ width:'200px' }} addonAfter="kva"/>
            </Form.Item>
            <Form.Item label='容量基本电费单价' name='kvaPrice'>
                <InputNumber style={{ width:'200px' }} addonAfter="元/kva" />
            </Form.Item>
            <Form.Item label='需量基本电费单价' name='demandPrice'>
                <InputNumber style={{ width:'200px' }} addonAfter="元/kw" />
            </Form.Item>
            <Form.Item label='水费率' name='waterRate'>
                <InputNumber style={{ width:'200px' }} addonAfter='元/m³' />
            </Form.Item>
            <Form.Item label='燃气费率' name='gasRate'>
                <InputNumber style={{ width:'200px' }} addonAfter='元/m³'/>
            </Form.Item>
            
            <Form.Item { ...tailLayout}>
                <Button style={{ marginRight:'0.5rem' }} onClick={()=>onClose()}>取消</Button>
                <Button type='primary' htmlType='submit'>设置</Button>
                
            </Form.Item>
        </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.rateInfo !== nextProps.rateInfo  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(BaseInfoForm, areEqual);