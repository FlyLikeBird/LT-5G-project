import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import { Input, Skeleton, Spin, Radio, DatePicker, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import style from './report.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import reportBg from '../../../../public/report-bg.jpg';
import LogoImg from '../../../../public/logo2.png';

import PageItem0 from './components/PageItem0';
import PageItem1 from './components/PageItem1';
import PageItem2 from './components/PageItem2';

let canDownload = false;
let timer ;
function getBase64(dom){
    return html2canvas(dom, { dpi:96, scale:1 })
        .then(canvas=>{
            let MIME_TYPE = "image/png";
            return canvas.toDataURL(MIME_TYPE);
        })
}

function getPromise(dispatch, action){
    return new Promise((resolve, reject)=>{
        // forReport字段为了优化请求流程，不重复请求维度接口，共享维度属性树全局状态
        dispatch({ ...action, payload:{ resolve, reject, forReport:true }});
    })
}


function AnalyzeReport({ dispatch, user, fields, energy, cost, alarm, baseCost }){
    const containerRef = useRef(null);
    const [loading, toggleLoading] = useState(false);
    const [downLoading, setDownLoading] = useState(false);
    const { currentCompany, userInfo, timeType, startDate, endDate } = user;
    let companyName = currentCompany.company_name ? currentCompany.company_name : '';
    // 时段信息取最小值，在最小值时段加大生产;
    function updateData(){
        canDownload = false;
        toggleLoading(true);
        Promise.all([
            // 电价信息结论
            getPromise(dispatch, { type:'baseCost/fetchMeasureCost'}),
            getPromise(dispatch, { type:'baseCost/fetchBaseCost'}),
            getPromise(dispatch, { type:'baseCost/fetchAdjustCost'}),
            // 能源成本接口
            getPromise(dispatch, { type:'energy/fetchLocalMonth' }),
            getPromise(dispatch, { type:'energy/fetchCostInfo'}),
            getPromise(dispatch, { type:'energy/fetchTotalCost'}),
            // 能源趋势接口
            getPromise(dispatch, { type:'cost/fetchCostTrend'}),
            getPromise(dispatch, { type:'cost/fetchCostQuota'}),
            getPromise(dispatch, { type:'alarm/fetchAlarmIndex' }),
            getPromise(dispatch, { type:'alarm/fetchAttrAlarmList'}),
        ])
        .then(()=>{
            // 当所有数据加载完，才可以开始下载
            dispatch({ type:'energy/updateEnergyType' });
            toggleLoading(false);
            canDownload = true;
        })
        .catch(err=>{
            console.log(err);
        })
    }
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            // 设置时间维度为月, 初始化维度属性
            dispatch({ type:'user/toggleTimeType', payload:'2' });                    
            dispatch({ type:'fields/init', payload:{ resolve, reject, typeCode:'total' }});
        })
        .then(()=>{
            updateData();
        })
        
        return ()=>{
            canDownload = false;
            clearTimeout(timer);
        }
    },[]);
    
    const handleDownload = ()=>{
        let container = containerRef.current;
        if ( container ){
            let pageDoms = container.getElementsByClassName(style['page-container']);
            Promise.all(Array.from(pageDoms).map(dom=>getBase64(dom)))
            .then(base64Imgs=>{
                // 210mm * 297mm
                var pdf = new jsPDF('p', 'mm', 'a4');
                 let containerWidth = containerRef.current.offsetWidth;
                 let containerHeight = containerRef.current.offsetHeight;
                 // 600 * 800 报告dom原尺寸:1152 1304
                 let pageWidth = pdf.internal.pageSize.getWidth();
                 let pageHeight = pdf.internal.pageSize.getHeight();
                 base64Imgs.map((img, index)=>{
                    pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
                    if ( index === base64Imgs.length - 1 ) return ;
                    pdf.addPage();
                })
                pdf.save('诊断报告.pdf');
                setDownLoading(false);   
            })
        }
    }
    return (
        <div className={style['container']}>
            <div className={style['report-container']}>
                {
                    downLoading
                    ?
                    <div style={{ zIndex:'500', position:'fixed', left:'0', right:'0', top:'0', bottom:'0' ,backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center', color:'#fff' }}>
                            <div>报告生成中，请稍后...</div>
                            <Spin size='large' />
                        </div>
                    </div>
                    :
                    null
                }
                {
                    loading
                    ?
                    <div style={{ zIndex:'500', position:'fixed', left:'0', right:'0', top:'0', bottom:'0' ,backgroundColor:'rgba(0,0,0,0.8)'}}>
                        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center', color:'#fff' }}>
                            <div>数据加载中，请稍后...</div>
                            <Spin size='large' />
                        </div>
                    </div>
                    :
                    null
                }
                <div style={{ width:'100%'}} ref={containerRef}>
                    <div style={{ position:'fixed', left:'14%', top:'50%', transform:'translateY(-50%)' }}>
                        <DatePicker className={style['custom-date-picker']} locale={zhCN}  picker='month' allowClear={false} value={startDate}  onChange={(value)=>{
                            // 更新自然月的月初和月末时间段
                            var date = value.format('YYYY-MM-DD');
                            dispatch({ type:'user/setDate', payload:{ startDate:moment(date).startOf('month'), endDate:moment(date).endOf('month') }})
                            // 重新请求相关的所有接口
                            updateData();
                        }} />
                    </div>
                    {/* 报告封面 */}
                    <div className={`${style['page-container']}`} style={{ height:'860px', color:'#fff', backgroundImage:`url(${reportBg})`}}>
                        <div style={{ position:'absolute', width:'200px', left:'100px', top:'330px'}}>
                            <img src={LogoImg} style={{ width:'100%', height:'auto' }} />
                        </div>
                        {/* <div style={{ position:'absolute', right:'40px', top:'50px' }}>能源云 | 节能咨询 | 设备运维 | 能源大数据</div> */}
                        <div style={{ position:'absolute', left:'100px', fontSize:'3rem', whiteSpace:'nowrap', top:'400px', textAlign:'left'}}>
                            <div style={{ fontWeight:'bold' }}>{ companyName }</div>
                            <div>{`${startDate.year()}年-${startDate.month() + 1}月能源运行报告`}</div>
                        </div>
                        {/* <div style={{ position:'absolute', width:'120px', bottom:'10%', left:'100px'}}>
                            <img src={codeImg} style={{ width:'100%', height:'auto' }} />
                        </div> */}
                    </div>
                    {/* 全局日期和维度控制 */}
                    
                    {/* 诊断结论 */}
                    {/* <PageItem0 title='诊断结论-The Diagnosis Summary' companyName={companyName} /> */}
                    {/* 能源成本分析 */}
                    <PageItem1 title='能源成本分析-Energy Cost Analysis' dispatch={dispatch} baseCost={baseCost} energy={energy} fields={fields} cost={cost} startDate={startDate} companyName={userInfo.companyName}/>
                    {/* 能源安全分析 */}
                    <PageItem2 title='能源安全分析-Energy Safety Analysis' alarm={alarm} companyName={userInfo.companyName} />
                </div>

                {/* 操作button */}
                    <Button style={{ width:'46px', height:'46px', position:'fixed', right:'10%', bottom:'10%' }} type='primary' shape='circle' icon={<DownloadOutlined />} onClick={()=>{
                        if ( canDownload ){
                            setDownLoading(true);
                            handleDownload();
                        } else {
                            message.info('数据还在加载，请稍后再点击下载');
                        }
                    }}/>

            </div>
        </div>
    )
}

export default connect(({ user, fields, energy, cost, alarm, baseCost })=>({ user, fields, energy, cost, alarm, baseCost }))(AnalyzeReport);