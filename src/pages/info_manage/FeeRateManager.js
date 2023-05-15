import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, InputNumber, Radio, message } from 'antd';
import style from '../IndexPage.css';

const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{6,20}$/ ;
let msg = '密码必须包含字母、数字、特殊字符且长度为6-20位';
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
const tailLayout = {
    wrapperCol: { offset: 6, span: 18 },
};

function FeeRateManager({ dispatch, user, billing }){
    const { authorized, userInfo, currentCompany } = user;
    const { rateInfo } = billing;
    const [form] = Form.useForm();
    
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'billing/fetchFeeRate'});
        }
    },[authorized])
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
        <div className={style['page-container']}>
            <div className={style['card-container']} style={{ width:'40%' }}>
                <div className={style['card-title']}>费率设置</div>
                <div className={style['card-content']}>
                    <Form
                        { ...layout }
                        style={{ width:'600px', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}
                        form={form}
                        onFinish={values=>{
                            new Promise((resolve, reject)=>{
                                dispatch({type:'billing/setFeeRateAsync', payload:{ resolve, reject, values }})
                            })
                            .then(()=>{
                                message.success('设置费率成功');
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
                            <InputNumber style={{ width:'300px' }} addonAfter="Kva"/>
                        </Form.Item>
                        <Form.Item label='容量基本电费单价' name='kvaPrice'>
                            <InputNumber style={{ width:'300px' }} addonAfter="元/Kva" />
                        </Form.Item>
                        <Form.Item label='需量基本电费单价' name='demandPrice'>
                            <InputNumber style={{ width:'300px' }} addonAfter="元/Kw" />
                        </Form.Item>
                        <Form.Item label='水费率' name='waterRate'>
                            <InputNumber style={{ width:'300px' }} addonAfter='元/m³' />
                        </Form.Item>
                        <Form.Item label='燃气费率' name='gasRate'>
                            <InputNumber style={{ width:'300px' }} addonAfter='元/m³'/>
                        </Form.Item>
                        
                        <Form.Item { ...tailLayout}>
                            <Button style={{ marginRight:'0.5rem' }} onClick={()=>form.resetFields()}>重置</Button>
                            <Button type='primary' htmlType='submit'>设置</Button>
                            
                        </Form.Item>
                    </Form>
                </div>
                
            </div>
        </div>

    )
}

export default connect(({ user, billing })=>({ user, billing }))(FeeRateManager);