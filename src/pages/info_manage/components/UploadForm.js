import React, { useState } from 'react';
import { Form, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

function UploadForm({ onDispatch, onClose, forFill }){
    let [fileList, changeFileList] = useState([]);

    return (
        <Form {...layout}>
            <Form.Item label="选择文件" name="upload">
                 <Upload 
                     fileList={fileList} 
                     onRemove={(file)=>{
                         let index = fileList.indexOf(file);
                         let newArr = fileList.slice();
                         newArr.splice(index,1);
                         changeFileList(newArr);
                     }} 
                     beforeUpload={ file => {
                         let type = file.name.split('.')[1];
                         if ( type === 'xls' || type === 'xlsx' ){
                             changeFileList([...fileList, file]);
                         } else {
                             message.error('请上传EXCEL格式文件');
                         }
                         return false;
                     }}
                 >
                     {
                        !fileList.length
                        ?
                        <Button>
                            <PlusOutlined />上传EXCEL模板文件
                        </Button>
                        :
                        null
                     }
                 </Upload>
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                <Button type="primary" onClick={()=>{
                     if (!fileList.length){
                         message.error('还没有上传EXCEL文件');
                     } else {
                        message.info('模板正在导入中,请稍后...');
                        new Promise((resolve, reject)=>{
                            if ( forFill ) {
                                onDispatch({type:'fill/importTplAsync', payload:{ resolve, reject, file:fileList[0] }});
                            } else {
                                onDispatch({type:'quota/importTplAsync', payload:{ resolve, reject, file:fileList[0] }});
                            }
                        })
                        .then(()=>{
                            message.success('导入数据成功');
                            onClose();
                        })
                        .catch(msg=>message.error(msg))
                     }
                }}>导入</Button>
                <Button style={{margin:'0 10px'}} onClick={()=>onClose()}>取消</Button>
            </Form.Item>
        </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.onDispatch !== nextProps.onDispatch ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(UploadForm, areEqual);