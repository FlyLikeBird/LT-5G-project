import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link } from 'umi';
import { Menu, Tooltip, Button } from 'antd';
import * as Icons from '@ant-design/icons';
import style from './Menu.css';

const { SubMenu } = Menu;
// const IconsObj = {
//     'global_monitor':<DesktopOutlined />,
//     'ele_monitor_menu':<DashboardOutlined />,
//     'agent_monitor':<DesktopOutlined />,
//     'agent_company':<BarsOutlined />,
//     'user_manage':<UserOutlined />,
//     'energy_manage':<AccountBookOutlined />,
//     'coal_manage':<InteractionOutlined />,
//     'info_manage_menu':<FormOutlined />,
//     'mach_manage':<PullRequestOutlined />,
//     'system_log':<ProfileOutlined />,
//     'ele_quality':<ThunderboltOutlined />,
//     'energy_eff':<BarChartOutlined />,
//     'alarm_manage':<AlertOutlined />,
//     'stat_report':<FileTextOutlined />,
//     'system_config':<SettingOutlined />,
//     'analyze_manage':<SearchOutlined />
// }


const MenuComponent = ({ user, userList, dispatch})=>{
    const [openKeys, setOpenKeys] = useState([]);
    const { currentMenu, userInfo, userMenu, company_id, currentProject, containerWidth, collapsed, fromAgent, theme } = user;
    // console.log(currentMenu, currentPath);
    // let selectedKeys = currentMenu.children ? [currentMenu.children[0]+''] : [currentMenu.menu_id+''];
    // let openKeys = currentMenu.children ? [currentMenu.menu_id+''] : [currentMenu.parent+''];
    useEffect(()=>{
        setOpenKeys( currentMenu.children ? [currentMenu.menuId + ''] : [currentMenu.parent + '']);
    },[currentMenu]);

    let option = {
        mode:'inline',
        className: theme === 'dark' ? style['container'] + ' ' + style['dark'] : style['container'],
        selectedKeys:[currentMenu.menuId + ''],
        inlineCollapsed:collapsed
    }
    if ( !collapsed ){
        option.openKeys = openKeys;
    }
    // console.log(menuList);
    return (
            <Menu
                {...option}
            >                
                {
                    userMenu.map(item => {
                        let IconComponent = Icons[item.menuIcon] || null;
                        return (
                            item.subMenu && item.subMenu.length
                            ?
                            <SubMenu 
                                key={item.menuId}
                                onTitleClick={()=>{
                                    if ( openKeys.filter(i=>i == item.menuId).length ) {
                                        setOpenKeys([]);
                                    } else {
                                        setOpenKeys([item.menuId + '']);   
                                    }
                                    // 能源成本 、 能源效率 、 报警监控三个模块直接跳转到相关主页
                                    if ( 
                                        item.menuCode === 'global_monitor' || 
                                        item.menuCode === 'energy_manage' || 
                                        item.menuCode === 'energy_eff' || 
                                        item.menuCode === 'alarm_manage' || 
                                        item.menuCode === 'ele_quality' 
                                    ) {
                                        history.push(`/${currentProject}/${item.menuCode}`);
                                    }
                                }}
                                title={
                                <div>
                                    { IconComponent ? <IconComponent /> : null }
                                    <span className={style['menu-name']}>{ item.menuName }</span>
                                    <span className={style['arrow-button']}></span>
                                </div>
                            } >                      
                                {
                                    item.subMenu.map(sub => (
                                        // 项目首页和系统配置作为固定菜单，不可删除
                                        <Menu.Item key={sub.menuId}>
                                            {
                                                item.menu_id === 79 
                                                ?
                                                <Tooltip placement="right" title={                                               
                                                    <Button type='primary' size='small' onClick={(e)=>{
                                                        if ( stationMaps[sub.menu_id]){
                                                            e.stopPropagation();
                                                            // 兼容第三方服务商的location跳转
                                                            let temp = location.host.split('-');
                                                            let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
                                                            let linkPath = ( prefix ? stationMaps[sub.menu_id] + '-' + prefix : stationMaps[sub.menu_id] ) + '.h1dt.com';
                                                            // let linkPath = ( prefix ? stationMaps[sub.menu_id] + '-' + prefix : stationMaps[sub.menu_id] ) + '';
                                                            window.open(`http://${linkPath}?pid=${Math.random()}&&userId=${userInfo.user_id}&&companyId=${company_id}&&mode=full`);
                                                        }                                          
                                                    }}>{`进入${sub.menu_name}`}</Button>
                                                }>
                                                    <Link to={`/${currentProject}/${item.menuCode}/${sub.menuCode}`}>{sub.menuName}</Link>
                                                </Tooltip>
                                                :
                                                <Link to={`/${currentProject}/${item.menuCode}/${sub.menuCode}`} >{sub.menuName}</Link>

                                            }
                                        </Menu.Item>
                                    ))
                                }
                            </SubMenu>
                            :
                            <Menu.Item key={item.menuId}>
                                { IconComponent ? <IconComponent /> : null }
                                <span>
                                    <Link to={`/${currentProject}/${item.menuCode}`} >{ item.menuName }</Link>
                                </span>
                            </Menu.Item>
                        )        
                    })
                }   
            </Menu>
    )
}

export default connect(({ user, userList })=>({user, userList }))(MenuComponent);