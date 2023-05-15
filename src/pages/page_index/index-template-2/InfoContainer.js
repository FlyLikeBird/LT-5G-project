import React, { useState, useEffect, useRef } from 'react';
import style from './template2.css';
let repeatTimer;
let timer1;
let index = 1;

// 切换索引值
function InfoContainer({ data, energyTypes, coal, carbon }){
    const scrollRef = useRef();
    useEffect(()=>{
        repeatTimer = setInterval(()=>{
            // console.log(indexRef.current);      
            if ( scrollRef.current ){   
                if ( index === data.length ){          
                    timer1 = setTimeout(()=>{
                        scrollRef.current.style.transition = 'none';
                        scrollRef.current.style.transform = `translate(-50%, 100%)`;
                        index = 0;
                    },1200);
                }
                scrollRef.current.style.transition = 'transform 1s ease-in';
                scrollRef.current.style.transform = `translate(-50%,${-1 * index * 100}%)`;
                index += 1;
            } 
        },3000)
        return ()=>{
            clearInterval(repeatTimer);
            clearTimeout(timer1);
            repeatTimer = null;
            timer1 = null;
            index = 1;
        }
    },[])
    return (
        <div style={{ height:'100%' }}>
            <div className={style['left']}>
                <div className={style['text']}>本月折合标煤</div>
                <div>
                    <span className={style['data']}>{ Math.round(coal) }</span>
                    <span className={style['text']}>tce</span>
                </div>
            </div>
            {/* 滚动模块 */}
            <div ref={scrollRef} className={style['scroll-container']}>
                {
                    data.map((item,index)=>(
                        <div className={style['scroll-item']} key={index}>
                            <div className={style['text']}>{ `${ item.energyType === 0 ? '总' : energyTypes[item.energyType].typeName}能源成本` }</div>
                            <div><span className={style['data']} style={{ fontSize:'2.6rem', fontWeight:'bold' }}>{ item.cost }</span><span className={style['text']}>元</span></div>
                        </div>
                    ))
                }
            </div>
            <div className={style['right']}>
                <div className={style['text']}>本月碳排放</div>
                <div>
                    <span className={style['data']}>{ Math.round(carbon) }</span>
                    <span className={style['text']}>t</span>
                </div>
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(InfoContainer, areEqual);