import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tabs, Button, Form, Modal, Input, Select, Drawer, message } from 'antd';
import FieldItem from './components/FieldItem';
import FieldGroup from './components/FieldGroup';
import style from '@/pages/IndexPage.css';
const { TabPane } = Tabs;
const { Option } = Select;
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
function FieldManager({ dispatch, user, fields }){
    const { authorized, theme } = user;
    const { allFields, currentField, allFieldAttrs, currentAttr, currentPage, total, isLoading, bindMeters, fieldType, energyTypes, currentEnergy } = fields;
    const [info, setInfo] = useState({ visible:false });
    const [attrVisible, setAttrVisible] = useState(false);
    const fieldAttrs = allFieldAttrs[currentField.fieldId] || [];
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'fields/fetchField' });
        }
    },[authorized]);
    const items = allFields.map(( item, index )=>{
        return { 
            label:item.typeName, 
            key:item.energyType,
            children:(           
                item.energyFieldList && item.energyFieldList.length 
                ?
                <div style={{ padding:'1rem'}}>
                    <div style={{ paddingBottom:'1rem' }}><Button type="primary" onClick={()=>setInfo({ visible:true })}>添加维度</Button></div>
                    {
                        item.energyFieldList.map((field,index)=>(
                            <FieldItem data={field} key={index} dispatch={dispatch} theme={user.theme} onVisible={value=>setAttrVisible(value)} />
                        ))
                    }
                </div>
                :
                <div style={{ padding:'1rem'}}>
                    <div className={style['text']} >当前能源类型还没有设置维度</div>
                    <div style={{ marginTop:'1rem' }}><Button type="primary" onClick={()=>setInfo({ visible:true })}>添加维度</Button></div>
                </div>                
            )
        }
    })
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <Tabs
                    className={style['custom-tabs']}
                    activeKey={currentEnergy}
                    onChange={activeKey=>dispatch({ type:'fields/setEnergyType', payload:activeKey })}
                    items={items}
                >

                </Tabs>
            </div>
            <Modal 
                footer={null} 
                visible={info.visible} 
                bodyStyle={{padding:'2rem'}}
                destroyOnClose={true}
                closable={false}
                onCancel={()=>setInfo({ visible:false })}
            >
                <Form 
                    name="add_field"
                    {...layout} 
                    onFinish={values=>{
                        new Promise((resolve, reject)=>{
                            dispatch({type:'fields/addFieldAsync', payload:{ values, resolve, reject }})
                        })
                        .then(()=>{
                            setInfo({ visible:false });
                            message.success('添加维度成功');
                        })
                        .catch(msg=>{
                            message.error(msg);
                        })
                    }
                }>
                    <Form.Item name="fieldName" label="维度名称" rules={[{required:true, message:'维度名称不能为空!'}]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="fieldType" label="维度类型" rules={[{required:true, message:'必须选择一种维度类型'}]}>
                        <Select>
                            {
                                fieldType.map(item=>(
                                    <Option key={item.field_type} value={item.field_type}>{item.code_name}</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item wrapperCol={{...layout.wrapperCol, offset:6}}>
                        <Button type="primary" htmlType="submit">确定</Button>
                        <Button style={{marginLeft:'1rem'}} onClick={()=>setInfo({ visible:false })} >取消</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Drawer
                visible={attrVisible}
                title={ `${currentField.fieldName || ''}维度管理`}
                placement="right"
                width="80%"
                onClose={()=>setAttrVisible(false)}
            >
                <FieldGroup 
                    currentField={currentField}
                    currentAttr={currentAttr}
                    fieldAttrs={fieldAttrs}
                    bindMeters={bindMeters}
                    total={total}
                    currentPage={currentPage}
                    
                    onDispatch={action=>dispatch(action)}
                />
            </Drawer>
            
        </div>
    )
}

export default connect(({ user, fields })=>({ user, fields }))(FieldManager);