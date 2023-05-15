import React from 'react';
import style from './template2.css';

let energyMaps = {
    'ele':'电',
    'water':'水',
    'gas':'气',
    'hot':'热'
};

function EnergyProcess({ data }){
    return (
        <div className={style['flex-container']} style={{ padding:'0 1rem' }}>
            {
                data.map((item,index)=>(
                    <div className={style['flex-item']} key={index}>
                        <div className={style['flex-item-content']}>
                            <span style={{ width:'10%', paddingLeft:'10px', color:'#506575' }}>{`用${item.typeName}`}</span>
                            <span className={style['process-container']}>
                                <span className={style['process-item']} style={{
                                    width:item.percent + '%',
                                    backgroundColor:item.monthQuota && item.monthActual > item.monthQuota ? '#ff9937' : '#5dbbee' 
                                }}></span>
                                {/* 定位指针 */}
                                <div className={style['flex-pointer']} style={{
                                    left: item.percent + '%',
                                    borderColor:item.monthQuota && item.monthActual > item.monthQuota ? '#ff9937' : '#5dbbee'    
                                }}>
                                    { `${Math.round(item.monthActual)} ${item.unit}`}
                                    <div className={style['arrow']} style={{ borderBottom: item.monthQuota && item.monthActual > item.monthQuota ?  '10px solid #ff9937' : '10px solid #5dbbee'  }}></div>
                                </div>
                            </span>
                            <span style={{ width:'22%', paddingLeft:'10px', fontSize:'1.2rem', whiteSpace:'nowrap', color:'rgba(0, 0, 0, 0.85)' }}>{`${item.monthQuota} ${item.unit}`}</span>
                        </div>
                        
                    </div>
                ))
            }
        </div>
    )
}

export default EnergyProcess;