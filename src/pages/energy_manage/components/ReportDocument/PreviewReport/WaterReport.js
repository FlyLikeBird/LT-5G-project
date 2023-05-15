import React, { useState, useRef } from 'react';
import { Button } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import style from './PreviewReport.css';

const colors = ['#65cae3','#2c3b4d','#62a4e2','#57e29f'];

function getBase64(dom){
    return html2canvas(dom, { background:'#f7f7f7'})
        .then(canvas=>{
            let MIME_TYPE = "image/png";
            return canvas.toDataURL(MIME_TYPE);
        })
}

function PreviewReport({ documentInfo, energyInfo, companyInfo, currentField, currentAttr, date, costMode, onCancel, onTranslateImg, onCreateDocument  }) {
    const containerRef = useRef(null);
    const multiRefs = useRef([]);
    const { meterInfo, ratio, regionCost, regionEnergy, totalCost, totalEnergy } = documentInfo.table;
    let energy = energyInfo.type_name;
    const dateStr = date.format('YYYY-MM').split('-');
    const columns = [
        { title:'设备', dataIndex:'meter_name' },
        { title:'表编', dataIndex:'register_code'},
        { title:'期初表码', dataIndex:'minEnergy'},
        { title:'期末表码', dataIndex:'maxEnergy'},
        { title:`本月总用量(${energyInfo.unit})`, dataIndex:'energy' },
        { title:'本月总金额(元)', dataIndex:'cost'}
    ];
    let tableData = [];
    meterInfo.forEach((row,index)=>{
        let temp = [];
        columns.forEach(item=>{
            temp.push(row[item.dataIndex]);
        });
        tableData.push(temp);
    })
    const view1 = documentInfo.view1;
    const view2 = documentInfo.view2;
    const view3 = documentInfo.view3;
    const view2Series = [], view3Series = [];
    view2Series.push({ name:energy, type:'bar', data:view2.value, barWidth:14 });
    view3Series.push({ name:energy, type:'bar', barWidth:14, data:view3.value });
   
    const handleTranslateImg = ()=>{
        if ( multiRefs.current && multiRefs.current.length ){
            Promise.all(multiRefs.current.map((item)=>getBase64(item)))
                //将文档中的canvas转换成base64位字符串; 
            .then((imgArr)=>{
                    new Promise((resolve)=>{
                        // 将转换后的base64字符串提交到服务器然后替换文档中的图片路径
                        onTranslateImg({ data:imgArr, resolve });
                    })
                    .then((imagesPath)=>{
                        let finalStr = '', tableStr = '';
                        let contentStr = containerRef.current.innerHTML;
                        let pattern = /<table.*<\/table>/;
                        let result = contentStr.match(pattern);
                        if ( result ) {
                            tableStr = result[0];
                        }
                        for(let i=0,len=imagesPath.length;i<len-1;i++){
                            finalStr += `<img src='${imagesPath[i]}'/>`;
                        }
                        finalStr += tableStr + `<img src='${imagesPath[imagesPath.length-1]}'/>`;
                        onCreateDocument( finalStr );
                        onCancel();
                    })
                })
        }
    };
    // console.log(tableData);
    return ( 
        <div className={style['container']}>      
        <div ref={containerRef} >            
            <div ref={el=>multiRefs.current[0] = el} className={style['title-container']} style={{ 
                textAlign:'center', 
                position:'relative', 
                marginBottom:'20px', 
                height:'120px', 
                backgroundColor:'rgb(101 202 227)',
                color:'#fff'
            }} 
            >
                {/* <div className={style['info-container']} style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-end', paddingRight:'10px' }}>
                    <div className={style['attr']}>{ `${currentField.field_name} - ${currentAttr.title}`}</div>
                    <div className={style['year']}>{dateStr[0]}</div>
                    <div>{`${dateStr[1]}月能源成本`}</div>
                    <div>内部结算单据</div>
                </div> */}
                {/* <div style={{backgroundImage:`url(${documentInfo.bgData})`, minWidth:'400px', backgroundRepeat:'no-repeat', backgroundSize:'contain'}}>
                </div> */}
                    <span style={{ fontSize:'1rem', position:'absolute', top:'0', left:'0', backgroundColor:'#85d1e4', padding:'4px 10px'}}>{ `计量点 : ${currentField.field_name} - ${currentAttr.title}`}</span>
                    <span style={{ fontSize:'2rem', lineHeight:'120px'}}>{`${companyInfo ? companyInfo.company_name : ''}${dateStr[0]}年${dateStr[1]}月${energy}成本内部结算单据`}</span>
                   
            </div>
            <div ref={el=>multiRefs.current[1] = el} className={style['chart-container']} style={{ marginBottom:'20px'}}>
                {/* chart1 */}
                <div>
                    <div className={style['head']}>{`本月应缴${energy}费用`}</div>
                    <div className={style['chart-item']}>
                        <div style={{ display:'inline-block', width:'50%'}}>
                            <ReactEcharts
                                notMerge={true}
                                option={{
                                    legend:{
                                        top:20,
                                        orient:'horizontal',
                                        data:[energy]
                                    },
                                    color:colors,
                                    series:{
                                        type:'pie',
                                        radius: ['50%','70%'],
                                        center: ['50%', '50%'],
                                        data:[ { value:view1.cost, name:energy }]
                                    }
                                }}
                            />
                        </div>
                        <div style={{ width:'50%', display:'flex', flexDirection:'column' }}>
                            <div className={style['info-item']} >
                                <div>{`${energy}费成本`}</div>
                                <div className={style['num']}>{`￥${Math.floor(view1.cost)}元`}</div>
                            </div>
                            <div className={style['info-item']} >                         
                                <div>
                                    <div>
                                        <span style={{ width:'40%'}}>同比:</span>
                                        <span style={{ marginLeft:'10px', fontSize:'20px', color: view1.sameRatio <=0 ? '#6fcc17' : 'red' }}>{ view1.sameRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }{ Math.abs(view1.sameRatio).toFixed(1) + '%' } </span>
                                    </div>
                                    <div>
                                        <span style={{ width:'40%'}}>环比:</span>
                                        <span style={{ marginLeft:'10px', fontSize:'20px', color: view1.lastRatio <=0 ? '#6fcc17' : 'red' }}>{ view1.lastRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }{ Math.abs(view1.lastRatio).toFixed(1) + '%' } </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* chart2 */}
                <div>
                    <div className={style['head']}>{`过去12个月${energy}成本变化趋势`}</div>
                    <div className={style['chart-item']}>
                        <ReactEcharts                       
                            notMerge={true}
                            option={{
                                grid:{
                                    top:60,
                                    left:20,
                                    right:20,
                                    bottom:20,
                                    containLabel:true
                                },
                                label:{
                                    position:'inside',
                                },
                                tooltip:{ trigger:'axis' },
                                xAxis:{
                                    type:'category',
                                    data:view2.date,
                                    axisTick:{ show:false }
                                },
                                color:colors,
                                yAxis:{ type:'value', name:'(单位:元)', axisTick:{ show:false } },
                                series:view2Series
                            }}
                        />
                    </div>       
                </div>
            </div>
            {/* chart3 */}
            <div className={style['chart-container']} ref={el=>multiRefs.current[2] = el} style={{ marginBottom:'20px' }}>
                <div>
                    <div className={style['head']}>{`本月用${energy}量变化趋势图`}</div>
                    <div style={{backgroundColor:'#f7f7f7'}}>
                        <ReactEcharts                       
                            notMerge={true}
                            option={{
                                legend: {
                                    top:20,
                                    show: costMode === 'company' ? true : false,
                                    orient:'horizontal',
                                    data: costMode === 'company' ? view3Series.map(i=>i.name) : []
                                },
                                tooltip:{ trigger:'axis' },
                                label:{
                                    position:'inside',

                                },
                                grid:{
                                    top:60,
                                    left:20,
                                    right:40,
                                    bottom:20,
                                    containLabel:true
                                },
                                color:colors,
                                xAxis:{
                                    name:'天',
                                    type:'category',
                                    data:view3.date
                                },
                                yAxis:{ type:'value', name:`(单位:${energyInfo.unit})` },
                                series:view3Series
                            }}
                        />
                    </div>
                </div>               
            </div>
            <table style={{ width:'1152px', margin:'20px 0'}}>
                <thead style={{ backgroundColor:'#f7f7f7' }}>
                    <tr>
                        {
                            columns.map((column,i)=>(
                                <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}} key={i}>{column.title}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        tableData.map((row,i)=>{
                            return (
                                <tr key={i}>
                                    {
                                        row.map((item,j)=>{
                                            return (
                                                <td key={`${i}-${j}`} style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}}>{ item }</td>
                                            )
                                        })
                                    }
                                </tr>
                            )                  
                        })
                    }
                </tbody>
            </table>
            <table style={{ width:'1152px', margin:'20px 0'}}>
                <thead style={{ backgroundColor:'#f7f7f7' }}>
                    <tr>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{`总账户计量${energy}费(元)`}</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{`${energy}表计量汇总(${energyInfo.unit})`}</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{`总${energy}费占比`}</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{`总${energy}费分摊后(元)`}</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>{`本月${energy}费汇总(元)`}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+regionCost).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+regionEnergy).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+ratio).toFixed(1) + '%' } </td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+totalCost).toFixed(0) } </td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+totalCost).toFixed(0) }</td>
                    </tr>
                </tbody>
            </table>
            <div className={style['bottom-container']} ref={el=>multiRefs.current[3] = el}>
                <div>制表:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
                <div>复核:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
                <div>接收:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
            </div>
        </div>
        <div style={{textAlign:'center'}}>
            <Button type="primary" onClick={handleTranslateImg} style={{marginRight:'10px'}}>下载报告</Button>
            <Button onClick={()=>onCancel()}>取消</Button>
        </div>  
        </div>
    );
}

export default PreviewReport;
