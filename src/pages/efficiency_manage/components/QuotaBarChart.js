import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, DatePicker, Popover, Skeleton, Spin, message } from 'antd';
import { BarsOutlined, LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import XLSX from 'xlsx';
import style from '@/pages/IndexPage.css';

function QuotaBarChart({ data, energyInfo, timeType, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    let seriesData = [], dateArr = [], valueData = [], quotaData = [];
    if ( Object.keys(data).length ) {
        Object.keys(data).sort((a,b)=>{
            if ( timeType === 2 ) {
                let prev = a.split('-')[1];
                let next = b.split('-')[1];
                return prev < next ? -1 : 1;
            } else if ( timeType === 1 ) {
                let prev = a.split('-')[2];
                let next = b.split('-')[2];
                return prev < next ? -1 : 1;
            } 
        }).forEach((key, index)=>{
            dateArr.push(key);
            let obj = data[key] || {};
            valueData.push(obj.sumUsage || 0);
            quotaData.push(obj.quotaValue || 0);
        })
    }
    seriesData.push({
        type:'bar',
        barWidth:14,
        name:'实际能耗',
        itemStyle:{ color:'#1890ff' },
        data:valueData.map((item,index)=>{
            if ( quotaData[index] && item >= quotaData[index] ) {
                return { value:item, itemStyle:{ color:'#e83320' }};
            } else {
                return { value:item, itemStyle:{ color:'#1890ff'}}
            }
        })
    });
    seriesData.push({
        type:'line',
        name:'定额值',
        step:'middle',
        data:quotaData,
        itemStyle:{
            color:'#e83320'
        },
        markPoint:{
            symbol:'rect',
            symbolSize:[60,20],
            data:[ { value:'定额值', xAxis:dateArr.length-1, yAxis:quotaData[dateArr.length-1]} ],
        }
    });
    // console.log(data);
    // console.log(seriesData);
    return (  
                <div style={{ height:'100%' }}>   
                    <div className={style['float-button-group']} style={{ top:'8px' }}>                     
                        <Radio.Group size='small' className={style['custom-radio']} value='data' onChange={e=>{
                            let value = e.target.value;
                            let fileTitle = '能源效率-能耗定额';
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
                                if ( valueData.length ) {
                                    var aoa = [], thead = ['对比项','能源类型','单位' ];                                      
                                    dateArr.forEach(i=>{
                                        thead.push(i);
                                    });
                                    aoa.push(thead);
                                    seriesData.forEach(i=>{
                                        let temp = [];
                                        temp.push(i.name);
                                        temp.push(energyInfo.typeName);
                                        temp.push(energyInfo.unit);
                                        temp.push(...i.data);
                                        aoa.push(temp);
                                    });
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                } else {
                                    message.info('数据源为空');
                                }                 
                            }
                        }}>
                            <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                            <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
                        </Radio.Group>
                    </div>            
                    <ReactEcharts
                        ref={echartsRef}
                        notMerge={true}
                        style={{ width:'100%', height:'100%' }}
                        option={{
                            tooltip:{
                                trigger:'axis'
                            },
                            legend: {                  
                                data:seriesData.map(i=>i.name),
                                left:'center',
                                top: 10,
                                itemWidth: 10,
                                itemHeight: 10,
                                textStyle:{
                                    color:textColor,
                                    fontSize:12
                                }
                            },
                            grid:{
                                top:60,
                                left:20,
                                right:40,
                                bottom:20,
                                containLabel:true
                            },
                            xAxis: {
                                show:true,
                                type:'category',
                                data:dateArr,
                                name: timeType === 2 ? '月' : '日',
                                nameTextStyle:{ color:textColor },
                                axisTick:{ show:false },
                                axisLabel:{ 
                                    color:textColor, 
                                    formatter:value=>{
                                        let dateStr = value.split('-');
                                        return timeType === 2 ? dateStr[1] : timeType === 1 ? dateStr[2] : value;
                                    }
                                }
                            },
                            yAxis:{
                                show:true,
                                name:energyInfo.unit,
                                nameGap:10,
                                type:'value',
                                axisLine:{
                                    show:false
                                },
                                axisTick:{
                                    show:false
                                },
                                splitLine:{
                                    lineStyle:{
                                        color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                    }
                                },
                                axisLabel:{ color:textColor },
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

export default  React.memo(QuotaBarChart, areEqual);
