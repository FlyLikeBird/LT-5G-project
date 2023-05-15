import React, { useState, useEffect } from 'react';
import { Row, Col, Button, TreeSelect, Select, Input, Form, Tag, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
const { Option } = Select;

function getCalcAttrName(tree, attr_id, result){
    tree.forEach(node=>{
        if ( node.key === attr_id ) {
            result['attr_name'] = node.title; 
            return ;
        }
        if ( node.children && node.children.length ){
            getCalcAttrName(node.children, attr_id, result);
        }
    });
    return result.attr_name;
}

let deletedRules = [];
function CalcVirtualNode({ dispatch, fieldAttrs, selectedAttr, calcRuleList, onClose }){
    // console.log(selectedAttr);
    const [form] = Form.useForm();
    const [rules, setRules] = useState(calcRuleList);
    useEffect(()=>{
        return ()=>{
            form.resetFields();
            deletedRules = [];
        }
    },[]);
    useEffect(()=>{
        setRules(calcRuleList);
    },[calcRuleList]);
    return ( 
        <div>
            <div style={{ marginBottom:'20px' }}>
                <span style={{ marginRight:'6px' }}>公式:</span>
                <Tag color='blue'>{ selectedAttr.title }</Tag>
                <span style={{ marginRight:'6px' }}>=</span>
                {
                    rules && rules.length 
                    ?           
                    rules.map((item,index)=>(
                        <span key={index}>
                            { index === 0 && item && item.calc_type === 1 ? null : <span style={{ margin:'0 8px' }}>{ item ? item.calc_type === 1 ? '+' : '-' : '+'}</span> }
                            <Tag color='blue'>{ item && item.calc_attr_id ? getCalcAttrName(fieldAttrs, item.calc_attr_id, {}) : '----' }</Tag>
                            <span>×</span>
                            <span>{ item ? item.calc_ratio : 1 }</span>
                        </span>                       
                    ))      
                    :
                    null
                }
            </div>
            <Form form={form} autoComplete="off" onValuesChange={(a, allValues )=>{                               
                console.log(allValues);
                setRules(allValues.rules);
            }} onFinish={values=>{
                let { rules } = values;
                rules.forEach(item=>{
                    item.attr_id = selectedAttr.key;
                });
                new Promise((resolve, reject)=>{
                    dispatch({ type:'fieldDevice/addCalc', payload:{ resolve, reject, rules, deletedRules }})
                })
                .then(()=>{
                    message.success('添加运算公式成功');
                    onClose();
                })
                .catch(msg=>message.error(msg));
            }}>
                <Form.List name='rules' initialValue={calcRuleList.length ? calcRuleList : [{}]}>
                    {(fields, { add, remove })=>{
                        return (
                            <div>
                                {
                                    fields.map(({ id, key, name, fieldKey, ...restField })=>(
                                        <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                                            <Form.Item 
                                                name={[name,'calc_type']}
                                                fieldKey={[fieldKey, 'calc_type']}
                                                rules={[{ required:true, message:'选择运算符' }]}
                                                label='运算符'
                                                initialValue={1}
                                            >
                                                <Select style={{ width:'160px' }} placeholder="请选择运算符" >
                                                    <Option value={1}>+</Option>
                                                    <Option value={2}>-</Option>
                                                </Select>
                                            </Form.Item>
                                            <Form.Item 
                                                name={[name,'calc_attr_id']}
                                                fieldKey={[fieldKey, 'calc_attr_id']}
                                                rules={[{ required:true, message:'选择运算的维度属性' }]}
                                                label='维度属性'
                                            >
                                                <TreeSelect
                                                    style={{ width:'300px', whiteSpace:'nowrap' }}
                                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                    treeData={fieldAttrs}
                                                    placeholder="请选择运算维度"
                                                   
                                                    treeDefaultExpandAll
                                                />
                                            </Form.Item>                                       
                                            <Form.Item 
                                                name={[name,'calc_ratio']}
                                                fieldKey={[fieldKey, 'calc_ratio']}
                                                rules={[{ required:true, message:'系数不能为空' }]}
                                                label='系数'
                                                initialValue='1'
                                            >
                                                <Input placeholder='请输入系数' />
                                            </Form.Item>
                                            {/* {
                                                fields.length > 1
                                                ? */}
                                                <CloseCircleOutlined style={{ marginTop:'10px', marginLeft:'6px', fontSize:'1.2rem', color:'#ccc' }} onClick={()=>{                                     
                                                    remove(name);     
                                                    deletedRules.push(name);                                       
                                                    
                                                }} />
                                                {/* :
                                                null
                                            } */}
                                            
                                        </div>
                                    ))                                          
                                }
                                <Form.Item>
                                    <Button type='primary' style={{ marginRight:'10px'}} onClick={() => add()} icon={<PlusOutlined />}>
                                        添加运算规则
                                    </Button>
                                    <Button type='primary' htmlType='submit' style={{ marginRight:'10px' }}>提交</Button>
                                    <Button onClick={()=>onClose()}>取消</Button>
                                </Form.Item>
                            </div>
                        )
                    }}
                </Form.List>
            </Form>
        </div>
    )
}

export default CalcVirtualNode;