import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form, Input, InputNumber, DatePicker, Button, Select, Switch, Modal, message } from 'antd';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{8,20}$/ ;
let msg = '密码需是包含字母/数字/特殊字符且长度8-15位的字符串';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
let today = moment(new Date());
const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < today; 
}

function UserForm({ info, companyList, roleList, onClose, onDispatch }){
    const [form] = Form.useForm();
    const [time, setTime] = useState(moment(new Date()));
    useEffect(()=>{
        if ( info.forEdit ) {
            let { userName, realName, phone, email, companyId, roleId, isActived, isExperience, invalidTime  } = info.current;
            form.setFieldsValue({
                userName,
                realName,
                phone,
                email,
                companyId,
                roleId,
                isActived:isActived ? true : false,
                isExperience: isExperience ? true : false,
            });
            setTime(invalidTime ? moment(invalidTime) : null);
        } else {
            form.setFieldsValue({ isActived:true })
        }
    },[info])    
    return (
        
            <Form 
                {...layout} 
                name="nest-messages" 
                form={form}
                onFinish={values=>{
                    console.log(values);
                    if ( info.forEdit ) {
                        values.userId = info.current.userId;
                    }
                    values.isActived = values.isActived ? 1 : 0;
                    values.isExperience = values.isExperience ? 1 : 0;
                    values.roleName = roleList.filter(i=>i.roleId === values.roleId)[0].roleName;
                    let currentCompany = companyList.filter(i=>i.companyId === +values.companyId )[0];
                    values.companyName = currentCompany ? currentCompany.companyName : '';
                    if ( values.isExperience && time && time._isAMomentObject ) {
                        values.invalidTime = time.format('YYYY-MM-DD');
                    }
                    new Promise((resolve,reject)=>{
                        onDispatch({ type:'userList/addUserAsync', payload:{ values, resolve, reject, forEdit:info.forEdit }});
                    }).then(()=>{
                        message.success(info.forEdit ? '编辑用户成功':'添加用户成功');
                        onClose();
                    }).catch(msg=>{
                        message.error(msg);
                    })                 
                }}
            >
                <Form.Item name='userName' label="用户名" rules={[{ required: true, message:'用户名不能为空' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name='realName' label="真实姓名" rules={[{ required: true, message:'请填入您的真实姓名' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name='phone' label="手机号" rules={[{ required:true, message:'请输入联系方式'}, {pattern:phoneReg, message:'请输入合法的手机号码', validateTrigger:'onBlur' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name='email' label="邮箱">
                  <Input />
                </Form.Item>
                <Form.Item name='roleId' label="角色权限" rules={[{ required:true, message:'请设置账号的权限'}]}>
                    <Select>
                        {
                            roleList && roleList.length 
                            ?
                            roleList.map((item,index)=>(
                                <Option key={index} value={item.roleId}>{item.roleName}</Option>
                            ))
                            :
                            null
                        }
                    </Select>
                </Form.Item>
                {/* <Form.Item name='companyId' label="所属公司" rules={[{ required:true , message:'请选择所属公司'}]}>
                    <Select>
                            {
                                companyList && companyList.length
                                ?
                                companyList.map((item,index)=>(
                                    <Option key={index} value={item.companyId}>{item.companyName}</Option>
                                ))
                                :
                                null
                            }
                    </Select>
                </Form.Item>  */}
                {
                    info.forEdit 
                    ?
                    null
                    :
                    <Form.Item name='password' label="密码" rules={[
                        { required:true , message:'密码不能为空'}
                        // { pattern:passwordReg, message:msg, validateTrigger:'onBlur'}
                    ]}>
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>
                }              
                {
                    info.forEdit
                    ?
                    null
                    :
                    <Form.Item name='confirm_password' label="确认密码" rules={[{ required:true , message:'密码不能为空'}, ({ getFieldValue })=>({
                        validator(rule, value){
                            if ( getFieldValue('password') === value ) {
                                return Promise.resolve();
                            } else {
                                return Promise.reject('密码必须相同');
                            }
                        }
                    }) ]}>
                        <Input.Password placeholder="请再次输入密码" />
                    </Form.Item>
                }       
                <Form.Item name='isExperience' label='是否体验账号' valuePropName='checked'>
                    <Switch />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.isExperience !== currentValues.isExperience }>                     
                    {({ getFieldValue }) => {     
                        return (  
                            getFieldValue('isExperience')
                            ? 
                            <Form.Item label="失效时间" rules={[{ required:true , message:'请指定失效时间' }]}>                       
                                <DatePicker locale={zhCN} disabledDate={disabledDate} value={time} onChange={value=>setTime(value)} />
                            </Form.Item>
                            :
                            null
                        )                       
                    }}                    
                </Form.Item>
                <Form.Item name='isActived' label="是否启用" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button type="primary" htmlType="submit">
                        { info.forEdit ? '修改' : '创建' }
                    </Button>
                    <Button style={{ marginLeft:'1rem' }} onClick={()=>onClose()}>取消</Button>
                </Form.Item>
            </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info || prevProps.companyList !== nextProps.companyList ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(UserForm, areEqual);
