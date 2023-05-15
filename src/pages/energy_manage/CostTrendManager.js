import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Radio, Select } from 'antd';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import EnergyBarChart from './components/EnergyBarChart';
import AttrRankBar from './components/AttrRankBar';
import CostQuotaChart from './components/CostQuotaChart';
import style from '@/pages/IndexPage.css';

const { Option } = Select;
function CostTrendManager({ dispatch, user, fields, cost }){
    const { authorized, startDate, theme } = user;
    const [showType, setShowType] = useState('cost');
    const { currentEnergy, allFields, energyTypes, allFieldAttrs, currentField } = fields;
    const { chartLoading, chartInfoList, rankInfo, fieldAttrs, quotaInfo } = cost;
    const energyFieldInfo = allFields.filter(i=>i.energyType === currentEnergy )[0];
    const fieldList = energyFieldInfo && energyFieldInfo.energyFieldList ? energyFieldInfo.energyFieldList : [];
    let energyInfo = energyTypes[currentEnergy] || {};
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'cost/initCostTrend'});
        }
    },[authorized]);
    return (
        <div className={style['page-container']} style={{ height:'100%'}}>
            <div style={{ height:'40px', display:'flex' }}>
                <Radio.Group className={style['custom-radio']} style={{ marginRight:'1rem' }} value={showType} onChange={e=>setShowType(e.target.value)}>
                    <Radio.Button value='cost'>成本</Radio.Button>
                    <Radio.Button value='energy'>能耗</Radio.Button>
                </Radio.Group>
                <Radio.Group className={style['custom-radio']} style={{ marginRight:'1rem' }} value={currentEnergy} onChange={e=>{
                    dispatch({ type:'fields/setEnergyType', payload:e.target.value });
                    let temp = allFields.filter(i=>i.energyType === e.target.value )[0];
                    let fieldList = temp && temp.energyFieldList ? temp.energyFieldList : [];
                    dispatch({ type:'fields/setCurrentField', payload:fieldList[0] || {} });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/fetchFieldAttrs', payload:{ resolve, reject }})
                    })
                    .then(()=>{
                        dispatch({ type:'cost/fetchCostTrend'});
                        dispatch({ type:'cost/fetchCostQuota'});
                    })
                }}> 
                    {
                        allFields.map((item, index)=>(
                            <Radio.Button value={item.energyType} key={index}>{ item.typeName }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <Select className={style['custom-select']} style={{ width:'160px', marginRight:'1rem' }} value={currentField.fieldId} onChange={value=>{
                    let temp = fieldList.filter(i=>i.fieldId === value )[0];
                    dispatch({ type:'fields/setCurrentField', payload:temp });              
                    dispatch({ type:'cost/fetchCostTrend'});
                    dispatch({ type:'cost/fetchCostQuota'});              
                }}>
                    {
                        fieldList.map(item=>(
                            <Option key={item.fieldId} value={item.fieldId}>{ item.fieldName }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker noToggle onDispatch={()=>{
                    dispatch({ type:'cost/fetchCostTrend'});
                    dispatch({ type:'cost/fetchCostQuota'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)' }}>
                <div style={{ height:'50%' }}>
                    {
                        chartInfoList.map((item, index)=>(
                            <div key={index} className={style['card-container-wrapper']} style={{ width:'33.3%', paddingRight: index === chartInfoList.length - 1 ? '0' : '1rem' }}>
                                <EnergyBarChart 
                                    key={item.key}
                                    data={item}
                                    currentDate={startDate}
                                    energyInfo={energyInfo}
                                    fieldAttrs={fieldAttrs}
                                    showType={showType}
                                    chartLoading={chartLoading}
                                    theme={theme}
                                />
                            </div>
                        ))
                    }
                </div>
                <div style={{ height:'50%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                        <AttrRankBar data={rankInfo} chartLoading={chartLoading} fieldName={currentField.fieldName || '--'} energyInfo={energyInfo} showType={showType} />
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:'0', paddingBottom:'0' }}>
                        <CostQuotaChart data={quotaInfo} energyInfo={energyInfo} showType={showType} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(({ user, fields, cost })=>({ user, fields, cost }))(CostTrendManager);