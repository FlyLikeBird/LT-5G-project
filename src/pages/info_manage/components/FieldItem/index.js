import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Form, Input, Drawer, Spin, message } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined, BranchesOutlined, EnvironmentOutlined, ThunderboltOutlined, HomeOutlined, CompassOutlined   } from '@ant-design/icons';
import style from '../../../IndexPage.css';

const { Option } = Select;

const FieldItemIcons = {
    1:<BranchesOutlined />,
    2:<EnvironmentOutlined />,
    3:<ThunderboltOutlined />,
    4:<HomeOutlined />,
    5:<CompassOutlined />
}

function FieldItem({ data, dispatch, onVisible, theme }){
    let { fieldName, fieldId, fieldType } = data;
    let borderColor = theme === 'dark' ? '#303463' : '#f0f0f0';
    let [editing, toggleEditing] = useState(false);
    let [value, changeValue] = useState(fieldName);
    let inputRef = useRef();
    const handleEdit = () => {
        new Promise((resolve, reject)=>{
            dispatch({type:'fields/updateFieldAsync', payload:{ fieldName:value, fieldId, resolve, reject }});
        })
        .then(()=>{
            toggleEditing(false);
            message.success('更新维度信息成功');
        })
        .catch(msg=>{
            message.error(msg);
        })
    };
    useEffect(()=>{
        if ( editing ) {
            if ( inputRef.current ) {
                inputRef.current.focus();
            }
        }
    },[editing])
    return ( 
        <div className={style['card-container-wrapper']} style={{ width:'auto', height:'auto' }}>
            <div className={style['card-container']} style={{ width:'300px', border:`1px solid ${borderColor}`, overflow:'hidden' }}>
                <div style={{ height:'120px', lineHeight:'120px', textAlign:'center', padding:'0 1rem' }}>
                {
                    editing
                    ?
                    <span><Input size="small" ref={inputRef} value={value} onChange={(e)=>changeValue(e.target.value)} onPressEnter={()=>handleEdit()} /></span>
                    :
                    <span className={style['data']}>{ FieldItemIcons[fieldType]} { fieldName }</span>
                }
                </div>
                <div>
                    {
                        editing
                        ?
                        <div style={{ display:'flex', height:'3.2rem', alignItems:'center', backgroundColor:borderColor}}>
                            <Button style={{ flex:'1', margin:'0 1rem' }} size="small" type="primary" onClick={()=>handleEdit()}>确定</Button>
                            <Button style={{ flex:'1', margin:'0 1rem' }} size="small" onClick={()=>toggleEditing(false)}>取消</Button>
                        </div>
                        :
                        <div style={{ display:'flex', height:'3.2rem', alignItems:'center', backgroundColor:borderColor}}>
                            <SettingOutlined style={{ flex:'1', fontSize:'1.2rem' }} key="setting" onClick={()=>{
                                dispatch({ type:'fields/setCurrentField', payload:data });
                                onVisible(true);
                            }} />
                            <EditOutlined style={{ flex:'1', fontSize:'1.2rem' }} key="edit" onClick={ () => toggleEditing(true)}/>
                            <Popconfirm key="del" title="确定要删除吗?" okText="确定" cancelText="取消" onConfirm={()=>{
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'fields/delFieldAsync', payload:{ fieldId, resolve, reject }})
                                })
                                .then(()=>{
                                    message.success('删除维度信息成功');
                                    
                                })
                                .catch(msg=>{
                                    message.error(msg);
                                })
                            }}><CloseOutlined style={{ flex:'1', fontSize:'1.2rem' }} key="delete" /></Popconfirm>
                        </div>
                    }
                </div>
            </div>
        </div>            
    )   
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(FieldItem, areEqual);
