import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Upload, TreeSelect, Radio, Button, Select, Modal, message } from 'antd';
import * as Icons from '@ant-design/icons';
import style from '../SystemConfig.css';

const { Option } = Select;
const { Search } = Input;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
let msg = '密码需是包含字母/数字/特殊字符且长度8-15位的字符串';
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
let defaultValues = { menuCode:'', menuName:'', menuUrl:'', menuLevel:null, orderBy:null };
let menuLevels = [
    { title:'一级菜单', key:1 }, 
    { title:'二级菜单', key:2 }, 
    // { title:'按钮', key:9 }
];
// 系统默认菜单项，基本菜单不可删除和更改
let defaultMenuIds = [1, 5, 6, 9, 12, 15, 16, 17, 21];
function MenuForm({ currentMenu, menuList, onDispatch, theme }){
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [icon, setIcon] = useState('');
   
    useEffect(()=>{  
        let { menuCode, menuName, menuUrl, orderBy, parentMenuId, parentMenuName, menuLevel, menuIcon } = currentMenu;
        form.setFieldsValue({
            menuCode,
            menuName,
            menuUrl,
            menuLevel,
            orderBy,
            parentMenuId:parentMenuId
        }); 
        setIcon(menuIcon);
        return ()=>{}
    },[currentMenu]);
   
    let IconComponent = Icons[icon] || null;
    // console.log(menuList);
    return (        
            <Form 
                {...layout}
                form={form} 
                name="nest-messages" 
                onFinish={values=>{
                    let forEdit = !currentMenu.menuId  ? false : true;
                    
                    new Promise((resolve,reject)=>{
                        if ( forEdit ){
                            values.menuId = currentMenu.menuId;
                        }
                        values.menuIcon = icon;
                        onDispatch({ type:'userList/addMenuAsync', payload:{ resolve, reject, values, forEdit }})                                    
                    }).then(()=>{
                        message.success(forEdit ? '更新菜单成功':'添加菜单成功');
                        onDispatch({ type:'userList/setCurrentMenu', payload:{}});
                    }).catch(msg=>{
                        message.error(msg);
                    })  
                                            
                }}
            >
                <Form.Item name='menuCode' label="菜单编码" rules={[{ required: true, message:'菜单编码不能为空' }]}>
                    <Input disabled={defaultMenuIds.includes(currentMenu.menuId) ? true : false } />
                </Form.Item>
                <Form.Item name='menuName' label="菜单名称" rules={[{ required: true, message:'菜单名称不能为空' }]}>
                    <Input disabled={defaultMenuIds.includes(currentMenu.menuId) ? true : false }/>
                </Form.Item>
                <Form.Item label='菜单图标'>
                    <div style={{ display:'flex' }}>
                        { icon ? <div style={{ background:'#1890ff', borderRadius:'2px', marginRight:'0.5rem', padding:'0 0.5rem', border:''}}><IconComponent style={{ fontSize:'24px', color:'#fff', marginTop:'4px' }} /></div> : null }
                        <Button type='primary' onClick={()=>setVisible(true)}>选择图标</Button>
                    </div>            
                </Form.Item>
                <Form.Item name='menuLevel' label='菜单级别'>
                    <Radio.Group className={style['custom-radio'] + ' ' + ( theme === 'dark' ? style['dark'] : '')} disabled={defaultMenuIds.includes(currentMenu.menuId) ? true : false }>
                        {
                            menuLevels.map((item)=>(
                                <Radio key={item.key} value={item.key}>{ item.title }</Radio>
                            ))
                        }
                    </Radio.Group>
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuLevel !== currentValues.menuLevel}>                     
                    {({ getFieldValue }) => {     
                        let level = getFieldValue('menuLevel');
                        return (  
                            level && level !== 1
                            ? 
                            <Form.Item label="上级菜单" name="parentMenuId">                       
                                <TreeSelect
                                    disabled={defaultMenuIds.includes(currentMenu.menuId) ? true : false }
                                    treeDefaultExpandAll
                                    treeData={menuList}  
                                />
                            </Form.Item>
                            :
                            null
                        )
                        
                    }}                    
                </Form.Item>
                <Form.Item name='menuUrl' label='链接地址'>
                    <Input addonBefore="http://" />
                </Form.Item>
                
                <Form.Item name='orderBy' label='排序值'>
                    <InputNumber style={{ width:'100%' }} />
                </Form.Item>
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                    <Button type="primary" htmlType="submit">保存</Button>
                    <Button style={{ marginLeft:'10px' }} onClick={()=>{
                        if ( currentMenu.menuId ) {
                            if ( defaultMenuIds.includes(currentMenu.menuId)) {
                                message.info('默认菜单项不可删除');
                            } else {
                                new Promise((resolve, reject)=>{
                                    onDispatch({ type:'userList/delMenuAsync', payload:{ resolve, reject, menuId:currentMenu.menuId }})
                                })
                                .then(()=>{
                                    message.success('删除菜单成功');
                                })
                                .catch(msg=>message.error(msg))
                            }
                            
                        } else {
                            message.info('请先选中要删除的菜单');
                        }
                    }}>删除</Button>
                </Form.Item>
                <Modal
                    visible={visible}
                    onCancel={()=>setVisible(false)}
                    footer={null}
                >
                    <div style={{ display:'flex', flexWrap:'wrap' }}>
                        {
                            Object.keys(Icons).filter(key=>key.endsWith('Outlined')).map((item)=>{
                                let Component = Icons[item];
                                let result = <Component style={{ fontSize:'36px' }} />;                         
                                return <div key={item} style={{ width:'20%', textAlign:'center', color:'#555', padding:'0 0.5rem 0.5rem 0' }} onClick={()=>{ setIcon(item); setVisible(false) }}>{ result }</div>
                            })
                        }
                    </div>
                </Modal>
            </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentMenu !== nextProps.currentMenu || prevProps.menuList !== nextProps.menuList || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(MenuForm, areEqual);
