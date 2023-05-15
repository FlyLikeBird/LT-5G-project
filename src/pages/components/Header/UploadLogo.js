import React, { useState } from 'react';
import { Modal, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

function getBase64(file){
    return new Promise(( resolve, reject)=>{
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = ()=> resolve(reader.result);
        reader.onerror = (error)=> reject(error);
    })
}
const Logo = (
    <div>
      <div style={{ marginTop: 8 }}>上传公司logo(190*50)</div>
    </div>
);
const ThumbLogo = (
  <div>
    <div style={{ marginTop: 8 }}>上传公司缩略logo(70*50)</div>
  </div>
);

function UploadLogo({ visible, onClose, onDispatch }){
    const [logoFile, setLogoFile] = useState('');
    const [thumbLogoFile, setThumbLogoFile] = useState('');
    const beforeUpload = ( file, type )=>{
        // console.log(file);
        // 图片大小不能超过2M 
        let isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
        if ( !isJpgOrPng ) {
            message.error('请上传正确的图片格式');
            return false;
        }
        let isLt5M = file.size / 1024 / 1024 < 2;
        if ( !isLt5M ) {
            message.info('图片大小不能超过2M');
            return false;
        }
        getBase64(file)
        .then(url=>{
            file.preview = file.url = url;
            let image = new Image();
            image.src = url;
            image.onload = ()=>{
                if ( type === 'logo') {
                    if ( image.width === 190 && image.height === 50 ){
                        setLogoFile(file);
                    } else {
                        message.info('logo尺寸为190*50,请按要求修改后重新上传')
                    }
                } else if ( type === 'thumbLogo') {
                    if ( image.width === 70 && image.height === 50 ){
                        setThumbLogoFile(file);
                    } else {
                        message.info('logo缩略图尺寸为70*50,请按要求修改后重新上传')
                    }
                }
            }
        })
        return false;
    };
    
    return (
        <Modal visible={visible} onCancel={()=>{
            setLogoFile('');
            setThumbLogoFile('');
            onClose();
        }} okText='上传' cancelText='取消' onOk={()=>{
            if ( !logoFile ) {
                message.info('请上传公司logo')
                return;
            } 
            if ( !thumbLogoFile ){
                message.info('请上传logo缩略图')
                return;
            }
            Promise.all([
                new Promise((resolve, reject)=>{
                    onDispatch({ type:'user/upload', payload:{ file:logoFile, resolve, reject }})
                }),
                new Promise((resolve, reject)=>{
                    onDispatch({ type:'user/upload', payload:{ file:thumbLogoFile, resolve, reject }})
                })
            ])
            .then(([logoData, thumbLogoData])=>{
                new Promise((resolve, reject)=>{
                    onDispatch({ type:'user/changeCompanyLogo', payload:{ logoData, thumbLogoData, resolve, reject } });
                })
                .then(()=>{
                    setLogoFile('');
                    setThumbLogoFile('');
                    onClose();
                })
                .catch(msg=>{
                    message.error(msg);
                })
            })
                // new Promise((resolve, reject)=>{
                //     let action = currentPath === '/energy/energy_manage' ? 'energy/setSceneInfo' : currentPath === '/energy/alarm_manage' ? 'alarm/setSceneInfo' : '';
                //     dispatch({ type:action, payload:{ file:fileList[0], resolve, reject }})
                // })
                // .then(()=>toggleVisible(false))
                // .catch(msg=>message.error(msg))
            
        }}>
            <div style={{ display:'inline-block', verticalAlign:'top' }}>
                <Upload 
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file)=>beforeUpload(file, 'logo')}
                >
                    { logoFile ? <img src={logoFile.url} style={{ width:'100%'}} /> : Logo }
                </Upload>
            </div>
            <div style={{ display:'inline-block', verticalAlign:'top' }}>
                <Upload 
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file)=>beforeUpload(file, 'thumbLogo')}
                >
                    { thumbLogoFile? <img src={thumbLogoFile.url} style={{ width:'100%'}} /> : ThumbLogo }
                </Upload>
            </div>
        </Modal>
    )
}

export default UploadLogo;
