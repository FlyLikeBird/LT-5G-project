import React, { useState } from 'react';
import { Radio, Spin, Select, Button } from 'antd';
import MonthPieChart from '@/pages/energy_manage/components/MonthPieChart';
import RadarChart from './RadarChart';
import ResultPieChart from './ResultPieChart';
import plateImg from '../../../../../public/plate-bg.png';
import style from '../report.css';
import IndexStyle from '@/pages/IndexPage.css';

const { Option } = Select;
function PageItem0({ dispatch, companyName, title }){
    let titleStr = title.split('-');
 
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
            {/* 图表区 */}                
            <div style={{ height:'300px' }}>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%' }}>
                    <div className={IndexStyle['card-container']} style={{ boxShadow:'none', textAlign:'center' }}>
                        <ResultPieChart />
                        <div style={{ position:'absolute', left:'50%', bottom:'10px', marginLeft:'-40px'}}>综合电价排名</div>
                    </div>
                </div>
                <div className={IndexStyle['card-container-wrapper']} style={{ width:'50%', paddingRight:'0' }}>
                    <div className={IndexStyle['card-container']} style={{ boxShadow:'none', textAlign:'center' }}>
                        <img src={plateImg} style={{ width:'200px' }} />
                        <div style={{ position:'absolute', left:'50%', top:'110px', transform:'translateX(-50%)', fontWeight:'bold', fontSize:'3rem' }}>
                            {/* { `第${rankAndGrade.rank || '-'}名` } */}
                            第2名
                        </div>
                        <div style={{ position:'absolute', left:'50%', bottom:'10px', marginLeft:'-40px'}}>平台能效排名</div>
                    </div>
                </div>
            </div>
            <div style={{ height:'360px', paddingBottom:'1rem' }}>
                <div className={IndexStyle['card-container']} style={{ boxShadow:'none' }}>
                    <RadarChart />
                </div>
            </div> 
            
            
            <div className={style['page-footer']}>
                <div style={{ width:'100%', height:'1px', display:'inline-block', backgroundColor:'#000'}}></div>
                <div style={{ position:'absolute', right:'0', top:'6px', backgroundColor:'#fff', paddingLeft:'10px', fontSize:'0.8rem'}}>{ companyName || '' }</div>
            </div>
        </div>
    )
}

export default PageItem0;