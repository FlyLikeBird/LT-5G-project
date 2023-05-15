import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
const alarmMaps = {
    '1':'电气安全',
    '2':'指标越限',
    '3':'通讯异常'
}

function AlarmSumBarChart({ data, warningColors, onDispatch, theme, forReport }) {
    const echartsRef = useRef();
    const textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const [timeType, setTimeType] = useState(2);
    let seriesData = [], dateArr = [], eleArr = [], limitArr = [], linkArr = [];
    
    if ( data && Object.keys(data).length ) {
        Object.keys(data).forEach(time=>{
            dateArr.push(time);
            eleArr.push(data[time]['1']);
            limitArr.push(data[time]['2']);
            linkArr.push(data[time]['3']);
        })  
    }
    seriesData.push({
        type:'bar',
        name:'电气安全',
        stack:'警报类型',
        data:eleArr,
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['ele']
        }
    });
    seriesData.push({
        type:'bar',
        name:'指标越限',
        stack:'警报类型',
        data:limitArr,
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['limit']
        }
    });
    seriesData.push({
        type:'bar',
        name:'通讯异常',
        stack:'警报类型',
        data:linkArr,
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['link']
        }
    });
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            {
                forReport 
                ?
                null
                :
                <Radio.Group style={{ right:'unset', left:'6px' }} className={style['float-button-group'] + ' ' + style['custom-radio']} value={timeType} onChange={(e)=>{
                    setTimeType(e.target.value);
                    onDispatch({ type:'alarm/fetchAlarmIndex', payload:{ timeType:e.target.value }});
                }}>
                    <Radio.Button key='month' value={1}>12M</Radio.Button>
                    <Radio.Button key='day' value={2}>30D</Radio.Button>
                </Radio.Group>
            }
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '能源安全报警次数监控';
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
                        if ( eleArr.length ) {
                            var aoa = [], thead = ['告警分类'];
                            dateArr.forEach(i=>{
                                thead.push(i);
                            });
                            aoa.push(thead);
                            seriesData.forEach(i=>{
                                let temp = [];
                                temp.push(i.name);
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
            }
            
            
            
            
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'能源安全报警次数监控',
                        left:'center',
                        top:6,
                        textStyle:{ color:textColor, fontSize:16 }
                    },
                    grid:{
                        top:70,
                        bottom:20,
                        left:40,
                        right:40,
                        containLabel:true
                    },    
                    legend: {
                        left:'center',
                        top:30,
                        textStyle:{ color:textColor },
                        data:seriesData.map(i=>i.name)
                    },
                    xAxis: {
                        show: true,
                        name: timeType === 2 ? '日' : '月',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{ 
                            color:textColor, 
                            formatter:value=>{
                                let dateArr = value.split('-');
                                return timeType === 2 ? dateArr[2] : value;
                            }
                        },
                        axisTick:{ show:false },
                        type:'category',
                        data:dateArr,
                    },
                    yAxis:{
                        show:true,
                        name:'(次)',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{ color:textColor },
                        axisTick:{ show:false },
                        type:'value',
                        minInterval:1,
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }
                    },
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

export default  React.memo(AlarmSumBarChart, areEqual);
