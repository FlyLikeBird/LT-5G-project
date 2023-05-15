import React, { useState, useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
const timeInfo = {
    '1':'峰时段',
    '2':'平时段',
    '3':'谷时段',
    '4':'尖时段'
};
function MeasureBarChart({ data, currentAttr, timeType, theme }) { 
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const [showType, toggleShowType] = useState('cost');
    const seriesData = [];
    let title = showType === 'cost' ? '电费' : '电量';
    let tipArr = [], topArr = [], middleArr = [], bottomArr = [];
    data.forEach((item, index)=>{        
        if ( item.timeTypeDataOfTimeVOList && item.timeTypeDataOfTimeVOList.length ) {
            item.timeTypeDataOfTimeVOList.forEach(sub=>{
                if ( sub.timeType === 1 ) {
                    topArr.push( showType === 'cost' ? sub.cost : sub.electricitySum );
                } else if ( sub.timeType === 2 ) {
                    middleArr.push( showType === 'cost' ? sub.cost : sub.electricitySum );
                } else if ( sub.timeType === 3 ) {
                    bottomArr.push( showType === 'cost' ? sub.cost : sub.electricitySum );
                } else {
                    tipArr.push( showType === 'cost' ? sub.cost : sub.electricitySum );
                }
            })
        } else {
            tipArr.push(null);
            topArr.push(null);
            middleArr.push(null);
            bottomArr.push(null);
        }
    });
  
    if ( tipArr.filter(i=>i).length ) {
        seriesData.push({
            type:'bar',
            name:`尖时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#fd6e4c'
            },
            barMaxWidth:14,
            data:tipArr
        });
    }
    if ( topArr.filter(i=>i).length ){
        seriesData.push({
            type:'bar',
            name:`峰时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#2ccb96',
            },
            barMaxWidth:14,
            data:topArr
        });
    }
    if ( middleArr.filter(i=>i).length ){
        seriesData.push({
            type:'bar',
            name:`平时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#4391ff'
            },
            barMaxWidth:14,
            data:middleArr
        });
    }
    if ( bottomArr.filter(i=>i).length ){
        seriesData.push({
            type:'bar',
            name:`谷时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#f7ae1c'
            },
            barMaxWidth:14,
            data:bottomArr
        });
    }
    return (   
        <div style={{ position:'relative', height:'100%' }}>
            <div className={style['float-button-group']}>
            <Radio.Group size='small' className={style['custom-radio']} value={showType} onChange={e=>toggleShowType(e.target.value)}>
                <Radio.Button key='energy' value='energy'>电量</Radio.Button>
                <Radio.Button key='cost' value='cost'>电费</Radio.Button>
            </Radio.Group>
             
                <Radio.Group size='small' className={style['custom-radio']} style={{ marginLeft:'20px' }} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `电度电费-${title}`;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
                        .then(canvas=>{
                            let MIME_TYPE = "image/png";
                            let url = canvas.toDataURL(MIME_TYPE);
                            let linkBtn = document.createElement('a');
                            linkBtn.download = fileTitle ;          
                            linkBtn.href = url;
                            let event;
                            if( window.MouseEvent) {
                                event = new MouseEvent('click');
                            } else {
                                event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            }
                            linkBtn.dispatchEvent(event);
                        })
                        return ;
                    }
                    if ( value === 'excel' ) {
                        var aoa = [], thead = ['时段','单位','属性'];
                        if ( seriesData.length ) {
                            let dateArr = data.map(i=>i.dateTime);
                            dateArr.forEach(i=>thead.push(i));
                            aoa.push(thead);
                            seriesData.forEach(item=>{
                                let temp = [];
                                temp.push(item.name);
                                temp.push( showType === 'cost' ? '元' : 'kwh');
                                temp.push(currentAttr.title);
                                temp.push(...item.data);
                                aoa.push(temp);
                            })
                        } else {
                            message.info('数据源为空');
                        }
                    
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                        return ;
                    }
                }}>
                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group> 
            
            </div>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: {
                        trigger: 'axis',
                    },
                    legend: {
                        left:'center',
                        top:10,
                        data:seriesData.map(i=>i.name),
                        textStyle:{ color:textColor }
                    }, 
                    grid:{
                        left:20,
                        right:40,
                        bottom:40,
                        containLabel:true
                    },
                    xAxis: {
                        show:true,
                        name: timeType === '2' ? '日' : '月',
                        nameTextStyle:{
                            color:textColor
                        },
                        type:'category',
                        data:data.map(i=>i.dateTime),
                        axisTick: { show:false },
                        axisLabel:{
                            show:true,
                            color:textColor
                        },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        nameTextStyle:{
                            color:textColor
                        },
                        name: showType === 'cost' ? '(元)' : '(kwh)',
                        splitLine:{ 
                            show:true,
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLabel:{ color:textColor },
                        axisLine:{ show:false },
                        axisTick:{ show:false }
                    },
                    series:seriesData                
                }}
            />  
        </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MeasureBarChart, areEqual);
