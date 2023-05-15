import React, { useState, useEffect } from 'react';
import { Tabs, Timeline, Form, Button, Upload, Modal, Select, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import style from './AlarmForm.css';
const { Option } = Select;
const { TextArea } = Input;
let tabList = [{ tab:'告警处理', key:1 }, { tab:'告警日志', key:2 }];
const actionMaps = {
    1:'原因分析',
    2:'材料申请',
    3:'材料更换'
}
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};

function AlarmForm({ info, actionTypes, alarmHistory, onClose, onDispatch }){
    const [form] = Form.useForm();
    const [activeKey, setActiveKey] = useState(1);
    const [fileList, setFileList] = useState([]);
    const [imgPath, setImgPath] = useState('');
    useEffect(()=>{
        onDispatch({ type:'alarm/fetchAlarmHistory', payload:{ recordId:info.recordId }})
    },[])
    const handleChange = ( { fileList })=>{
        setFileList(fileList);
    };
    
    const handleBeforeUpload = (file)=>{
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            message.error('只能上传JPG 、JPEG 、GIF、 PNG格式的图片')
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片不能超过2M');
        }
        return false;
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">上传图片</div>
        </div>
    );
    const items = tabList.map(item=>({
        label:item.tab,
        key:item.key,
        children:(
            activeKey === 1 
            ?
            <div>
                <div className={style['container']} style={{ margin:'1rem 0', paddingLeft:'9%' }}>
                    <div className={style['list']}>
                        <span style={{ display:'inline-block', width:'70px' }}>告警设备:</span>
                        <span className={style['data']}>{ info.attrName }</span>
                    </div>
                    <div className={style['list']}>
                        <span style={{ display:'inline-block', width:'70px' }}>告警性质:</span>
                        <span className={style['data']}>{ info.typeName }</span>
                    </div>
                    <div className={style['list']}>
                        <span style={{ display:'inline-block', width:'70px' }}>标准范围:</span>
                        <span className={style['data']}>{ info.warningInfo }</span>
                    </div>
                    <div className={style['list']}>
                        <span style={{ display:'inline-block', width:'70px' }}>实际值:</span>
                        <span className={style['data']}>{ info.warningValue }</span>
                    </div>
                </div>
                {
                    info.status === 3
                    ?
                    null
                    :
                    <Form
                        form={form}
                        { ...layout }
                        onFinish={values=>{
                            new Promise((resolve,reject)=>{
                                values.recordId = info.recordId;
                                values.attrId = info.attrId;
                                values.attrName = info.attrName;
                                values.photos = fileList.map(i=>i.originFileObj);
                                if ( info.actionType === 2 ) {
                                    values.logTypeName = actionTypes.filter(i=>i.typeId === +values.logTypeId)[0].logTypeName;
                                }
                                onDispatch({type:'alarm/confirmRecord', payload:{ values, resolve, reject, recordId:info.recordId, status:info.actionType }}); 
                            })
                            .then(()=>onClose())
                            .catch(msg=>{
                                message.error(msg);

                            }) 
                        }}
                    >

                        {
                            info.actionType === 2
                            ?
                            <Form.Item label='跟进类型:' name='logTypeId' rules={[{ required: true, message:'请选择跟进类型' }]}>
                                <Select>
                                    {
                                        actionTypes.length 
                                        ?
                                        actionTypes.map(item=>(
                                            <Option key={item.typeId}>{ item.typeName }</Option>
                                        ))
                                        :
                                        null
                                    }
                                </Select>
                            </Form.Item>
                            :
                            null
                        }                        
                        <Form.Item label='执行措施:' name='logDesc' rules={[{ required: true, message:'请简短描述执行措施' }]}>
                            <TextArea />
                        </Form.Item>
                        <Form.Item label='处理凭证:'>
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={handleChange}
                                onPreview={()=>{}}
                                beforeUpload={handleBeforeUpload}
                            >
                                {
                                    fileList.length >= 4 ? null : uploadButton
                                }
                            </Upload>
                        </Form.Item>
                        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                            <Button type='primary' htmlType='submit'>{ info.actionType === 2 ? '添加进度' : info.actionType === 4 ? '挂起' : '结单' }</Button>
                            <Button onClick={()=>onClose()} style={{ marginLeft:'1rem'}}>关闭</Button>
                        </Form.Item>   
                    </Form>
                }
            </div>
            :
            <div style={{ position:'relative', minHeight:'416px' }}>
                {
                    alarmHistory && alarmHistory.length
                    ?
                    <Timeline mode='left' >
                        {
                            alarmHistory.map((item,index)=>(
                                <Timeline.Item label={item.logTime}>
                                    <div className={style['progress-container']}>
                                        <div className={style['progress-title']}>{ actionMaps[item.logTypeId] }</div>
                                        <div className={style['progress-content']}>
                                            <div>操作人: { item.actionUserName }</div>
                                            <div style={{ margin:'0.5rem 0'}}>{ item.logDesc }</div>
        
                                            {
                                                item.photoPaths && item.photoPaths.length
                                                ?
                                                <div className={style['img-container']}>
                                                    {
                                                        item.photoPaths.map(img=>(
                                                            <div className={style['img-wrapper']} onClick={()=>setImgPath(img)} style={{ cursor:'pointer', backgroundImage:`url(${img})`}}></div>
                                                        ))
                                                    }                                                    
                                                </div>
                                                :
                                                null
                                            }
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))
                        }
                    </Timeline>
                    :
                    <div style={{ fontSize:'1.2rem', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)' }}>告警日志为空</div>
                }
            </div>
        )
    }));
    return (
        <div>
            <Tabs items={items} activeKey={activeKey} onChange={activeKey=>setActiveKey(activeKey)} />  
            <Modal
                visible={imgPath ? true : false }
                onCancel={()=>setImgPath('')}
                closable={true}
                footer={null}
            >
                <img src={imgPath} />
            </Modal>                             
        </div>
        
    )
}

export default AlarmForm;