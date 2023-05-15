import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
function AddAttrForm({ info, onDispatch, onClose }){
    return (
        <Form 
            name="add_field_attr" 
            {...layout}  
            onFinish={(values)=>{            
                new Promise((resolve, reject)=>{
                    onDispatch({type:'fields/addAttrAsync', payload:{ isChild:info.isChild, attrName:values.attrName, resolve, reject }})
                })
                .then(()=>{
                    message.success('添加属性成功');
                    onClose();
                })
                .catch(msg=>message.error(msg))               
            }}
        >
            <Form.Item name="attrName" label="维度属性" rules={[{required:true, message:'维度属性不能为空!'}]}>
                <Input />
            </Form.Item>
            <Form.Item wrapperCol={{...layout.wrapperCol, offset:6 }}>
                <Button type="primary" htmlType="submit" style={{ marginRight:'1rem' }}>确定</Button>
                <Button onClick={()=>onClose()}>取消</Button>
            </Form.Item>
        </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(AddAttrForm, areEqual);