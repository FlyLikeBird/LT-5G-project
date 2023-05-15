import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Radio, Button, Divider, message } from 'antd';
import { MinusCircleOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { provinceAndCityData  } from 'element-china-area-data';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
let timer = null;
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
function AddMeterForm({ dispatch, info, modelList, onClose }){
    const [form] = Form.useForm();
    const [list, setList] = useState(modelList);
    const [value, setValue] = useState('');
    useEffect(()=>{
        if ( info.forEdit ) {
            let { meterName, registerCode, modelId, isGateway, isAble  } = info.current;
            form.setFieldsValue({
                meterName,
                registerCode,
                modelId,
                isGateway,
                isAble 
            })
        } else {
            form.setFieldsValue({ isGateway:1, isAble:0 });
        }
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
    return (    
        <Form 
            {...layout} 
            name="billing-form"
            form={form}
            onFinish={values=>{
                console.log(values);
                let modelInfo = list.filter(i=>i.modelId === values.modelId)[0];
                if ( modelInfo ) {
                    values.modelName = modelInfo.modelName;
                    values.modelCode = modelInfo.modelCode;
                    values.energyType = modelInfo.energyType;
                }
                if ( info.forEdit ){
                    values.machId = info.current.machId;
                }

                new Promise((resolve,reject)=>{
                    dispatch({type:'meter/addMeterAsync', payload:{ values, forEdit:info.forEdit, resolve, reject }});               
                })
                .then(()=>{
                    message.success(`${info.forEdit ? '修改' : '添加'}设备成功`);
                    onClose();
                })
                .catch(msg=>{
                    message.error(msg);               
                })
            }}
        >
            <Form.Item name='meterName' label="设备名称" rules={[{ required: true, message:'设备名称不能为空' }]}>
                <Input />
            </Form.Item>
            <Form.Item name='registerCode' label="注册码" rules={[{ required: true, message:'注册码不能为空' }]}>
                <Input />
            </Form.Item>
            <Form.Item name='isGateway' label='是否网关' rules={[{ required: true, message:'选择是否是网关设备' }]}>
                <Radio.Group onChange={e=>{
                    setValue('');
                    form.setFieldValue('modelId', null);
                }}>
                    <Radio key={0} value={0}>是</Radio>
                    <Radio key={1} value={1}>否</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={( prevValues, currentValues )=>{
                return prevValues.isGateway !== currentValues.isGateway;
            }}>
                {
                    ({ getFieldValue })=>{
                        let isGateway = getFieldValue('isGateway');
                        let result;
                        if ( isGateway === 1 ) {
                            result = modelList.filter(i=>i.energyType !== 0 && i.modelDesc.includes(value) );
                        } else {
                            result = modelList.filter(i=>i.energyType === 0 && i.modelDesc.includes(value) );
                        }
                        
                        return (
                            <Form.Item label='设备型号' name='modelId'>
                                <Select
                                    style={{ width:'100%' }}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider
                                              style={{
                                                margin: '8px 0',
                                              }}
                                            />
                                            <div style={{ display:'flex', padding:'0.5rem 1rem' }}>
                                                <Input
                                                    placeholder="可输入设备型号查询"
                                                    value={value}
                                                    onChange={e=>setValue(e.target.value)}
                                                />
                                                {/* <Button type='primary' icon={<SearchOutlined />} onClick={()=>{
                                                    if ( value ) {
                                                        let temp = modelList.filter(i=>i.modelDesc.includes(value) );
                                                        setList(temp);
                                                    }
                                                }}>
                                                    查询
                                                </Button> */}
                                            </div>
                                            
                                        </>
                                    )}
                                >
                                {
                                    result.map(i=>(
                                        <Option key={i.modelId} value={i.modelId}>{ i.modelDesc }</Option>
                                    ))
                                }
                                </Select>
                            </Form.Item>
                            
                        )
                    }                    
                }
            </Form.Item>
            {/* <Form.Item name='modelId' label="设备型号" rules={[{ required: true, message:'选择一种设备型号' }]}>
                {

                }
                <Select
                    style={{ width:'100%' }}
                    dropdownRender={(menu) => (
                        <>
                            {menu}
                            <Divider
                              style={{
                                margin: '8px 0',
                              }}
                            />
                            <div style={{ display:'flex', padding:'0.5rem 1rem' }}>
                                <Input
                                    placeholder="可输入设备型号查询"
                                    value={value}
                                    onChange={(e)=>setValue(e.target.value)}
                                />
                                <Button type='primary' icon={<SearchOutlined />} onClick={()=>{
                                    if ( value ) {
                                        let temp = modelList.filter(i=>i.modelDesc.includes(value) );
                                        setList(temp);
                                    }
                                }}>
                                    查询
                                </Button>
                            </div>
                            
                        </>
                    )}
                >
                    {
                        list.map(i=>(
                            <Option key={i.modelId} value={i.modelId}>{ i.modelDesc }</Option>
                        ))
                    }
                </Select>
            </Form.Item> */}
            
            
            <Form.Item name='isAble' label='是否启用' rules={[{ required: true, message:'选择是否启用设备' }]}>
                <Radio.Group>
                    <Radio key={0} value={0}>是</Radio>
                    <Radio key={1} value={1}>否</Radio>
                </Radio.Group>
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

export default React.memo(AddMeterForm, areEqual);