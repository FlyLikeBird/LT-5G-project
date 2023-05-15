import React, { useState, useRef } from 'react';
import { Radio, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

function AttrRankChart({ data, warningColors, theme, forTrend, forReport }) {
    let seriesData = [];
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const eleArr = [], limitArr = [], linkArr = [];
    data = data.sort((a,b)=>{
        return a.attrCount < b.attrCount ? 1 : -1;
    });
    if ( data && data.length ) {
        data.forEach(item=>{
            eleArr.push(item.attrTypes['电气安全']);
            limitArr.push(item.attrTypes['指标越限']);
            linkArr.push(item.attrTypes['通讯采集']);
        });
    } 
    seriesData.push({
        type:'bar',
        name:'电气安全',
        stack:'alarm',
        barMaxWidth:10,
        barGap:0,
        itemStyle:{
            color:warningColors['ele']
        },
        data:eleArr
    });
    seriesData.push({
        type:'bar',
        name:'指标越限',
        stack:'alarm',
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['limit']
        },
        data:limitArr
    });
    seriesData.push({
        type:'bar',
        name:'通讯异常',
        stack:'alarm',
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['link']
        },
        data:linkArr
    });
    
    return (   
        <div style={{ height:'100%'}}>   
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '告警责任分解';
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
                            var aoa = [], thead = ['属性','电气告警数', '越限告警数', '通讯告警数'];
                            aoa.push(thead);
                            data.forEach((item,index)=>{
                                let temp = [];
                                temp.push(item.attrName);
                                temp.push(eleArr[index]);
                                temp.push(limitArr[index]);
                                temp.push(linkArr[index]);
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
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text: forTrend ? '' : '告警责任分解',
                        left:'center',
                        top:6,
                        textStyle:{
                            color:textColor,
                            fontSize:14
                        }
                    }, 
                    legend: {
                        left:'center',
                        top:36,
                        data:seriesData.map(i=>i.name),
                        textStyle:{
                            color:textColor
                        }
                    },
                    dataZoom:[
                        {
                            show:true,
                            yAxisIndex:0,
                            startValue:0,
                            endValue:10
                        }
                    ],
                    grid:{
                        top:60,
                        left:10,
                        right:40,
                        bottom:20,
                        containLabel:true
                    },
                    yAxis: {
                        show: true,
                        type:'category',
                        data:data.map(i=>i.attrName),
                        axisTick:{ show:false },
                        inverse:true,
                        interval:0,
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                return value.length >= 13 ? value.substring(0, 10) + '...' : value;
                            }
                        }
                    },
                    xAxis:{
                        show:true,
                        name:'(次)',
                        type:'value',
                        position:'top',
                        minInterval:1,
                        axisTick:{ show:false },
                        splitLine:{ show:false },
                        axisLabel:{
                            color:textColor
                        },
                        nameTextStyle:{
                            color:textColor,
                            verticalAlign:'bottom'
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

export default React.memo(AttrRankChart, areEqual);
