import React, { Component, useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, Redirect } from 'dva/router';
import style from './IndexPage.css';
import Menu from './components/Menu';
import Header from './components/Header';

function isFullscreen(){
    return document.fullscreenElement    ||
           document.msFullscreenElement  ||
           document.mozFullScreenElement ||
           document.webkitFullscreenElement || false;
}

function ProjectIndex({ dispatch, user, children }){
    let { currentMenu, userInfo, authorized, fromAgent, collapsed, containerWidth, msg, theme } = user;
    let sidebarWidth = collapsed ? 70 : containerWidth * 0.1 ;
    useEffect(()=>{
        function handleResize(){
            dispatch({ type:'user/setContainerWidth'});
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            window.removeEventListener('resize', handleResize);
            
        }
    },[]);
    let isFulled = isFullscreen();
    return (  
        <div 
            className={
                theme === 'dark' 
                ?
                style['container'] + ' ' + style['dark']
                :
                style['container']
            }
        > 
            {
                authorized && userInfo.agent_id && !fromAgent 
                ?
                <Redirect to='/agentMonitor' />
                :
                authorized
                ?
                <div style={{ height:'100%'}}>
                    <Header data={user} onDispatch={action=>dispatch(action)} collapsed={collapsed} sidebarWidth={sidebarWidth} msg={msg} theme={theme}  />
                    <div className={style['main-content']} style={ isFulled && ( currentMenu.path === 'ai_gas_station' || currentMenu.path === 'power_room' ) ? { height:'100%' } : {} }>
                        <div className={ theme==='dark' ? style['sidebar-container'] + ' ' + style['dark'] : style['sidebar-container']} style={{ width: sidebarWidth + 'px' }} >
                            <Menu />
                        </div>
                        <div className={style['content-container']} style={{ left: isFulled && ( currentMenu.path === 'ai_gas_station' || currentMenu.path === 'power_room' ) ? '0' : sidebarWidth + 'px' }}>                  
                            { children }        
                        </div>
                    </div>
                </div>
                :
                null
            } 
        </div>
    )
}

export default connect(({ user }) => ({ user }))( ProjectIndex );