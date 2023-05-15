import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form, Input, Upload, Button, Select, Cascader, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { regionData } from 'element-china-area-data';
import AMapLoader from '@amap/amap-jsapi-loader';

const { Option } = Select;
const { Search } = Input;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{8,20}$/ ;
let msg = '密码需是包含字母/数字/特殊字符且长度8-15位的字符串';
let map = null;
let loaded = false;
let points = [];

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

function CompanyForm({ info, AMap, onDispatch, onClose }){
    const [form] = Form.useForm();
    const [pos, setPos] = useState({});
    const [visible, setVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [previewInfo, setPreviewInfo] = useState({});
    const [address, setAddress] = useState('');
    const handleChange = ( { fileList })=>{
        setFileList(fileList);
    };
    const handlePreview = (file)=>{
        // file.thumbUrl 默认编译成200*200像素的64位字符串, 用FileReader重新解析
        if ( !file.preview ) {
            getBase64(file.originFileObj)
                .then(data=>{
                    file.preview = data;
                    setPreviewInfo({
                        visible:true,
                        img:data,
                        title:file.name
                    });
                })
        } else {
            setPreviewInfo({
                visible:true,
                img:file.preview,
                title:file.name
            })
        }
    };
    const handleBeforeUpload = (file)=>{
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            message.error('只能上传JPG 、JPEG 、GIF、 PNG格式的图片')
        }
        const isLt2M = file.size / 1024 < 500;
        if (!isLt2M) {
            message.error('Logo不能超过500KB');
        }
        return false;
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">上传Logo</div>
        </div>
    );    
    useEffect(()=>{        
        if ( !AMap ){
            AMapLoader.load({
                key:'26dbf93c4af827e4953d7b72390e3362',           
            })
            .then((MapInfo)=>{
                onDispatch({ type:'user/setMap', payload:MapInfo });
            })
            .catch(e=>{
                console.log(e);
            })
        }
        if ( info.forEdit ){
            // 初始化表单状态
            let { companyName, companyAddress, province, city, area, lat, lng, linkPhone, logoPath } = info.current;
            form.setFieldsValue({
                companyName,
                region:[province, city, area],
                linkPhone
            });
            setPos({ lng, lat });
            setAddress(companyAddress);
            console.log()
            if ( logoPath ) {
                setFileList([
                    {
                        uid: '-1',
                        name: 'image.png',
                        status: 'done',
                        url:logoPath || ''
                    }
                ])
            } else {
                setFileList([]);
            }
           
        }
        return ()=>{
            if ( map && map.destroy ){
                map.destroy();
            }
            map = null;
            loaded = false;
            points = [];
        }
    },[]);
    useEffect(()=>{
        if ( AMap ){
            if ( !loaded && visible ) {
                map = new AMap.Map('my-map',{
                    resizeEnable:true,
                    zoom:10,
                    // center:[currentCompany.lng, currentCompany.lat]
                });
                loaded = true;
            }
        }
    },[AMap, visible]);
    return (
        
            <Form 
                {...layout}
                form={form} 
                name="nest-messages" 
                onFinish={values=>{
                    if ( Object.keys(pos).length && address ) {
                        values.lng = pos.lng;
                        values.lat = pos.lat;
                        values.companyAddress = address;
                        let region = values.region;
                        values.province = region[0];
                        values.city = region[1];
                        values.area = region[2];
                        if ( fileList.length ) {
                            if(info.forEdit) {
                                values.companyId = info.current.companyId;
                            }
                            values.fileList = fileList.map(i=>i.size ? i.originFileObj : i);
                            new Promise((resolve,reject)=>{
                                onDispatch({ type:'userList/addCompanyAsync', payload:{ resolve, reject, values, forEdit:info.forEdit }})                                    
                            }).then(()=>{
                                message.success(info.forEdit ? '更新公司成功':'添加公司成功');
                                onClose();
                            }).catch(msg=>{
                                message.error(msg);
                            })  
                        } else {
                            message.info('请上传公司Logo图片');
                        }
                    } else {
                        message.info('请选择公司位置')
                    }
                                  
                }}
            >
                <Form.Item name='companyName' label="公司名称" rules={[{ required: true, message:'公司名称不能为空' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name='region' label="归属地" rules={[{ required: true, message:'请选择公司归属地' }]}>
                    <Cascader
                        fieldNames={{ label:'label', value:'label' }}
                        options={regionData}
                    />
                </Form.Item>
                <Form.Item name='linkPhone' label='负责人电话'>
                    <Input />
                </Form.Item>
                <Form.Item label='地址' >
                    {
                        Object.keys(pos).length 
                        ?
                        <div style={{ display:'flex', alignItems:'center', padding:'0 10px', height:'30px', border:'1px solid #d9d9d9', borderRadius:'2px' }}>
                            <Input style={{ color:'#4b96ff', flex:'1', border:'none', background:'transparent', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }} value={address} onChange={e=>setAddress(e.target.value)} />
                            <span style={{ color:'#4b96ff', cursor:'pointer' }} onClick={()=>setVisible(true)}>重新定位</span>
                        </div>
                        :
                        <Button type='primary' onClick={()=>setVisible(true)}>选择公司位置</Button>
                    }
                </Form.Item>
                
                <Form.Item label='公司Logo'>
                   
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleChange}
                        onPreview={()=>{}}
                        beforeUpload={handleBeforeUpload}
                    >
                        {
                            fileList.length === 1 ? null : uploadButton
                        }
                    </Upload>
                </Form.Item>
                
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button type="primary" htmlType="submit">
                        { info.forEdit ? '修改' : '添加' }
                    </Button>
                    <Button style={{ marginLeft:'10px' }} onClick={()=>onClose()}>取消</Button>
                </Form.Item>
                <Modal visible={visible} footer={null} onCancel={()=>setVisible(false)} width='1000px' title={
                    <div>
                        <Search style={{ width:'260px' }} placeholder='请输入公司名称或关键词查询' onSearch={value=>{            
                            if( AMap && value ){
                                AMap.plugin('AMap.PlaceSearch', ()=>{
                                    let placeSearch = new AMap.PlaceSearch({
                                        extensions:'all',
                                    });
                                    placeSearch.search(value,function(status, result){
                                        // console.log(status);
                                        // console.log(result);
                                        if ( points.length && map.remove ) map.remove(points);
                                        if ( status === 'complete' && result.poiList.pois && result.poiList.pois.length ) {
                                            // 搜索到结果,默认取第一条搜索值
                                            let infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
                                            result.poiList.pois.forEach(point=>{ 
                                                let pos = [point.location.lng, point.location.lat];
                                                let marker = new AMap.Marker({
                                                    position:pos,
                                                    map
                                                });
                                                marker.extData = { company_name:point.name, lng:pos[0], lat:pos[1], address:point.address, province:point.pname, city:point.cityname, area:point.adname };
                                                marker.content = `<div><p style="font-weight:bold;">${point.name}</p><p>地址:${point.address}</p><p>电话:${point.tel}</p></div>`;
                                                marker.on('mouseover', handleShowInfo);
                                                marker.on('click',handleClick);  
                                                points.push(marker);                               
                                            });
                                            
                                            function handleClick(e){
                                                setPos({ lng:e.target.extData.lng, lat:e.target.extData.lat, address:e.target.extData.address });
                                                setAddress(e.target.extData.address);
                                                setVisible(false);
                                            }
                                            function handleShowInfo(e){
                                                infoWindow.setContent(e.target.content);
                                                infoWindow.open(map, e.target.getPosition());
                                            }
                                            map.setFitView();

                                        } else {
                                            message.info('请输入完整的关键词查询');
                                        }
                                    });
                                })
                            } else {
                                message.info('查询位置不能为空');
                            }
                        }}/>
                    </div>
                }>
                    <div id='my-map' style={{ width:'940px', height:'560px' }}></div>
                </Modal>
            </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info || prevProps.AMap !== nextProps.AMap ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(CompanyForm, areEqual);
