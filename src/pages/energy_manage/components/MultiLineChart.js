import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import { globalColors } from '@/utils/colors';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

function MultiLineChart({ data, selectedKeys, timeType, theme }){
    const [chartType, setChartType] = useState('line');
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    let dateArr = [];
    Object.keys(data).sort((a,b)=>{
        if ( timeType === '3' ) {
            let prev = a.split(':')[0];
            let next = b.split(':')[0];
            return +prev < +next ? -1 : 1;
        } else {
            return new Date(a).getTime() < new Date(b).getTime() ? -1 : 1;
        }
    }).forEach((key,index)=>{
        dateArr.push(key);
        if ( index === 0 ) {
            selectedKeys.forEach(attr=>{
                seriesData.push({
                    type:chartType,
                    name:attr.attrName,
                    symbol:'none',
                    areaStyle:{
                        opacity:0.1
                    },
                    data:[ data[key][attr.attrName] || null ]
                })
            })
        } else {
            seriesData.forEach(i=>{
                i.data.push(data[key][i.name] || null );
            })
        }
    })
    // if ( chartType === 'line') {
    //     seriesData = attr.map(item=>{
    //         let obj ={};
    //         obj.type = 'line';
    //         obj.name = item.attr_name;
    //         obj.data = item.cost;
    //         obj.symbol = 'none';
    //         obj.areaStyle = {
    //             opacity:0.1
    //         };
    //         legendData.push(item.attr_name);
    //         return obj;
    //     })
    // } else if ( chartType === 'bar') {
    //     seriesData = attr.map(item=>{
    //         let obj ={};
    //         obj.type = 'bar';
    //         obj.name = item.attr_name;
    //         obj.data = item.cost;
    //         legendData.push(item.attr_name);
    //         return obj;
    //     })
    // } else if ( chartType === 'pie') {
    //     seriesData.push({
    //         type:'pie',
    //         radius:'70%',
    //         label:{
    //             show:true,
    //             position:'inner',
    //             fontSize:16,
    //             formatter:(params)=>{
    //                 if ( params.data.value === 0 ){
    //                     return '';
    //                 } else {
    //                     return `${params.data.name}\n${params.data.value.toFixed(2)}`;
    //                 }              
    //             }
    //         },
    //         labelLine:{ show:false },
    //         data:attr.map(item=>{
    //             return {
    //                 name:item.attr_name,
    //                 value: item.cost.reduce((sum,cur)=>sum+=Number(cur), 0)
    //             }
    //         })
    //     });
    //     legendData = attr.map(i=>i.attr_name);
    // }
   
    return (
        <div style={{ height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value={chartType} onChange={e=>{
                let value = e.target.value;
                let fileTitle = '成本透视';
                if ( value === 'line' || value === 'bar' ) {
                    setChartType(value);
                    return;
                }
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:'#fff' })
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
                    var aoa = [], thead = ['属性','单位'];          
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
                    return ;
                    } else {
                        message.info('数据源为空');
                    }                  
                }
            }}>
                <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={{
                    color:globalColors,
                    legend:{ 
                        type:'scroll', 
                        data:seriesData.map(i=>i.name), 
                        top:20,
                        left:'center',
                        right:20,
                        textStyle:{ color:textColor }
                    },
                    tooltip:{
                        show:true,
                        trigger:'axis'
                    },                   
                    grid: {
                        left:20,
                        right:40,
                        top:90,
                        bottom:30,
                        containLabel:true
                    },                 
                    xAxis: {
                        show: true,
                        type:'category',
                        data:dateArr,
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                let dateStr = value.split(' ');
                                if ( dateStr && dateStr.length > 1){
                                    return dateStr[1];
                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        name:'(元)',
                        nameTextStyle:{ color:textColor },
                        axisTick:{
                            show:false
                        },
                        axisLabel:{ color:textColor },
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLine:{
                            show:false
                        }
                    },
                    series:seriesData
                }}
            /> 
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MultiLineChart, areEqual)