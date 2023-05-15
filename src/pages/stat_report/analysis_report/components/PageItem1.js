import React, { useState, useEffect } from 'react';
import { Radio, Spin, Select, Button } from 'antd';
import MonthPieChart from '@/pages/energy_manage/components/MonthPieChart';
import InfoItem from '@/pages/energy_manage/components/InfoItem';
import RangeBarChart from '@/pages/energy_manage/components/RangeBarChart';
import AttrRankBar from '@/pages/energy_manage/components/AttrRankBar';
import CostQuotaChart from '@/pages/energy_manage/components/CostQuotaChart';
import style from '../report.css';
import IndexStyle from '@/pages/IndexPage.css';

const { Option } = Select;
let resultInfo = [];
let sumInfoList = [];

function PageItem1({ dispatch, title, companyName, energy, cost, fields, baseCost, startDate }){
    const [showType, setShowType] = useState('cost'); 
    let titleStr = title.split('-');
    const { allFields, energyTypes, currentEnergy, currentField } = fields; 
    const { pieChartInfo, infoList, chartInfo } = energy;
    const { chartLoading, chartInfoList, rankInfo, fieldAttrs, quotaInfo } = cost;
    const { measureCostInfo, baseCostInfo, adjustCostInfo  } = baseCost;
    let { localCalcType, localMaxDemand, localDemandPrice, localDemandAmount, localMonthTotalKva, localMonthKvaPrice, localKvaAmount } = baseCostInfo || {} ;
    let { accruedAdjustCost, avgFactor, advice } = adjustCostInfo || {};
    localDemandAmount = localDemandAmount || 0;
    localKvaAmount = localKvaAmount || 0;
    let saveCost = Math.abs(localDemandAmount - localKvaAmount)
    let billingText = localCalcType === 2 && localDemandAmount < localKvaAmount ? '如改为按需计费，可节省' + saveCost + '元':
                        localCalcType === 1 && localDemandAmount > localKvaAmount ? '如改为按容计费, 可节省' + saveCost + '元':
                    '';
    let energyInfo = energyTypes[currentEnergy] || {};  
    let fieldEnergy = currentEnergy === 0 ? 1 : currentEnergy;
    // 获取维度列表时过滤掉energyType === 0 的情形
    let temp = allFields.filter(i=>i.energyType === fieldEnergy )[0];
    let fieldList = temp && temp.energyFieldList ? temp.energyFieldList : []; 
    if ( currentEnergy === 0 && pieChartInfo.length ) {
        // 结论信息只呈现总能源下的各项信息
        resultInfo = pieChartInfo;
        sumInfoList = infoList;
    }
    // 生成诊断结论
    let summaryArr = [];
    if ( Object.keys(measureCostInfo).length ) {
        
    }
    return (
        <div className={style['page-container']} >
            <div>
                <div className={style['page-title']}>
                    <span>{ titleStr[0] }</span>
                    <span style={{ fontSize:'0.8rem' }}>{ titleStr[1] }</span>
                </div>
            </div>
            <div style={{ position:'relative', margin:'1rem 0' }} >
                <div className={style['page-symbol']} ></div>
                <div className={style['page-head-mark']} style={{ backgroundColor:'#00b0f0'}}></div>
                <div className={style['page-head-mark']} style={{ backgroundColor:'#b8de95'}}></div>
            </div>
            <div>
                    {
                        resultInfo  
                        ?

                        <ul>
                            {/* 计量电费-建议 */}
                            <li>
                                { `${startDate.month() + 1}月总计量电费` }
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { measureCostInfo.totalCost || '--'} </span>
                                元, 其中
                                {
                                    measureCostInfo.timeTypeCostList && measureCostInfo.timeTypeCostList.length 
                                    ?
                                    measureCostInfo.timeTypeCostList.map(item=>(
                                        <span>
                                            <span>{ item.timeTypeName + '电价:' }</span>
                                            <span style={{ color:'#1890ff', fontWeight:'bold', }}> { item.feeRate } </span>
                                            , 电费
                                            <span style={{ color:'#1890ff', fontWeight:'bold', }}> { item.cost } </span>
                                            元 , 
                                        </span>
                                    ))
                                    :
                                    null
                                }
                                <ul style={{ backgroundColor:'#d2f3d2', paddingTop:'1rem', paddingBottom:'1rem' }}>
                                    <li>
                                        谷时用电计划：将大功率设备的用电时间安排在谷时期，这样可以最大程度地降低用电成本。
                                    </li>
                                    <li>
                                        优化设备能效：一些设备有着很高的峰时用电需求，为了最小化用电成本，可以选择更加高效的设备，以便在谷时段中获得更高的能效比率
                                    </li>
                                </ul>
                            </li>
                            
                            
                            {/* 基本电费-建议 */}
                            <li>
                                基本电费当前计费方式 :  
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { localCalcType === 2 ? '按容量' : '按需量'}计费, </span>
                                费用为: 
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {localCalcType === 2 ? localKvaAmount : localDemandAmount } </span>
                                元, 
                                <span> { billingText } </span>
                                <ul style={{ backgroundColor:'#d2f3d2', paddingTop:'1rem', paddingBottom:'1rem' }}>
                                    {
                                        localCalcType === 1 && localDemandAmount >= measureCostInfo.totalCost * 0.1
                                        ?
                                        <li>合理规划用电 : 建议制定合理的用电计划，尽量避免在用电高峰期使用大功率设备，从而造成可以避免的最大需量峰值，从而降低用电成本。</li>
                                        :
                                        <li>目前用电计划合理，请继续保持</li>
                                        
                                    }
                                </ul>

                            </li>
                            <li>
                                <span>当前功率因素 : </span>
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { `${avgFactor || 0} , ` }</span>

                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { accruedAdjustCost ? accruedAdjustCost <= 0 ? '奖励' : '罚款' : '奖励'} { accruedAdjustCost ? Math.abs(accruedAdjustCost) : 0 } </span>
                                元
                               
                                <ul style={{ backgroundColor:'#d2f3d2', paddingTop:'1rem', paddingBottom:'1rem' }}>
                                    {
                                        adjustCostInfo.avgFactor && adjustCostInfo.avgFactor < 0.9 
                                        ?
                                        <li>采用无功功率补偿设备 : 无功功率补偿设备可以提高电网的功率因数，降低线路损耗和变压器负担，从而降低用电成本。常用的无功功率补偿设备包括电力电容器和并联电抗器等。</li>
                                        :
                                        <li>功率因素考核正常，请继续保持</li>
                                    }
                                </ul>
                            </li>                                                                                                            
                          
                        </ul>
                        :
                        null                        
                    }
            </div>
            {/* 图表区 */}
            <div style={{ height:'40px'}}>
                <Radio.Group buttonStyle='solid' size='small' style={{ marginRight:'20px' }} value={currentEnergy} className={IndexStyle['custom-radio']} onChange={(e)=>{
                    let fieldEnergy = e.target.value === 0 ? 1 : e.target.value;
                    dispatch({ type:'fields/setEnergyType', payload:e.target.value });
                    dispatch({ type:'energy/updateEnergyType'});
                    dispatch({ type:'energy/fetchTotalCost', payload:{ timeType:'2' }});  
                    // 切换能源类型时，更新对应的维度信息
                    let temp = allFields.filter(i=>i.energyType === fieldEnergy )[0];
                    let fieldList = temp && temp.energyFieldList ? temp.energyFieldList : [];
                    dispatch({ type:'fields/setCurrentField', payload:fieldList[0] || {} });
                    dispatch({ type:'cost/fetchCostTrend'});
                    dispatch({ type:'cost/fetchCostQuota'});                         
                }}>
                    {
                        [0].concat(allFields.map(i=>i.energyType)).map((item,index)=>(
                            <Radio.Button key={item} value={item}>{ energyTypes[item] ? energyTypes[item].typeName : '' }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <Radio.Group buttonStyle='solid' size='small' value={showType} className={IndexStyle['custom-radio']} onChange={e=>setShowType(e.target.value)}>
                    <Radio.Button value='cost'>成本</Radio.Button>
                    <Radio.Button value='energy'>能耗</Radio.Button>
                </Radio.Group>
            </div>
            <div style={{ height:'300px' }}>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%' }}>
                    <div className={IndexStyle['card-container']} style={{ boxShadow:'none' }}>
                    {
                        pieChartInfo.length 
                        ?
                        <MonthPieChart data={pieChartInfo} energyTypes={energyTypes} energyInfo={energyInfo} showType={showType} date={startDate.month() + 1} forReport={true} />
                        :
                        <Spin className={IndexStyle['spin']} />
                    }
                    </div>
                </div>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%', paddingRight:'0' }}>
                        {
                            infoList.map((item,index)=>(
                                <div key={index} style={{ height:'33.3%', paddingBottom:index === infoList.length - 1 ? '0' : '1rem' }}>
                                    <div className={IndexStyle['card-container']} style={{ boxShadow:'none' }}>
                                        <InfoItem key={index} data={item} energyInfo={energyInfo} showType={showType} startDate={startDate} forReport={true} />
                                    </div>
                                </div>
                            ))
                        }
                </div>
            </div>
            <div style={{ height:'280px', paddingBottom:'1rem' }}>
                <div className={IndexStyle['card-container']} style={{ boxShadow:'none' }}>
                    <RangeBarChart 
                        data={chartInfo}
                        energyInfo={energyInfo} 
                        showType={showType}
                        onDispatch={action=>dispatch(action)}
                        forReport={true}
                    /> 
                </div>
            </div> 
            
            <div style={{ height:'280px' }}>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%', position:'relative' }}>
                    <div style={{ position:'absolute', zIndex:'10', right:'1.4rem', top:'4px' }}>
                        <Select className={IndexStyle['custom-select']} size='small' style={{ width:'140px' }} value={currentField.fieldId} onChange={value=>{
                            let temp = fieldList.filter(i=>i.fieldId === value )[0];
                            dispatch({ type:'fields/setCurrentField', payload:temp });              
                            dispatch({ type:'cost/fetchCostTrend'});
                            dispatch({ type:'cost/fetchCostQuota'});   
                        }}>
                            {
                                fieldList.map((item)=>(
                                    <Option key={item.fieldId} value={item.fieldId}>{ item.fieldName }</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <AttrRankBar data={rankInfo} chartLoading={chartLoading} fieldName={currentField.fieldName || '--'} energyInfo={ ( currentEnergy === 0 ? energyTypes[1] : energyTypes[currentEnergy] ) || {}} showType={showType} forReport={true} />
                </div>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%', paddingRight:'0' }}>
                    <CostQuotaChart data={quotaInfo} energyInfo={ ( currentEnergy === 0 ? energyTypes[1] : energyTypes[currentEnergy] ) || {}} showType={showType}  forReport={true} />
                </div>
            </div>
            <div className={style['page-footer']}>
                <div style={{ width:'100%', height:'1px', display:'inline-block', backgroundColor:'#000'}}></div>
                <div style={{ position:'absolute', right:'0', top:'6px', backgroundColor:'#f7f7f7', paddingLeft:'10px', fontSize:'0.8rem'}}>{ companyName || '' }</div>
            </div>
        </div>
    )
}

export default PageItem1;