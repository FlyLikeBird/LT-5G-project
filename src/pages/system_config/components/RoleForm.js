import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, Select, Modal, message } from 'antd';

const { Option } = Select;
const { Search } = Input;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{8,20}$/ ;
let msg = '密码需是包含字母/数字/特殊字符且长度8-15位的字符串';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

function RoleForm({ info, AMap, onDispatch, onClose }){
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    useEffect(()=>{         
        if ( info.forEdit ){
            // 初始化表单状态
            let { roleName, orderBy } = info.current;
            form.setFieldsValue({
                roleName,
                orderBy
            });
        }
        return ()=>{}
    },[]);
    return (
        
            <Form 
                {...layout}
                form={form} 
                name="nest-messages" 
                onFinish={values=>{
                    if(info.forEdit) {
                        values.roleId = info.current.roleId;
                    }
                    new Promise((resolve,reject)=>{
                        onDispatch({ type:'userList/addRoleAsync', payload:{ resolve, reject, values, forEdit:info.forEdit }})                                    
                    }).then(()=>{
                        message.success(info.forEdit ? '修改角色成功':'添加角色成功');
                        onClose();
                    }).catch(msg=>{
                        message.error(msg);
                    })  
                                            
                }}
            >
                <Form.Item name='roleName' label="角色名称" rules={[{ required: true, message:'角色名称不能为空' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name='orderBy' label="排序值" >
                    <InputNumber style={{ width:'100%' }} />
                </Form.Item>
                
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button type="primary" htmlType="submit">
                        { info.forEdit ? '修改' : '添加' }
                    </Button>
                    <Button style={{ marginLeft:'10px' }} onClick={()=>onClose()}>取消</Button>
                </Form.Item>
                
            </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(RoleForm, areEqual);
