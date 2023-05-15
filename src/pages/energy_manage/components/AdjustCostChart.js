import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { AreaChartOutlined, LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

function AdjustCostChart({ data, factor, currentAttr, theme }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    let adjustCost = [], factorList = [];
    data.forEach(item=>{
        adjustCost.push(item.adjustCost);
        factorList.push(factor);
    })
    seriesData.push({
        type:'bar',
        name:'无功罚款',
        barWidth:14,
        data:adjustCost,
        itemStyle:{
            color:'#4391ff'
        },
        yAxisIndex:1,
    });
    seriesData.push({
        type:'line',
        name:'功率因素',
        symbol:'none',
        data:factorList,
        itemStyle:{
            color:'#28c993'
        },
    });
    
    return (    
        <div style={{ height:'100%'}}>
           
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '力调电费';
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff'})
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
                        if ( data.length ){
                            var aoa = [], thead = ['对比项','单位','属性'];
                            let dateArr = data.map(i=>i.date);
                            dateArr.forEach(i=>thead.push(i));
                            aoa.push(thead);
                            seriesData.forEach(i=>{
                                let temp = [];
                                temp.push(i.name);
                                temp.push( i.name === '功率因素' ? 'cosΦ' : '元');
                                temp.push(currentAttr.title);
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
                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{  
                    tooltip:{
                        trigger:'axis'
                    },   
                    legend: {
                        data:['无功罚款','功率因素'],
                        top:10,
                        textStyle:{
                            color:textColor
                        }
                    },
                    grid:{
                        left:20,
                        right:40,
                        top:70,
                        bottom:40,
                        containLabel:true
                    },
                    xAxis:{
                        type:'category',
                        data:data.map(i=>i.date),
                        axisTick:{ show:false },
                        axisLabel:{ color:textColor },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }
                    },
                    yAxis:[
                        {
                            show:true,
                            type:'value',
                            name:'功率因素',
                            nameTextStyle:{ color:textColor },
                            splitLine:{ 
                                show:false
                            },
                            position:'right',
                            axisLine:{ show:false },
                            axisTick:{ show:false },
                            axisLabel:{ color:textColor }
                        },
                        {
                            show:true,
                            type:'value',
                            name:'无功罚款',
                            nameTextStyle:{ color:textColor },
                            splitLine:{ 
                                show:true,
                                lineStyle:{
                                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                }
                            },
                            axisLine:{ show:false },
                            axisTick:{ show:false },
                            axisLabel:{ color:textColor }
                        },
                    ],
                    series:seriesData
                }}
            /> 
        </div>  
        
       
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(AdjustCostChart, areEqual);
