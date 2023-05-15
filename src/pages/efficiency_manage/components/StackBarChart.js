import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, DatePicker, Popover, Skeleton, Spin, message } from 'antd';
import { BarsOutlined, LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import Loading from '@/pages/components/Loading';
import { downloadExcel } from '@/utils/array';
import XLSX from 'xlsx';
import style from '@/pages/IndexPage.css';

function StackBarChart({ data, allFields, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    // console.log(data);
    let seriesData = [], dateArr = [];
    if ( data.length ) {
        Object.keys(data[0]).sort((a,b)=>{
            let prev = a.split('-')[1];
            let next = b.split('-')[1];
            return prev < next ? -1 : 1;
        }).forEach(key=>{
            dateArr.push(key);
        })
        data.forEach((item, index)=>{
            let valueData = [];
            dateArr.forEach(date=>{
                valueData.push(item[date] ? item[date].cost : 0);
            });
            seriesData.push({
                type:'bar',
                stack:'cost',
                name:allFields[index].typeName + '费',
                barWidth:14,
                data:valueData
            })
        })
    }
    
    return (  
                <div style={{ height:'100%' }}>   
                    <div className={style['float-button-group']} style={{ top:'6px' }}>
                        
                        <Radio.Group size='small' className={style['custom-radio']} value='data' onChange={e=>{
                            let value = e.target.value;
                            let fileTitle = '能源效率-成本趋势';
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
                                if ( seriesData.length ) {
                                    var aoa = [], thead = ['对比项','单位' ];                                      
                                    dateArr.forEach(i=>{
                                        thead.push(i);
                                    });
                                    aoa.push(thead);
                                    seriesData.forEach(i=>{
                                        let temp = [];
                                        temp.push(i.name);
                                        temp.push('元');
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
                            color:['#65cae3', '#198efb', '#57e29f', '#f1ac5b'],
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
                                name:'月',
                                nameTextStyle:{ color:textColor },
                                axisTick:{ show:false },
                                axisLabel:{ 
                                    color:textColor
                                }
                            },
                            yAxis:{
                                show:true,
                                name:'(元)',
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

export default  React.memo(StackBarChart);
