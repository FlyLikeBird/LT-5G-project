import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Tree, message, Input } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import AddAttrForm from './AddAttrForm';
import BindMeterContainer from './BindMeterContainer';
import style from './FieldGroup.css'
const { Option } = Select;

function formatTreeNode(data, editingKey, inputRef, value, onUpdate, onSave, expandedKeys){
    let result = data.map(node=>{
        node.title = node.attrId === editingKey 
            ?
            (<Input value={value} ref={inputRef} onChange={e=>onUpdate(e.target.value)} onBlur={()=>onSave()} onPressEnter={()=>onSave()} />)
            :
            node.attrName;
        expandedKeys.push(node.attrId);
        if ( node.children && node.children.length ) {
            node.children = formatTreeNode(node.children, editingKey, inputRef, value, onUpdate, onSave, expandedKeys);
        }
        return node;
    });
    return result;
}
let timer = null;
function FieldGroup( { currentField, fieldAttrs, bindMeters, currentPage, total, currentAttr, onDispatch }) {
    useEffect(()=>{  
        if ( currentField.fieldId ) {
            onDispatch({ type:'fields/fetchFieldAttrs' });
        }
    },[currentField]);
    const [info, setInfo] = useState({ visible:false, isChild:false });
    const [value, setValue] = useState('');
    const [editingKey, setEditingKey] = useState('');
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const inputRef = useRef();
    // console.log(fieldAttrs);
    // console.log(currentField);
    // console.log(currentAttr);
    const handleSave = ()=>{
        if ( value ){
            // 更新维度属性
            if ( value !== currentAttr.attrName ) {
                new Promise((resolve, reject)=>{
                    onDispatch({ type:'fields/updateAttrAsync', payload:{ resolve, reject, fieldAttrId:currentAttr.attrId, fieldAttrName:value }})
                })
                .then(()=>{
                    message.success('更新属性成功');
                })
                .catch(msg=>message.error(msg));
            }
            setEditingKey('');
            setValue('');
        } else {
            message.info('属性不能为空');
        }    
    }
    useEffect(()=>{
        let temp = [];
        let arr = formatTreeNode(fieldAttrs, null, inputRef, value, (value)=>setValue(value), handleSave, temp);
        setTreeData(arr);
        setExpandedKeys(temp);  
    },[fieldAttrs]);
    useEffect(()=>{
        let arr = formatTreeNode(fieldAttrs, editingKey, inputRef, value, (value)=>setValue(value), handleSave, []);
        setTreeData(arr);  
        timer = setTimeout(()=>{
            if ( inputRef.current && inputRef.current.focus ) inputRef.current.focus();  
        },500) 
    }, [editingKey, value]);
    useEffect(()=>{
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[])
    return (
        <div className={style['container']}>
            <Card
                className={style['attr-container']}
                title={
                    <div className={style['button-container']}>
                        <Button style={{ flex:'1', margin:'0 0.5rem' }} type="primary" disabled={currentAttr.parentId ? false : true } onClick={()=>setInfo({ visible:true, isChild:false })}>添加同级</Button>
                        <Button style={{ flex:'1', margin:'0 0.5rem' }} type="primary" onClick={()=>setInfo({ visible:true, isChild:true })}>添加下级</Button>
                        {/* <div><Button type="primary" onClick={()=>onDispatch({type:'fieldDevice/toggleAttrModal', payload: { visible:true, forSub:false, editAttr:true }})}>编辑属性</Button></div> */}
                        <Popconfirm title="确定要删除吗?" okText="确定" cancelText="取消" onConfirm={()=>{
                            new Promise(( resolve, reject )=>{
                                onDispatch({ type:'fields/delAttrAsync', payload:{ resolve, reject, fieldAttrId:currentAttr.attrId }})
                            })
                            .then(()=>{
                                message.success('删除属性成功');
                            })
                            .catch(msg=>message.error(msg));
                        }}>
                            <Button style={{ flex:'1', margin:'0 0.5rem' }} type="primary" disabled={currentAttr.parentId ? false : true}>删除属性</Button>
                        </Popconfirm>
                    </div>
                }
            >
                <Tree
                    onExpand={(expandedKeys)=>{
                        setExpandedKeys(expandedKeys);
                    }}
                    expandedKeys={expandedKeys}
                    treeData={treeData}
                    selectedKeys={[currentAttr.attrId]}
                    onSelect={( selectedKeys, { node })=>{
                        onDispatch({ type:'fields/setCurrentAttr', payload:node });
                    }}
                    onRightClick={({ e, node })=>{
                        setValue(node.title);
                        setEditingKey(node.key);
                        onDispatch({ type:'fields/setCurrentAttr', payload:node });
                        // setValue(node.title);
                    }}
                />                         
                
            </Card>
            <BindMeterContainer
                onDispatch={onDispatch} 
                currentAttr={currentAttr} 
                bindMeters={bindMeters} 
                currentPage={currentPage}
                total={total}
            />
            <Modal
                footer={null}
                visible={info.visible}
                bodyStyle={{padding:'2rem'}}
                destroyOnClose={true}
                closable={false}
                onCancel={()=>setInfo({ visible:false })}
            >
                <AddAttrForm
                    info={info}
                    onDispatch={onDispatch}
                    onClose={()=>setInfo({ visible:false })}
                />
            </Modal>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( 
        prevProps.currentField !== nextProps.currentField || 
        prevProps.currentAttr !== nextProps.currentAttr || 
        prevProps.bindMeters !== nextProps.bindMeters
    ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(FieldGroup, areEqual);
