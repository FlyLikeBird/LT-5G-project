import React, { useEffect, useState, useRef } from 'react';
import MotionImg from '../../../../public/page-index-template/alarm_motion.png';
import style from './template2.css';

let imgWidth = 500, imgHeight = 500;
function RotatedSymbol(){
    let containerRef = useRef();
    let [height, setHeight] = useState(0);
    useEffect(()=>{
        let container = containerRef.current;
        let containerWidth = container.offsetWidth;
        let ratio = containerWidth / imgWidth;
        let height = Math.round(imgHeight * ratio);
        container.style.height = height + 'px';
        setHeight(height);
    },[])
    return (
        <div ref={containerRef} style={{ position:'relative' }}>
            <div className={style['rotate-symbol']} style={{
                transformOrigin:`50% ${height/2 + 10}px`,
            }}></div>
            <img src={MotionImg} style={{ width:'100%' }} />
        </div>
    )
}

export default RotatedSymbol;