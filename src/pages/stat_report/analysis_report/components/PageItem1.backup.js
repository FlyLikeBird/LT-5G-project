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
    let { accruedAdjustCost, advice } = adjustCostInfo || {};
    localDemandAmount = localDemandAmount || 0;
    localKvaAmount = localKvaAmount || 0;
    let saveCost = Math.abs(localDemandAmount - localKvaAmount)
    let billingText = localCalcType === 2 && localDemandAmount < localKvaAmount ? '如改为按需计费，可节省' + saveCost + '元':
                        localCalcType === 1 && localDemandAmount > localKvaAmount ? '如改为按容计费, 可节省' + saveCost + '元':
                    '请继续保持';
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
                            <li>
                                公司当前基本电费计费方式:  
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { localCalcType === 2 ? '按容量' : '按需量'}计费, </span>
                                费用为: 
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {localCalcType === 2 ? localKvaAmount : localDemandAmount } </span>
                                元, 
                                <span style={{ color:'#1890ff', fontWeight:'bold' }}> { billingText} </span>
                            </li>
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
                            </li>
                            <li>
                                共计力调电费
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { accruedAdjustCost ? accruedAdjustCost <= 0 ? '奖励' : '罚款' : ''} { accruedAdjustCost ? Math.abs(accruedAdjustCost) : 0 } </span>
                                元, 
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {advice} </span></li>
                            <li>
                                {`${startDate.month()+1}月总费用` }
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { sumInfoList[1] ?  sumInfoList[1].timeTotalCost : '--' } </span>
                                元, 其中
                                {
                                    resultInfo.map((item)=>(
                                        <span key={item.energyType}>
                                            { `${energyTypes[item.energyType].typeName}费` }
                                            <span style={{ color:'#1890ff', fontWeight:'bold', }}> { item.cost } </span>
                                            元, 占比 
                                            <span style={{ color:'#1890ff', fontWeight:'bold', }}> {item.totalCostPercentage} %, </span>
                                        </span>
                                    ))
                                }    
                            </li>
                            <li>
                                {`${startDate.month() + 1}月总费用` }
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {sumInfoList[1] ? sumInfoList[1].timeTotalCost : '--'} </span>
                                元, 对比上月
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { sumInfoList[1] ? sumInfoList[1].timeCostChain < 0 ? '减少' : '增加':'-'} { sumInfoList[1] ? sumInfoList[1].timeCostChain : '-'}%; </span>
                                {`${startDate.month() + 1}月总能耗` }
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> {sumInfoList[1] ? sumInfoList[1].timeTotalUsage : '--'} </span>
                                {energyInfo.unit}, 对比上月
                                <span style={{ color:'#1890ff', fontWeight:'bold', }}> { sumInfoList[1] ? sumInfoList[1].timeUsageChain < 0 ? '减少' : '增加':'-'} { sumInfoList[1] ? sumInfoList[1].timeUsageChain : '-'}% </span>
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
            <div style={{ height:'360px' }}>
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
            <div style={{ height:'300px', paddingBottom:'1rem' }}>
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
            
            <div style={{ height:'340px' }}>
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