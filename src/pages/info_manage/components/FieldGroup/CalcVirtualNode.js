import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, TreeSelect, Select, DatePicker, Input, Form, Tag, Button, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
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

let id = 0;
function CalcVirtualNode({ dispatch, fieldAttrs, selectedAttr, calcRuleList, onClose }){
    // console.log(selectedAttr);
    const [form] = Form.useForm();
    const inputRefs = useRef();
    const [rules, setRules] = useState(calcRuleList);
    useEffect(()=>{
        return ()=>{
            form.resetFields();
            id = 0;
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
                            { index === 0 && item.calc_type === 1 ? null : <span style={{ margin:'0 8px' }}>{ item.calc_type ? item.calc_type === 1 ? '+' : '-' : '+'}</span> }
                            <Tag color='blue'>{ item.calc_attr_id ? getCalcAttrName(fieldAttrs, item.calc_attr_id, {}) : '----' }</Tag>
                            <span>×</span>
                            <span>{ item.calc_ratio || 1 }</span>
                        </span>                       
                    ))      
                    :
                    null
                }
            </div>
            <div>
                {
                    rules.length 
                    ?
                    rules.map((row,index)=>{
                        id++;
                        row.rowId = index;
                        return (
                            <Row gutter={24} key={index} >
                                <Col span={3}>
                                    <Form.Item 
                                        label='运算符' 
                                        // name={`${index}-calc_type`}
                                        rules={[{ required:true, message:'选择运算的维度属性' }]}
                                    >
                                        <Select placeholder="请选择运算符" value={row['calc_type']} onChange={value=>{
                                            let newArr = rules.concat();
                                            newArr[row.rowId]['calc_type'] = value;
                                            setRules(newArr);
                                        }}>
                                            <Option value={1}>+</Option>
                                            <Option value={2}>-</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item 
                                        // name={`${index}-calc_attr_id`}
                                        rules={[{ required:true, message:'选择运算的维度属性' }]}
                                        label='维度属性'
                                    >
                                        <TreeSelect
                                            value={row['calc_attr_id']}
                                            style={{ whiteSpace:'nowrap' }}
                                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                            treeData={fieldAttrs}
                                            placeholder="请选择运算维度"                                    
                                            treeDefaultExpandAll
                                            onChange={value=>{
                                                let newArr = rules.concat();
                                                newArr[row.rowId]['calc_attr_id'] = value;
                                                setRules(newArr);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item
                                        // name={`${index}-calc_ratio`}
                                        rules={[{ required:true, message:'系数不能为空' }]}
                                        label='系数'
                                    >
                                        <Input 
                                            ref={inputRefs}
                                            // ref={dom=>inputRefs.current.push(dom)} 
                                            placeholder='请输入系数' 
                                            value={row['calc_ratio']} 
                                            onChange={e=>{
                                                let newArr = rules.concat();
                                                newArr[row.rowId]['calc_ratio'] = e.target.value;
                                                setRules(newArr);
                                                // console.log(inputRefs);
                                        }}/>
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item
                                        label='开始时间'
                                    >
                                        <DatePicker locale={zhCN} placeholder='不填则不限制' value={row['begin_date'] ? moment(row['begin_date']) : null} onChange={value=>{
                                            let newArr = rules.concat();
                                            newArr[row.rowId]['begin_date'] = value;
                                            setRules(newArr);
                                        }} />
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item
                                        label='结束时间'
                                    >
                                        <DatePicker locale={zhCN} placeholder='不填则不限制' value={row['end_date'] ? moment(row['end_date']) : null } onChange={value=>{
                                            let newArr = rules.concat();
                                            newArr[row.rowId]['end_date'] = value;
                                            setRules(newArr);
                                        }} />
                                    </Form.Item>
                                </Col>
                                <Col span={1}>
                                    <CloseCircleOutlined style={{ marginTop:'10px', marginLeft:'6px', fontSize:'1.2rem', color:'#ccc' }} onClick={()=>{                                                                  
                                       
                                        let deleteItem = rules.filter(i=>i.rowId === row.rowId )[0];
                                        let newArr = rules.filter(i=>i.rowId !== row.rowId );
                                      
                                        
                                        if ( deleteItem.id ){
                                            // 如果是已存在公式，调用删除接口
                                            new Promise((resolve, reject)=>{
                                                dispatch({ type:'fieldDevice/deleteCalc', payload:{ resolve, reject, id:deleteItem.id }})
                                            })
                                            .then(()=>{
                                                console.log(newArr);
                                                setRules(newArr);
                                            })
                                            .catch(msg=>message.info(msg))
                                        } else {
                                            setRules(newArr);
                                        }                                        
                                    }} />
                                </Col>
                            </Row>
                        )
                    })
                    :
                    null
                }
                
                <Row gutter={24}>
                    <Col span={12}>
                        <Button type='primary' style={{ marginRight:'10px'}} onClick={()=>{
                            let newArr = rules.concat();
                            newArr.push({ calc_type:1, calc_attr_id:null, calc_ratio:1, begin_date:null, end_date:null  });
                            setRules(newArr);
                        }} icon={<PlusOutlined />}>
                            添加运算规则
                        </Button>
                        <Button type='primary' style={{ marginRight:'20px' }} onClick={()=>{
                            
                            rules.forEach(item=>{
                                item.attr_id = selectedAttr.key;
                                
                            });
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'fieldDevice/addCalc', payload:{ resolve, reject, rules }})
                            })
                            .then(()=>{
                                message.success('添加运算公式成功');
                                onClose();
                            })
                            .catch(msg=>message.error(msg));
                        }}>提交</Button>
                        <Button onClick={()=>onClose()}>取消</Button>
                    </Col>
                </Row>
            </div>
               
                
        </div>
    )
}

export default CalcVirtualNode;