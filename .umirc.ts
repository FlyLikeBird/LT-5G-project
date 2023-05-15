import { defineConfig } from 'umi';
export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  dva:{},
  dynamicImport:{
  },
  metas: [
    {
      httpEquiv: 'Cache-Control',
      content: 'no-cache',
    },
    {
      httpEquiv: 'Pragma',
      content: 'no-cache',
    },
    {
      httpEquiv: 'Expires',
      content: '0',
    },
  ],
  hash:true,
  routes: [
    // { path:'/privacy', component:'@/pages/login_page/PrivacyManager'},
    { path:'/login', component:'@/pages/login_page' },
    // { path:'/safety', component:'@/pages/login_page/SafeManager'},
    // // 代理商路由匹配
    // {
    //     path:'/agentMonitor',
    //     component:'@/pages/agent_manager/index',
    //     routes:[
    //         { path:'/agentMonitor', component:'@/pages/agent_manager/AgentMonitor'},
    //         { path:'/agentMonitor/entry', component:'@/pages/agent_manager/SceneEntry'},
    //         { path:'/agentMonitor/project', component:'@/pages/agent_manager/ProjectList'},
    //         { path:'/agentMonitor/alarm', component:'@/pages/agent_manager/AlarmManager'}
    //     ]
    // },
    {
        path:'/' || '/energy',
        component:'@/pages/index',
        routes:[
            // 电气监控模块
            {
                path:'/energy/ele_monitor',
                routes:[
                    { path:'/energy/ele_monitor/height_voltage_monitor', component:'@/pages/ele_monitor/HighVolManager'},
                    { path:'/energy/ele_monitor/ele_son_monitor', component:'@/pages/ele_monitor/EleMonitorManager'},
                    // { path:'/energy/ele_monitor/ele_line_monitor', component:'@/pages/elemonitor_manager/line_monitor/LineMonitor'},
                    { path:'/energy/ele_monitor/mach_monitor_menu', component:'@/pages/ele_monitor/TerminalMach'},
                    // { path:'/energy/ele_monitor/useless_manage', component:'@/pages/efficiency_manager/UseLessManager'},
                    { path:'/energy/ele_monitor/demand_manage', component:'@/pages/ele_monitor/DemandManager'}
                ]
            },
            // 能源成本模块
            {
                path:'/energy/energy_manage',
                routes:[
                    { path:'/energy/energy_manage', component:'@/pages/energy_manage/EnergyManager'},
                    { path:'/energy/energy_manage/ele_cost', component:'@/pages/energy_manage/EleCostManager'},
                    { path:'/energy/energy_manage/water_cost', component:'@/pages/energy_manage/WaterCostManager'},
                    { path:'/energy/energy_manage/gas_cost', component:'@/pages/energy_manage/WaterCostManager'},
                    { path:'/energy/energy_manage/cost_trend', component:'@/pages/energy_manage/CostTrendManager'},
                    { path:'/energy/energy_manage/cost_analyz', component:'@/pages/energy_manage/CostAnalysis'},
                    { path:'/energy/energy_manage/cost_calendar', component:'@/pages/energy_manage/CostCalendarManager'},
                    // { path:'/energy/energy_manage/combust_cost', component:'@/pages/energy_manager/WaterCostManager'},
                    { path:'/energy/energy_manage/ele_statement', component:'@/pages/energy_manage/StatementManager'}
                ]
            },
            // 能源效率模块
            {
                path:'/energy/energy_eff',
                routes:[
                    { path:'/energy/energy_eff', component:'@/pages/efficiency_manage/EfficiencyManager'},
                    // { path:'/energy/energy_eff/eff_trend', component:'@/pages/efficiency_manager/EfficiencyTrendManager'},
                    { path:'/energy/energy_eff/energy_eff_quota', component:'@/pages/efficiency_manage/EnergyQuotaManager'},
                    { path:'/energy/energy_eff/energy_eff_ratio', component:'@/pages/efficiency_manage/OutputManager'},
                    { path:'/energy/energy_eff/energy_eff_person', component:'@/pages/efficiency_manage/OutputManager'},
                    { path:'/energy/energy_eff/energy_eff_area', component:'@/pages/efficiency_manage/OutputManager'},
                    { path:'/energy/energy_eff/energy_eff_output', component:'@/pages/efficiency_manage/OutputManager'}
                    // { path:'/energy/energy_eff/useless_manage', component:'@/pages/efficiency_manager/UseLessManager'},
                    // { path:'/energy/energy_eff/demand_manage', component:'@/pages/efficiency_manager/DemandManager'},
                    // { path:'/energy/energy_eff/energy_eff_power', component:'@/pages/coal_manager/EffRank'},
                    // { path:'/energy/energy_eff/coal_trend', component:'@/pages/coal_manager/CoalTrend'},
                    // { path:'/energy/energy_eff/coal_esay_managy', component:'@/pages/coal_manager/CoalManager'},
                ]
            },
    //         // 碳指标模块
    //         {
    //             path:'/energy/coal_manage',
    //             routes:[
    //                 { path:'/energy/coal_manage/coal_manage_deal', component:'@/pages/coal_manager/CoalManager'},
    //                 { path:'/energy/coal_manage/coal_manage_trend', component:'@/pages/coal_manager/CoalTrend' }
    //             ]
    //         },
    //         // 电能质量模块
    //         {
    //             path:'/energy/ele_quality',
    //             routes:[
    //                 { path:'/energy/ele_quality', component:'@/pages/elequality_manager/EleQualityIndex'},
    //                 { path:'/energy/ele_quality/harmonic', component:'@/pages/elequality_manager/EleHarmonicManager'},
    //                 { path:'/energy/ele_quality/mutually', component:'@/pages/elequality_manager/EleBalanceManager'}
    //             ]
    //         },
            // 告警监控模块
            {
                path:'/energy/alarm_manage',
                routes:[
                    { path:'/energy/alarm_manage', component:'@/pages/alarm_manage/AlarmMonitor'},
                    { path:'/energy/alarm_manage/alarm_execute', component:'@/pages/alarm_manage/AlarmList'},
                    { path:'/energy/alarm_manage/alarm_trend', component:'@/pages/alarm_manage/AlarmTrend'},
                    // { path:'/energy/alarm_manage/ele_alarm', component:'@/pages/alarm_page/EleAlarmManager/index'},
                    // { path:'/energy/alarm_manage/over_alarm', component:'@/pages/alarm_page/OverAlarmManager/index'},
                    // { path:'/energy/alarm_manage/link_alarm', component:'@/pages/alarm_page/LinkAlarmManager/index'},
                    { path:'/energy/alarm_manage/alarm_setting', component:'@/pages/alarm_manage/AlarmSetting'}
                ]
            },
            // 统计报表
            {
                path:'/energy/stat_report',
                routes:[
                    { path:'/energy/stat_report/meter_report', component:'@/pages/stat_report/MeterReport'},
                    { path:'/energy/stat_report/cost_report', component:'@/pages/stat_report/CostReport'},
                    { path:'/energy/stat_report/same_report', component:'@/pages/stat_report/SameReport'},
                    { path:'/energy/stat_report/adjoin_report', component:'@/pages/stat_report/SameReport'},
                    { path:'/energy/stat_report/analyse_report', component:'@/pages/stat_report/analysis_report'}
                ]
            },
    //         // 分析中心模块
    //         {
    //             path:'/energy/analyze_manage',
    //             routes:[
    //                 { path:'/energy/analyze_manage/mach_run_eff', component:'@/pages/analyze_page/AnalyzeMachManager'},
    //                 { path:'/energy/analyze_manage/energy_phase', component:'@/pages/efficiency_manager/EnergyPhaseManager'},
    //                 { path:'/energy/analyze_manage/mach_eff', component:'@/pages/efficiency_manager/EfficiencyMach'},
    //                 { path:'/energy/analyze_manage/saveSpace', component:'@/pages/analyze_page/SaveSpaceManager'},
    //                 { path:'/energy/analyze_manage/analyzeReport', component:'@/pages/analyze_page/AnalyzeReportManager'},
    //                 { path:'/energy/analyze_manage/lineloss_eff', component:'@/pages/efficiency_manager/LineLossManager'},
    //                 { path:'/energy/analyze_manage/compare_model', component:'@/pages/analyze_page/CompareModelManager'}
    //             ]
    //         },
    //         // 统计报表模块
    //         {
    //             path:'/energy/stat_report',
    //             routes:[
    //                 { path:'/energy/stat_report/energy_code_report', component:'@/pages/energy_manager/MeterReportManager'},
    //                 { path:'/energy/stat_report/energy_cost_report', component:'@/pages/energy_manager/CostReportManager'},
    //                 { path:'/energy/stat_report/extreme', component:'@/pages/stat_report/ExtremeReport/ExtremeReport'},
    //                 { path:'/energy/stat_report/ele_report', component:'@/pages/stat_report/EleReport/index'},
    //                 { path:'/energy/stat_report/sameReport', component:'@/pages/stat_report/SameRateReport/index'},
    //                 { path:'/energy/stat_report/adjoinReport', component:'@/pages/stat_report/AdjoinRateReport/index'},
    //                 { path:'/energy/stat_report/timereport', component:'@/pages/stat_report/TimeEnergyReport/index'},
    //             ]
    //         },
            // 信息管理
            {
                path:'/energy/info_manage',
                routes:[
                    { path:'/energy/info_manage/field_manage', component:'@/pages/info_manage/FieldManager'},
                    { path:'/energy/info_manage/free_manage', component:'@/pages/info_manage/BillingManager'},
                    { path:'/energy/info_manage/fee_rate', component:'@/pages/info_manage/FeeRateManager'},
                    { path:'/energy/info_manage/incoming_line', component:'@/pages/info_manage/IncomingManager'},
                    // { path:'/energy/info_manage/meter_mach', component:'@/pages/info_manage/MeterMachManager'},
                    { path:'/energy/info_manage/quota_manage', component:'@/pages/info_manage/QuotaManager'},
                    { path:'/energy/info_manage/manual_input', component:'@/pages/info_manage/ManualManager'},
                    // { path:'/energy/info_manage_menu/free_manage', component:'@/pages/info_manager/BillingManager'},
                    // { path:'/energy/info_manage_menu/field_manage', component:'@/pages/info_manager/FieldManager'},
                ]
            },
            // 系统配置
            {
                path:'/energy/system_config',
                routes:[
                    // { path:'/energy/system_config/role_manage', component:'@/pages/system_config/RoleManager'},
                    // { path:'/energy/system_config/menu_manage', component:'@/pages/system_config/MenuManager'},
                    { path:'/energy/system_config/user_manage', component:'@/pages/system_config/AdminManager'},
                    // { path:'/energy/system_config_menu/company_manage', component:'@/pages/system_config/CompanyManager'},
                    // { path:'/energy/system_config/field_manage', component:'@/pages/system_config/FieldManager'},
                    { path:'/energy/system_config/system_log', component:'@/pages/system_config/SystemLog'},
                    { path:'/energy/system_config/update_password', component:'@/pages/system_config/UpdatePassword'}
                ]
            },
    //         // 监控主页及各个监控子站
    //         {
    //             path:'/energy/global_monitor',
    //             routes:[
    //                 { path:'/energy/global_monitor', component:'@/pages/page_index/GlobalMonitor' },
    //                 // { path:'/energy/global_monitor', component:'@/pages/page_index/xiao_e_index' },
    //                 { path:'/energy/global_monitor/power_room', component:'@/pages/page_index/powerroom_station' },
    //                 { path:'/energy/global_monitor/air_scene', component:'@/pages/page_index/air_station' },
    //                 { path:'/energy/global_monitor/ai_gas_station', component:'@/pages/page_index/smart_gas_station'},
    //                 { path:'/energy/global_monitor/water_ai_ctrl', component:'@/pages/page_index/smart_water_station'},
    //                 { path:'/energy/global_monitor/test_station', component:'@/pages/page_index/CeshiStation'}
    //             ]
    //         },
            {
                path:'/energy/global_monitor',
                component:'@/pages/page_index'
            },
            {
                path:'/energy',
                component:'@/pages/page_index'
            },
            {
                path:'/',
                component:'@/pages/page_index'
            }
        ]
    }
  ],
  fastRefresh: {},
});
