import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Cascader, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { provinceAndCityData  } from 'element-china-area-data';
import { getCityCode } from '@/utils/array';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
console.log(provinceAndCityData);
function RateForm({ dispatch, info, onClose }){
    let [form] = Form.useForm();
    useEffect(()=>{
        if ( info.forEdit ) {
            
            let { rateName, frontType, frontValue, orderBy, frontCityId, frontCityName  } = info.current;
            console.log(info.current);
            form.setFieldsValue({
                rateName,
                frontType,
                frontValue,
                region:[frontCityId + '' ],
                orderBy
            })
        } else {
            form.setFieldsValue({ frontType:1 })
        }
        return ()=>{
          
        }
    },[]);
    return (    
        <Form 
            {...layout} 
            name="billing-form"
            form={form}
            onFinish={values=>{
                if ( values.region && values.region.length ) {
                    let province = values.region[0];
                    let city = values.region[1];
                    let { cityCode, cityName } = getCityCode(province, city)
                    values.frontCityId = cityCode;
                    values.frontCityName = cityName;
                }
                if ( info.forEdit ){
                    values.rateId = info.current.rateId;
                }

                new Promise((resolve,reject)=>{
                    dispatch({type:'billing/addRateAsync', payload:{ values, forEdit:info.forEdit, resolve, reject }});               
                })
                .then(()=>{
                    message.success(`${info.forEdit ? '修改' : '添加'}方案成功`);
                    onClose();
                })
                .catch(msg=>{
                    message.error(msg);               
                })
            }}
        >
            <Form.Item name='rateName' label="方案名称" rules={[{ required: true, message:'方案名称不能为空' }]}>
                <Input />
            </Form.Item>
            <Form.Item name='frontType' label="生效条件" rules={[{ required: true, message:'生效条件不能为空' }]}>
                <Select>
                    <Option value={1} key={1}>默认</Option>
                    <Option value={2} key={2}>温度大于等于阈值</Option>
                    <Option value={3} key={3}>温度小于等于阈值</Option>
                </Select>
            </Form.Item>
            
            <Form.Item noStyle shouldUpdate={( prevValues, currentValues )=>{
                return prevValues.frontType !== currentValues.frontType;
            }}>
                {
                    ({ getFieldValue })=>{
                        let temp = getFieldValue('frontType');
                        return (
                            temp !== 1 
                            ?   
                            <Form.Item name='frontValue' label="温度阈值" rules={[{ required: true, message:'温度阈值不能为空' }]}>
                                <InputNumber style={{ width:'100%' }} />
                            </Form.Item>
                            :
                            null
                        )
                    }                    
                }
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues)=>{
                return prevValues.frontType !== currentValues.frontType;
            }}>
                {
                    ({ getFieldValue })=>{
                        let temp = getFieldValue('frontType');
                        return (
                            temp !== 1 
                            ?
                            <Form.Item name='region' label="城市" rules={[{ required: true, message:'城市名不能为空' }]}>
                                <Cascader
                                    fieldNames={{ label:'label', value:'value' }}
                                    options={provinceAndCityData}
                                />
                            </Form.Item>
                            :
                            null
                        )
                    }
                }
            </Form.Item>
            <Form.Item name='orderBy' label="优先级" rules={[{ required: true, message:'请指定方案的优先级' }]}>
                <InputNumber style={{ width:'100%' }} />
            </Form.Item>
           
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                <Button type="primary" htmlType="submit">
                    确定
                </Button>
                <Button type="primary" style={{margin:'0 10px'}} onClick={()=>onClose()}>
                    取消
                </Button>
            </Form.Item>
        </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(RateForm, areEqual);