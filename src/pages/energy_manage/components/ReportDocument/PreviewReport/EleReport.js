import React, { useState, useRef } from 'react';
import { Button, message } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, ArrowDownOutlined, ArrowUpOutlined, DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import style from './PreviewReport.css';
import Loading from '@/pages/components/Loading';

const colors = ['#65cae3','#2c3b4d','#62a4e2','#57e29f'];
const timeList = [{ key:4, text:'尖' }, { key:1, text:'峰' }, { key:2, text:'平' }, { key:3, text:'谷'}];
const timeMaps = { 1:'峰', 2:'平', 3:'谷', 4:'尖'};
function getBase64(dom){
    return html2canvas(dom, { background:'#fff', scale:2 })
        .then(canvas=>{
            let MIME_TYPE = "image/png";
            return canvas.toDataURL(MIME_TYPE);
        })
}

function PreviewReport({ documentInfo, companyName, currentField, currentAttr, energyInfo, date, costMode, onCancel, onDispatch  }) {
    const { 
        baseCost, baseCostApportionment, costPercentage, localMonthAccountCost, localMonthBaseCostChain, localMonthBaseCostYoy, 
        eleCostGroupByMeterVOList, localMonthDetailData, localMonthSumUsage, pass12MonthData
    } = documentInfo;
    let sumMonthCost = 0;
    const containerRef = useRef(null);
    const [loading, toggleLoading] = useState(false);
    const dateStr = date.format('YYYY-MM').split('-');
    const columns = [
        { merged:true, title:'设备', dataIndex:'meterName' },
        { merged:true, title:'注册码', dataIndex:'registerCode'},
        { merged:true, title:'期初表码', dataIndex:'beginningUsage'},
        { merged:true, title:'期末表码', dataIndex:'finalUsage'},
        { title:'计价阶段', dataIndex:'timeType' },
        { title:'本月用量(kwh)', dataIndex:'timeTypeUsage'},
        { title:'阶段单价(元)', dataIndex:'feeRate'},
        { title:'阶段金额(元)', dataIndex:'timeTypeCost'},
        { merged:true, title:'本月总用量(kwh)', dataIndex:'localMonthUsage' },
        { merged:true, title:'本月总金额(元)', dataIndex:'localMonthCost'}
    ];
    const mergeColumns = [
        { title:'计价阶段', dataIndex:'timeType' },
        { title:'本月用量(kwh)', dataIndex:'timeTypeUsage'},
        { title:'阶段单价(元)', dataIndex:'feeRate'},
        { title:'阶段金额(元)', dataIndex:'timeTypeCost'}
    ];
    const personColumns = [
        { title:'设备', dataIndex:'meterName' },
        { title:'注册码', dataIndex:'registerCode'},
        { title:'期初表码', dataIndex:'beginningUsage'},
        { title:'期末表码', dataIndex:'finalUsage'},
        { title:'本月总用量(' + energyInfo.unit + ')', dataIndex:'localMonthUsage' },
        { title:'本月总金额(元)', dataIndex:'localMonthCost'}
    ];
    
    let tableData = [];
    const finalColumns = costMode === 'company' && energyInfo.typeCode === 'ele' ? columns : personColumns;
    if ( costMode === 'company' && energyInfo.typeCode === 'ele' ) {
        // 工业用电计费模式
        eleCostGroupByMeterVOList.forEach(mach=>{
            // 电能源报告，考虑时段信息
            sumMonthCost += mach.localMonthCost;
            if ( mach.timeTypeUsageList && mach.timeTypeUsageList.length ) {
                mach.timeTypeUsageList.forEach((item,index)=>{
                    let temp = [];
                    if ( index === 0 ){
                        temp = columns.map(i=>{
                            let td = {};
                            td.data = i.merged ? mach[i.dataIndex] : i.dataIndex === 'timeType' ?  timeMaps[item.timeType] : item[i.dataIndex];
                            td.merged = i.merged ;
                            td.rowSpan = mach.timeTypeUsageList.length;
                            return td;
                        });
                    } else {
                        temp = mergeColumns.map(i=>{
                            let td = {};
                            td.data = i.dataIndex === 'timeType' ?  timeMaps[item.timeType] : item[i.dataIndex];
                            td.merged = false ;
                            return td;
                        });
                    }            
                    tableData.push(temp);
                })
            }
        });
    } else {
        // 民用用电计费模式
        tableData = eleCostGroupByMeterVOList.map(mach=>{
            sumMonthCost += mach.localMonthCost;
            return personColumns.map(item=>{
                let obj = {};
                obj['data'] = mach[item.dataIndex];           
                return obj;
            });
        })
    }
    const view2 = { date:[], value:[] }, view3 = { date:[], value:[], value1:[], value2:[], value3:[], value4:[], seriesData:[] };
    if ( pass12MonthData ) {
        Object.keys(pass12MonthData).sort((a,b)=>{
            return new Date(a).getTime() < new Date(b).getTime() ? -1 : 1;
        }).forEach(key=>{
            view2.date.push(key);
            view2.value.push(pass12MonthData[key].cost );
        })
    }
    if ( localMonthDetailData ) {
        Object.keys(localMonthDetailData).sort((a,b)=>{
            let prev = a.split('-')[2];
            let next = b.split('-')[2];
            return prev < next ? -1 : 1;
        }).forEach((key, index)=>{
            let dateStr = key.split('-')[2];
            view3.date.push(dateStr);
            view3.value.push(localMonthDetailData[key].sumUsage);
            view3.value1.push(localMonthDetailData[key]['1']);
            view3.value2.push(localMonthDetailData[key]['2']);
            view3.value3.push(localMonthDetailData[key]['3']);
            view3.value4.push(localMonthDetailData[key]['4']);
        });
        if ( costMode === 'company' && energyInfo.typeCode === 'ele' ) {
            if ( view3.value1.filter(i=>i).length ) {
                view3.seriesData.push({ name:'峰', type:'bar', stack:'energy', data:view3.value1, barWidth:14 });
            }
            if ( view3.value2.filter(i=>i).length ) {
                view3.seriesData.push({ name:'平', type:'bar', stack:'energy', data:view3.value2, barWidth:14 });
            }
            if ( view3.value3.filter(i=>i).length ) {
                view3.seriesData.push({ name:'谷', type:'bar', stack:'energy', data:view3.value3, barWidth:14 });
            }
            if ( view3.value4.filter(i=>i).length ) {
                view3.seriesData.push({ name:'尖', type:'bar', stack:'energy', data:view3.value4, barWidth:14 });
            }
        } else {
            view3.seriesData.push({ name:`用${energyInfo.typeName}量`, type:'bar', data:view3.value, barWidth:14 });
        }
        
    }
    
    const handleTranslateImg = ()=>{
        if ( containerRef.current ){
            toggleLoading(true);
            getBase64(containerRef.current)
            .then(img=>{
                    // [241, 279]
                    var pdf = new jsPDF('p', 'mm', 'a4');
                    let containerWidth = containerRef.current.offsetWidth;
                    let containerHeight = containerRef.current.offsetHeight;
                    // 600 * 800 报告dom原尺寸:1152 1304
                    let pageWidth = pdf.internal.pageSize.getWidth();
                    let pageHeight = pdf.internal.pageSize.getHeight();
                    pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
                    pdf.save( energyInfo.typeName + '费汇总报告.pdf');
                    toggleLoading(false);
                    // var pdf = new jsPDF('p', 'mm', 'a4');
                    // let position = 0;
                    // let index = 0;
                    // let containerWidth = containerRef.current.offsetWidth;
                    // let containerHeight = containerRef.current.offsetHeight;
                    // // 210mm * 297mm 
                    // let pageWidth = pdf.internal.pageSize.getWidth();
                    // let pageHeight = pdf.internal.pageSize.getHeight();
                    // let imgHeight = pageWidth / containerWidth * containerHeight;
                    // if ( imgHeight < pageHeight ) {
                    //     pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
                    // } else {
                    //     let totalHeight = imgHeight;
                    //     while ( totalHeight > 0 ) { 
                    //         pdf.addImage(img, 'JPEG', 0, index * pageHeight, pageWidth, pageHeight);
                    //         pdf.addPage();
                    //         totalHeight -= pageHeight;
                    //         index++;
                    //     }
                    // }
                    // console.log(containerWidth, containerHeight);
                    // console.log('page-size', pageWidth, pageHeight);
                    // pdf.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
                    // pdf.save( energyInfo.typeName + '费汇总报告.pdf');
                    // toggleLoading(false);
            })
        }
    };
   
    return ( 
        <div className={style['container']}>
            {
                loading 
                ?
                <Loading />
                :
                null
            }
        <div ref={containerRef} style={{ width:'1200px', height:'auto', padding:'0.8rem' }}>            
            <div  className={style['title-container']} style={{ 
                textAlign:'center', 
                position:'relative', 
                marginBottom:'1rem', 
                height:'120px', 
                backgroundColor:'rgb(101 202 227)',
                color:'#fff'
            }} 
            >
                    <span style={{ fontSize:'1rem', position:'absolute', top:'0', left:'0', backgroundColor:'#85d1e4', padding:'4px 10px'}}>{ `计量点 : ${currentField.fieldName} - ${currentAttr.title}`}</span>
                    <span style={{ fontSize:'2rem', lineHeight:'120px'}}>{`${ companyName || '' }${dateStr[0]}年${dateStr[1]}月${energyInfo.typeName}成本内部结算单据`}</span>
                   
            </div>
            <div className={style['chart-container']} style={{ marginBottom:'1rem'}}>
                {/* chart1 */}
                <div>
                    <div className={style['head']}>{ `本月应缴${energyInfo.typeName}费用` }</div>
                    <div className={style['chart-item']}>
                        <div style={{ display:'inline-block', width:'50%' }}>
                            <ReactEcharts
                                notMerge={true}
                                style={{ width:'290px', height:'300px' }}
                                option={{
                                    legend:{
                                        top:20,
                                        orient:'horizontal',
                                        data:[energyInfo.typeName]
                                    },
                                    color:colors,
                                    series:{
                                        type:'pie',
                                        radius: ['50%','70%'],
                                        center: ['50%', '50%'],
                                        data:[ { value:localMonthAccountCost, name:energyInfo.typeName }]
                                    }
                                }}
                            />
                        </div>
                        <div style={{ width:'50%', display:'flex', flexDirection:'column' }}>
                            <div className={style['info-item']} >
                                <div>{ energyInfo.typeName + '费成本' }</div>
                                <div className={style['num']}>{ localMonthAccountCost + '元' }</div>
                            </div>
                            <div className={style['info-item']} >                         
                                <div>
                                    <div>
                                        <span style={{ width:'40%'}}>同比:</span>
                                        <span style={{ marginLeft:'10px', fontSize:'20px', color: localMonthBaseCostYoy <=0 ? '#6fcc17' : 'red' }}>{ localMonthBaseCostYoy <= 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }{ localMonthBaseCostYoy + '%' } </span>
                                    </div>
                                    <div>
                                        <span style={{ width:'40%'}}>环比:</span>
                                        <span style={{ marginLeft:'10px', fontSize:'20px', color: localMonthBaseCostChain <=0 ? '#6fcc17' : 'red' }}>{ localMonthBaseCostChain <= 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }{ localMonthBaseCostChain + '%' } </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* chart2 */}
                <div>
                    <div className={style['head']}>{ '过去12个月' + energyInfo.typeName + '成本变化趋势'}</div>
                    <div className={style['chart-item']}>
                        <ReactEcharts                       
                            notMerge={true}
                            style={{ height:'300px', width:'580px' }}
                            option={{
                                legend:{
                                    top:20,
                                    orient:'horizontal',
                                    data: [energyInfo.typeName]
                                },
                                grid:{
                                    top:60,
                                    left:20,
                                    right:20,
                                    bottom:20,
                                    containLabel:true
                                },
                                label:{
                                    position:'inside',
                                },
                                tooltip:{ trigger:'axis' },
                                xAxis:{
                                    type:'category',
                                    data:view2.date,
                                    axisTick:{ show:false }
                                },
                                color:colors,
                                yAxis:{ type:'value', name:'(元)', axisTick:{ show:false } },
                                series:[
                                    { name:energyInfo.typeName, type:'bar', data:view2.value, barWidth:16 }
                                ]
                            }}
                        />
                    </div>       
                </div>
            </div>
            {/* chart3 */}
            <div className={style['chart-container']} style={{ marginBottom:'1rem' }}>
                <div>
                    <div className={style['head']}>{ '本月用' + energyInfo.typeName + '量变化趋势图' }</div>
                    <div style={{backgroundColor:'#f7f7f7' }}>
                        <ReactEcharts                       
                            notMerge={true}
                            style={{ height:'360px', width:'1178px' }}
                            option={{
                                legend:{
                                    top:20,
                                    show: costMode === 'company' ? true : false,
                                    orient:'horizontal',
                                    data: costMode === 'company' ? view3.seriesData.map(i=>i.name) : []
                                },
                                tooltip:{ trigger:'axis' },
                                label:{ position:'inside' },
                                grid:{
                                    top:60,
                                    left:20,
                                    right:40,
                                    bottom:20,
                                    containLabel:true
                                },
                                color:colors,
                                xAxis:{
                                    name:'日',
                                    type:'category',
                                    axisTick:{ show:false },
                                    data:view3.date
                                },
                                yAxis:{ type:'value', name:'(kwh)', axisTick:{ show:false }},
                                series:view3.seriesData
                            }}
                        />
                    </div>
                </div>               
            </div>
            <table style={{ width:'100%', marginBottom:'1rem', tableLayout:'fixed' }}>
                <thead style={{ backgroundColor:'#f7f7f7' }}>
                    <tr>
                    {
                        finalColumns.map((column,i)=>(
                            <th style={{ 
                                border:'1px solid rgb(212, 212, 212)', 
                                padding:'4px 0'
                            }} key={i}>{column.title}</th>
                        ))
                    }
                    </tr>
                </thead>
                <tbody>
                    {
                        tableData.map((mach,i)=>{
                            return (
                                <tr key={i}>
                                    {
                                        mach.map((item,j)=>{
                                            return (
                                                <td key={`${i}-${j}`} title={item.data} style={{ 
                                                    border:'1px solid rgb(232, 232, 232)', 
                                                    padding:'4px 10px',
                                                    whiteSpace:'nowrap', 
                                                    overflow:'hidden',  
                                                    textOverflow:'ellipsis'
                                                }} rowSpan={ item.merged && item.rowSpan ? item.rowSpan : null }>{ item.data || 0 }</td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                            
                        })
                    }
                </tbody>
            </table>
            <table style={{ width:'100%', marginBottom:'1rem' }}>
                <thead style={{ backgroundColor:'#f7f7f7' }}>
                    <tr>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{ '总账户计量' + energyInfo.typeName + '费(元)' }</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{ `${energyInfo.typeName}表计量汇总(${energyInfo.unit})` }</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{ '总' + energyInfo.typeName + '费占比' }</th>
                        { energyInfo.typeCode === 'ele' ? <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>基本电费分摊(元)</th> : null }
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{ '本月' + energyInfo.typeName + '费汇总(元)' }</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ localMonthAccountCost || 0 }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ localMonthSumUsage || 0 }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ costPercentage + '%' } </td>
                        { energyInfo.typeCode === 'ele' ? <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ baseCostApportionment || 0 }</td> : null }
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ energyInfo.typeCode === 'ele' ? sumMonthCost + baseCostApportionment : sumMonthCost  }</td>
                    </tr>
                </tbody>
            </table>
            <div className={style['bottom-container']}>
                <div>制表:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
                <div>复核:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
                <div>接收:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
            </div>
        </div>
        <div style={{ position:'fixed', right:'4rem', bottom:'2rem' }}>
            <div style={{ marginBottom:'0.5rem' }}><Button type="primary" onClick={()=>{
                if ( loading ) {
                    message.info('正在下载,请稍后...');
                } else {
                    handleTranslateImg();
                }
            }} shape='circle' icon={<DownloadOutlined />} /></div>
            <div><Button onClick={()=>onCancel()} shape='circle' icon={<CloseOutlined />} /></div>
        </div>  
        </div>
    );
}

export default PreviewReport;
