import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import style from './ScrollTable.css';

let scrollNum = 5;
let timer = null;
let mockData = [];
for ( let i =0;i<10;i++){
    mockData.push({ index:i, mach_name:'设备' + i, region_name:'XXX', type_name:'越限告警', warning_date:'2022-10-1 15:00'})
}
function ScrollTable({ data }){
    const [scroll, setScroll] = useState({ list: data && data.length ? data.slice(0,scrollNum) : [], current:0});
    const scrollRef = useRef(scroll);
    useEffect(()=>{
        scrollRef.current = scroll;
    });
    useEffect(()=>{
        let tempArr, timer, count;
        if ( data.length <= scrollNum ) {
            tempArr = data.slice();
            setScroll({ list:tempArr, current:0});
        } else {
            let temp = Math.floor((data.length)/scrollNum);
            count = (data.length) % scrollNum === 0 ? temp : temp + 1;
            timer = setInterval(()=>{
                let { current } = scrollRef.current;
                if ( current === count ){
                    current = 0;
                }
                let startIndex = current * scrollNum ;
                tempArr = data.slice(startIndex, startIndex + scrollNum );
                // if ( tempArr.length < scrollNum ) {
                //     // 当滚动到不足一屏数量时，填充item保证高度不变
                //     let diffNum = scrollNum - tempArr.length;
                //     for(let i=0;i<diffNum;i++){
                //         tempArr.push({ ...tempArr[0], fillItem:true });
                //     }
                // }
                ++current;
                setScroll({ list:tempArr, current});
            },5000)
        }
        return ()=>{
            clearInterval(timer);
            timer = null;
        }
    },[]);
    return (
        <div className={style['container']}>
            <div className={style['content-container']}>
                {
                    scroll.list && scroll.list.length 
                    ?
                    scroll.list.map((item,index)=>(
                        <div className={style['item']} key={index}>
                            <div><span className={style['num']}>{ scroll.current * scrollNum + 1 }</span></div>
                            <div>{ item.attrName || '-- --'}</div>
                            {/* <div>{ item.region_name || '-- --' }</div> */}
                            <div><span className={style['tag']}>{ item.typeName}</span></div>
                            <div>{ item.lastWarningTime }</div>
                             
                        </div>
                    ))
                    :
                    null                    
                }
            </div>
        </div>
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(ScrollTable, areEqual);