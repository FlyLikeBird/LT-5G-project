import React, { useState, useEffect, useRef } from 'react';
import { Form, Select, InputNumber, Button, message, Slider, Input, TreeSelect, Divider } from 'antd';
import style from '@/pages/IndexPage.css';


const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

function IncomingForm({ info, onClose, onDispatch }){
    const [form] = Form.useForm();
   
    useEffect(()=>{
        if ( info.forEdit ) {
            form.setFieldsValue({
                name:info.current.name,
                totalKva:info.current.totalKva
            })
        }
    },[])
    
    return (
        <Form
            {...layout} 
            name="rule-form"
            form={form}
            onFinish={values=>{
                if ( info.forEdit ) {
                    values.inId = info.current.inId;
                }
                new Promise((resolve,reject)=>{
                    onDispatch({ type:'incoming/addIncomingAsync', payload:{ resolve, reject, values, forEdit:info.forEdit }})
                })
                .then(()=>{
                    message.success((info.forEdit ? '更新' : '添加') + '进线信息成功')
                    onClose();
                })
                .catch(msg=>{
                    message.error(msg);
                })
                
            }}
        >
            <Form.Item name='name' label='进线名称:' rules={[{ required:true, message:'进线名称不能为空'}]}>
                <Input />
            </Form.Item>
            <Form.Item name='totalKva' label='变压器容量(KVA):' rules={[{ required:true, message:'变压器容量不能为空'}]}>
                <InputNumber style={{ width:'100%' }} min={0} />
            </Form.Item>
            
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset:6 }}>
                <Button type="primary" style={{ marginRight:'1rem' }} htmlType="submit">确定</Button>
                <Button type="primary" onClick={()=>onClose()}> 取消 </Button>
            </Form.Item>
        </Form>
    )
}

export default IncomingForm;