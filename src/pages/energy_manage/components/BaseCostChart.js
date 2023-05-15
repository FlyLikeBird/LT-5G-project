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

function BaseCostChart({ data, theme, currentAttr }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    const [type, setType] = useState('bar');
    if ( data && data.length ) {
        seriesData.push({
            type: type === 'bar' ? 'bar' : 'line',
            name:'容量电费',
            smooth:true,
            symbol:'none',
            areaStyle:{ opacity:0.3 },
            data:data.map(i=>data[0].kvaAmount),
            barMaxWidth:14,
            itemStyle:{
                color:'#4391ff'
            }
        });
        seriesData.push({
            type: type === 'bar' ? 'bar' : 'line',
            name:'需量电费',
            smooth:true,
            symbol:'none',
            data:data.map(i=>i.demandAmount),
            areaStyle:{ opacity:0.3 },
            barMaxWidth:14,
            itemStyle:{
                color:'#28c993'
            }
        });
    }
   
    
    return (  
        <div style={{ width:'100%', height:'100%', position:'relative' }}>
            <div className={style['float-button-group']} >
                <Radio.Group size='small' className={style['custom-radio']} value={type} onChange={e=>setType(e.target.value)}>
                    <Radio.Button key='line' value='line'><AreaChartOutlined /></Radio.Button>
                    <Radio.Button key='bar' value='bar'><BarChartOutlined /></Radio.Button>
                </Radio.Group>
               
                    <Radio.Group size='small' className={style['custom-radio']} style={{ marginLeft:'20px' }} value={type} onChange={e=>{
                        let value = e.target.value;
                        let fileTitle = '基本电费';
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
                            if ( data.length ) {
                                var aoa = [], thead = ['对比项','单位', '属性'];
                                let dateArr = data.map(i=>i.date);
                                dateArr.forEach(i=>thead.push(i));
                                aoa.push(thead);
                                seriesData.forEach(i=>{
                                    let temp = [];
                                    temp.push(i.name);
                                    temp.push('元');
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
                
            </div>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{  
                    tooltip:{
                        trigger:'axis'
                    },   
                    legend: {
                        data:['容量电费','需量电费'],
                        top:6,
                        textStyle:{ color:textColor }
                    },
                    grid:{
                        left:20,
                        right:40,
                        top:60,
                        bottom:20,
                        containLabel:true
                    },
                    xAxis: {
                        show:true,
                        name:'月',
                        nameTextStyle:{ color:textColor },
                        type:'category',
                        data:data.map(i=>i.date),
                        axisTick: { show:false },
                        axisLabel:{
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
                        name:'(元)',
                        nameTextStyle:{ color:textColor },
                        splitLine:{ 
                            show:true,
                            lineStyle:{
                                color:'#e0e0e0'
                            }
                        },
                        axisLine:{ show:false },
                        axisTick:{ show:false },
                        axisLabel:{
                            color:textColor
                        },
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }
                    },
                    series:seriesData,
                    
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

export default  React.memo(BaseCostChart, areEqual);
