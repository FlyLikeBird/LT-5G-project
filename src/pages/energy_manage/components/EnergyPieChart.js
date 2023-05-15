import React, { useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

let energyMaps = {
    'tip':'尖',
    'top':'峰',
    'middle':'平',
    'bottom':'谷',
    'base':'基',
    'ele':'电',
    'water':'水',
    'hot':'热',
    'gas':'气',
    'combust':'燃气',
    'compressed':'压缩气体'
}
function PieChart({ data, energyInfo, showType, theme, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : 'rgba(0,0,0,0.8)';   
    let legendData = [];
    let total = 0;
    // 获取到能源饼图的数据
    const valueArr = Object.keys(data).map(key=>{
        let obj = {};
        obj.name = energyMaps[key];
        obj.value = showType === '0' ? ( data[key].cost || 0 ) : ( data[key].energy || 0);
        obj.label = { show:false };
        obj.labelLine = { show:false };
        if ( obj.name ){
            total += +obj.value;
            legendData.push(obj.name);
        }
        return obj;
    });

    const echartsRef = useRef();
    let title = energyInfo.type_id === 0 ? `本月总${ showType === '0' ? '费用' : '能耗'}` : `本月${ energyInfo.type_name}${ showType === '0' ? '费用':'能耗'}`;
    return (   
        <div style={{ height:'100%'}}>
           
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = title;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:'#191932' })
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
                        message.info('开发中...');
                        // var aoa = [], thead = ['对比项','单位','数值','占比'];
                        // aoa.push(thead);
                        // valueArr.filter(i=>i.name).forEach(i=>{
                        //     let temp = [];
                        //     temp.push(i.name);
                        //     temp.push(energyInfo.unit);
                        //     temp.push(i.value);
                        //     temp.push(`${total ? Math.round(i.value/total*100) : 0 }%`);
                        //     aoa.push(temp);
                        // });
                    
                        // var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        // sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        // downloadExcel(sheet, fileTitle + '.xlsx' );
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
                    tooltip: {
                        trigger: 'item',
                        formatter: `{b}: {c}${showType === '0' ? '元' : energyInfo.unit }({d}%)`
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
                        right:'12%',
                        top:'middle',
                        orient:'vertical',
                        data:legendData,
                        textStyle:{ color:textColor },
                        formatter:(name)=>{
                            let temp = valueArr.filter(i=>i.name === name)[0];
                            return `{title|本月${name}}\n{value|${Math.round(temp.value)}}{title|${showType === '0' ? '元' : energyInfo.unit }}    {value|${total ? (temp.value / total * 100).toFixed(1) : 0.0 }}{title|%}`
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
                            radius: ['42%', '55%'],
                            avoidLabelOverlap: true,
                            itemStyle:{
                                borderColor: theme === 'dark' ? '#191932' : '#fff',
                                borderWidth:2,
                            },
                            label:{
                                // position:'inside',
                                formatter:(params)=>{                                
                                    return params.data.value ? `${params.data.name} ${total ? (params.data.value/total*100).toFixed(1) : 0.0 }%` : '';
                                },
                                fontSize:14,
                                // color:'#000',
                                fontWeight:'bold'
                            },
                            emphasis:{
                                labelLine:{ show:false }
                            },
                            data:valueArr
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
