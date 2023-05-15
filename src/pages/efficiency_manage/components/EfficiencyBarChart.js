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

let fillTypes = {
    2:{ text:'万元产值比', unit:'元/万元' },
    5:{ text:'产量能效', unit:'台'},
    1:{ text:'人当能效', unit:'人'},
    4:{ text:'面积能效', unit:'㎡'}
};
function EfficiencyBarChart({ data, typeId, timeType, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    let seriesData = [], dateArr = [], valueData = [];
    if ( Object.keys(data).length ) {
        Object.keys(data).sort((a,b)=>{
            if ( timeType === '1' ) {
                let prev = a.split('-')[1];
                let next = b.split('-')[1];
                return prev < next ? -1 : 1;
            } else if ( timeType === '2' ) {
                let prev = a.split('-')[2];
                let next = b.split('-')[2];
                return prev < next ? -1 : 1;
            } else if ( timeType === '3') {
                let prev = a.split(':')[1];
                let next = b.split(':')[1];
                return prev < next ? -1 : 1;
            }
        }).forEach((key, index)=>{
            dateArr.push(key);
            let obj = data[key] || {};
            valueData.push(obj.fillTypeValue || 0);
        })
    }
    seriesData.push({
        type:'bar',
        barWidth:14,
        name:fillTypes[typeId].text,
        itemStyle:{ color:'#1890ff' },
        data:valueData
    });
    
    return (  
                <div style={{ height:'100%' }}>   
                    {/* <div className={style['float-button-group']} style={{ top:'2px' }}>
                        
                        <Radio.Group size='small' className={style['custom-button']} value='data' onChange={e=>{
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
                    </div>             */}
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
                                name: timeType === '1' ? '月' : timeType === '2' ? '日' : '时',
                                nameTextStyle:{ color:textColor },
                                axisTick:{ show:false },
                                axisLabel:{ 
                                    color:textColor, 
                                    
                                }
                            },
                            yAxis:{
                                show:true,
                                name: typeId === 2 ? fillTypes[typeId].unit :  `(元/${fillTypes[typeId].unit})`,
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

export default  React.memo(EfficiencyBarChart, areEqual);
