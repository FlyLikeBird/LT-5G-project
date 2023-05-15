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
import { globalColors } from '@/utils/colors';

function EnergyBarChart({ data, energyInfo, currentDate, fieldAttrs, showType, chartLoading, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let { key, dateDataInfo } = data;
    let dateStr = currentDate.format('YYYY-MM-DD').split('-');
    const echartsRef = useRef();
    let title =  `${ key === 'year' ? dateStr[0] + '年' : key==='month' ? dateStr[1] + '月' : dateStr[2] + '日'}${ showType ? showType === 'cost' ? '成本':'能耗' : '产效' }` ;
    const [chartType, toggleChartType] = useState('bar');
    let seriesData = [], dateArr = [];
    if ( dateDataInfo ) {
        Object.keys(dateDataInfo).sort((a,b)=>{
            if ( key === 'year') {
                let prev = a.split('-')[1];
                let next = b.split('-')[1];
                return prev < next ? -1 : 1;
            } else if ( key === 'month') {
                let prev = a.split('-')[2];
                let next = b.split('-')[2];
                return prev < next ? -1 : 1;
            } else {
                let prev = a.split(':')[0];
                let next = b.split(':')[0];
                return prev < next ? -1 : 1;
            }
        }).forEach((key, index)=>{
            dateArr.push(key);
            if ( index === 0 ) {
                fieldAttrs.forEach(attrName=>{
                    let obj = dateDataInfo[key][attrName]
                    seriesData.push({
                        type:chartType,
                        name:attrName,
                        symbol:'none',
                        stack:'cost',
                        barWidth:10,
                        data:[ obj ? showType === 'cost' ? obj.cost : obj.sumUsage : null ]
                    })
                })
            } else {
                seriesData.forEach(i=>{
                    let obj = dateDataInfo[key][i.name];
                    i.data.push( obj ? showType === 'cost' ? obj.cost : obj.sumUsage : null );
                })
            }
        })
    }
    return (  
            <div className={style['card-container']}>
                {
                    chartLoading
                    ?
                    <Loading />
                    :
                    null
                }
                <div className={style['card-title']}>
                    <div>{ title }</div>             
                    <div className={style['float-button-group']} style={{ top:'2px' }}>
                        <Radio.Group size='small' style={{ marginRight:'20px' }} className={style['custom-radio']} value={chartType} onChange={e=>{
                            toggleChartType(e.target.value);
                        }}>
                            <Radio.Button key='bar' value="bar"><BarChartOutlined /></Radio.Button>
                            <Radio.Button key='line' value="line"><LineChartOutlined /></Radio.Button>
                        </Radio.Group>
                        <Radio.Group size='small' className={style['custom-radio']} value='data' onChange={e=>{
                            let value = e.target.value;
                            let fileTitle = '能源成本-成本趋势';
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
                                    var aoa = [], thead = ['属性','单位' ];                                      
                                    dateArr.forEach(i=>{
                                        thead.push(i);
                                    });
                                    aoa.push(thead);
                                    seriesData.forEach(i=>{
                                        let temp = [];
                                        temp.push(i.name);
                                        temp.push(`${ showType ? showType === 'cost' ? '元' : energyInfo.unit : '元/万元产值' }`);
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
                </div>
                <div className={style['card-content']} style={{ padding:'0' }}>                  
                    <ReactEcharts
                        ref={echartsRef}
                        notMerge={true}
                        style={{ width:'100%', height:'100%' }}
                        option={{
                            tooltip:{
                                trigger:'axis'
                            },
                            color:globalColors,
                            legend: {
                                type:'scroll',
                                orient:'horizontal',
                                data:seriesData.map(i=>i.name),
                                left: 20,
                                top: 10,
                                right:20,
                                itemWidth: 10,
                                itemHeight: 10,
                                pageTextStyle:{ color:textColor },
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
                                name: key === 'year' ? '月' : key === 'month' ? '日' : key === 'day' ? '时' : '',
                                nameTextStyle:{ color:textColor },
                                axisTick:{ show:false },
                                axisLabel:{ 
                                    color:textColor, 
                                    formatter:value=>{
                                        let dateStr = value.split('-');
                                        return key === 'year' ? dateStr[1] : key === 'month' ? dateStr[2] : value;
                                    }
                                }
                            },
                            yAxis:{
                                show:true,
                                name:showType === 'cost' ? '元' : energyInfo.unit,
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
            </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType || prevProps.chartLoading !== nextProps.chartLoading || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(EnergyBarChart, areEqual);
