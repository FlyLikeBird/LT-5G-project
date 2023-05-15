import React, { useRef, useEffect, useMemo } from 'react';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';


function PieChart({ data, energyTypes, energyInfo, showType, theme, date, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : 'rgba(0,0,0,0.8)';   
    let seriesData = [];
    // 获取到能源饼图的数据
    data.forEach(item=>{
        seriesData.push({
            name: energyInfo.typeCode === 'ele' ? item.name : energyTypes[item.energyType].typeName,
            unit:energyTypes[item.energyType].unit,
            value: showType === 'cost' ? item.cost : item.sumUsage,
            ratio: showType === 'cost' ? item.totalCostPercentage : item.totalSumUsagePercentage,
            label:{ show:false },
            labelLine:{ show:false }
        })
    })
    const echartsRef = useRef();
    let title =  `${ forReport ? date : '本' }月${ energyInfo.typeName }${ showType === 'cost' ? '费用' : '能耗'}`;
    return (   
        <div style={{ height:'100%'}}>
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = title;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:theme === 'dark' ? '#191932' : '#fff' })
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
                        var aoa = [], thead = ['对比项','单位','数值','占比'];
                        aoa.push(thead);
                        if ( seriesData.length ) {
                            seriesData.forEach(item=>{
                                let temp = [];
                                temp.push(item.name);
                                temp.push( showType === 'cost' ? '元' : item.unit );
                                temp.push( item.value );
                                temp.push( item.ratio + '%');
                                aoa.push(temp);
                            })
                        } else {
                            message.info('数据源为空');
                        }
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, title + '.xlsx' );
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
                    tooltip: {
                        trigger: 'item',
                        formatter: `{b}: {c}${ showType === 'cost' ? '元' : energyInfo.unit }({d}%)`
                    },
                    title:{
                        text:title,
                        top:10,
                        left:'20%',
                        textStyle:{ color:textColor }
                    },                   
                    legend: {
                        itemWidth:10,
                        itemHeight:10,
                        icon:'circle',
                        right:'10%',
                        top:'middle',
                        orient:'vertical',
                        data:seriesData.map(i=>i.name),
                        textStyle:{ color:textColor },
                        formatter:(name)=>{
                            let info = seriesData.filter(i=>i.name === name)[0];
                            return `{title|${name}}\n{value|${Math.round(info.value)}}{title|${showType === 'cost' ? '元' : info.unit }}    {value|${info.ratio}}{title|%}`
                        },
                        textStyle:{
                            rich: {
                                title: {
                                    fontSize: 12,
                                    lineHeight: 20,
                                    color: '#9a9a9a'
                                },
                                value: {
                                    fontSize: 16,
                                    fontWeight:'bold',
                                    lineHeight: 20,
                                    color:textColor,
                                    padding:[0,4,0,0]
                                }
                            }
                        }
                    },
                    color:['#4ccdef','#a61dfb','#ffba58','#7a7ab3','#57e29f'],  
                        
                    series: [
                        {
                            type: 'pie',
                            center:['30%','55%'],
                            radius: forReport ? ['38%', '45%'] : ['48%', '55%'],
                            avoidLabelOverlap: true,
                            itemStyle:{
                                borderColor: theme === 'dark' ? '#191932' : '#fff',
                                borderWidth:4,
                            },

                            // label:{
                            //     position:'inside',
                            //     formatter:(params)=>{                                
                            //         return params.data.value ? `${params.data.name} ${total ? (params.data.value/total*100).toFixed(1) : 0.0 }%` : '';
                            //     },
                            //     fontSize:14,
                            //     color:'#000',
                            //     fontWeight:'bold'
                            // },
                            emphasis:{
                                labelLine:{ show:false }
                            },
                            data:seriesData
                        }
                    ]
                }}
            /> 
        </div> 
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(PieChart, areEqual);
