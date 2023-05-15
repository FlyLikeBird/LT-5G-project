import React, { useState, useEffect, useRef } from 'react';
import { Form, Select, InputNumber, Button, message, Slider, Input, TreeSelect, Divider } from 'antd';
import style from '@/pages/IndexPage.css';

const { Option } = Select;
let timer = null;
function validator(a,value){
    if ( !value || (typeof +value === 'number' && +value === +value && +value >=0  )) {
        return Promise.resolve();
    } else {
        return Promise.reject('请填入合适的阈值');
    }
}
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
function formatTreeData(data){
    data.forEach(node=>{
        node.title = node.attrName;
        node.value = node.attrId;
        if ( node.children && node.children.length ) {
            formatTreeData(node.children);
        }
    })
}

function RuleForm({ info, fieldAttrs, ruleTypes, ruleDetail, onClose, onDispatch }){
    formatTreeData(fieldAttrs);
    const [form] = Form.useForm();
    const [currentType, setCurrentType] = useState({});
    const [typeList, setTypeList] = useState([]);
    const [value, setValue] = useState('');
    useEffect(()=>{
        setTypeList(ruleTypes);
    },[ruleTypes]);
    useEffect(()=>{
        clearTimeout(timer);
        timer = setTimeout(()=>{
            let arr = ruleTypes.filter(i=>i.typeName.includes(value));
            setTypeList(arr);
        }, 600)
    },[value]);
    useEffect(()=>{
        if ( info.forEdit && Object.keys(ruleDetail).length ) {
            let { ruleName, level, typeId, warningMin, warningMax, attrs } = ruleDetail;
            form.setFieldsValue({
                ruleName,
                level:level === 3 ? 1 : level === 1 ? 3 : 2,
                warningMin,
                warningMax,
                attrIds:attrs && attrs.length ? attrs.map(i=>i.attrId) : null
            })
            let temp = ruleTypes.filter(i=>i.typeId === typeId)[0];
            setCurrentType(temp || {});
        }
    },[ruleDetail])
    useEffect(()=>{
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
    return (
        <Form
            {...layout} 
            name="rule-form"
            form={form}
            onFinish={values=>{
                if ( values.attrIds.length ) {
                    values.level = values.level == 1  ? 3 : values.level == 3 ? 1 : 2; 
                    if ( info.forEdit ) {
                        values.ruleId = ruleDetail.ruleId;
                        values.warningTypeId = ruleDetail.typeId;
                    }
                    new Promise((resolve,reject)=>{
                        onDispatch({ type:'alarm/addRuleAsync', payload:{ resolve, reject, values }})
                    })
                    .then(()=>{
                        message.success((info.forEdit ? '更新' : '添加') + '告警规则成功')
                        onClose();
                    })
                    .catch(msg=>{
                        message.error(msg);
                    })
                } else {
                    message.info('请选择关联属性')
                }
               
            }}
        >
            <Form.Item name='ruleName' label='规则名称' rules={[{ required:true, message:'规则名称不能为空'}]}>
                <Input />
            </Form.Item>
            <Form.Item name='level' label='告警等级' rules={[{ required:true, message:'请选择告警等级'}]}>
                <Slider min={1} max={3} marks={{ 1:'低',2:'中',3:'高'}}  tooltipVisible={false} />
            </Form.Item>
            {
                info.forEdit 
                ?
                <Form.Item label='告警类型'>
                    <Input disabled value={ruleDetail.typeName} />
                </Form.Item>
                :
                <Form.Item name='warningTypeId' label='告警类型' rules={[{ required:true, message:'请指定一种告警类型'}]}>
                    <Select onChange={value=>{
                        let temp = typeList.filter(i=>i.typeId === value)[0];
                        // console.log(temp);
                        setCurrentType(temp || {});
                    }} dropdownRender={(menu)=>(
                        <>
                            { menu }
                            <Divider style={{ margin:'8px 0'}} />
                            <div style={{ display:'flex', padding:'1rem' }}>
                                <Input  style={{ flex:'1', marginRight:'1rem' }} value={value} allowClear={true} onChange={e=>setValue(e.target.value)} placeholder='可输入告警类型查询' />
                            </div>   
                        </>
                    )} >
                        {
                            typeList && typeList.length 
                            ?
                            typeList.map(item=>(
                                <Option key={item.typeId} value={item.typeId}>{ item.typeName }</Option>
                            ))
                            :
                            null
                        }
                    </Select>
                </Form.Item>
            }
            
            <Form.Item name='warningMin' label='最小阈值' rules={[{ required:true, message:'最小阈值不能为空'}]}>
                <InputNumber style={{width:'100%'}} addonAfter={currentType.unitName || '--'} />
            </Form.Item>
            <Form.Item name='warningMax' label='最大阈值' rules={[{ required:true, message:'最大阈值不能为空'}]}>
                <InputNumber style={{ width:'100%'}} addonAfter={currentType.unitName || '--'}/>
            </Form.Item>
            <Form.Item name='attrIds' label='关联属性' rules={[{ required:true, message:'关联属性不能为空'}]}>
                <TreeSelect
                    style={{
                        width: '100%',
                    }}
                    dropdownStyle={{
                        maxHeight: 400,
                        overflow: 'auto',
                    }}
                    placeholder="选择规则关联哪些属性"
                    allowClear
                    multiple
                    treeDefaultExpandAll
                    maxTagCount={5}
                    // onChange={(value)=>{
                    //     setSelectedAttrs(value);
                    // }}
                    treeData={fieldAttrs}
                />
            </Form.Item> 
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset:4 }}>
                <Button type="primary" style={{ marginRight:'1rem' }} htmlType="submit">确定</Button>
                <Button type="primary" onClick={()=>onClose()}> 取消 </Button>
            </Form.Item>
        </Form>
    )
}

export default RuleForm;