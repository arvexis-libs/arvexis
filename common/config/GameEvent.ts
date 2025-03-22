/*
 * @Author: dgflash
 * @Date: 2021-11-23 15:28:39
 * @LastEditors: dgflash
 * @LastEditTime: 2022-01-26 16:42:00
 */

/**  */
export enum GameEvent {
    /**  */
    GameServerConnected = "GameServerConnected",
    /**  */
    LoginSuccess = "LoginSuccess",
    LoginFailed = "LoginFailed",

    MAIN_VIDEO_END = "MAIN_VIDEO_END",      //
    MAIN_VIDEO_START = "MAIN_VIDEO_START",  //
    MAIN_VIDEO_SKIP = "MAIN_VIDEO_SKIP",    //

    TaskListRefresh="TaskListRefresh",
    //SDK
    OnUserLoginSuccess="OnUserLoginSuccess",

    ShowPhone="ShowPhone",
    ShowPhoneChange="ShowPhoneChange",
    PhoneDataChange="PhoneDataChange",
    RefreshHomeView="RefreshHomeView",
    PlayerLevelChange="PlayerLevelChange",
    //  
    CharacterAttributeAdd="CharacterAttributeAdd",
    CharacterAttributeChange="CharacterAttributeChange",
    CharacterAttributeChange1="CharacterAttributeChange1",
    OnMoneyAdd="OnMoneyAdd",  // 
    OnMoneyChange="OnMoneyChange", // 
    OnCarportInfoChange="OnCarportInfoChange", // 
    OnInvestInfoChange="OnInvestInfoChange", // 
    OnInvestMakeProfit="OnInvestMakeProfit", //  
    OnSkinChange="OnSkinChange", //  
    OnTaskAwayDone="OnTaskAwayDone", //
    OnShowHomeTip="OnShowHomeTip", //
    ViewOpen="ViewOpen", // 
    ViewClose="ViewClose", // 
    PlayerInfoChange="PlayerInfoChange", // 
    OnGuideShow="OnGuideShow", // 

    UpQuQianLevel="UpQuQianLevel",//10
    TouZiLevel="TouZiLevel",//
    MiShuLevel="MiShuLevel",//
    OnlineClock="OnlineClock",// 
    StoryPlayOver = "StoryPlayOver",   //
    ChoiceOver = "ChoiceOver",   //

    OnQuQianRateChange="OnQuQianRateChange",
    OnQuQianLevelChange="OnQuQianLevelChange",
    OnAutoGetMoney="OnAutoGetMoney",
    OnATMChange="OnATMChange",
    OnWealthChanged="OnWealthChanged",
    OnAutoGiveGiftChange="OnAutoGiveGiftChange",
    OnPhotoPieceChange="OnPhotoPieceChange",
    OnUnlockPhoto="OnUnlockPhoto",
    OnShowNoticeTips="OnShowNoticeTips",
    OnPlayHomeVideo="OnPlayHomeVideo",
    OnCloseLvup="OnCloseLvup",

    /**  */
    OnShowTalk = "OnShowTalk", // 
    OnUpdateTalk = "OnUpdateTalk", // 
    OnTalkReadyClose = "OnTalkReadyClose", // 
    OnTalkReOpen = "OnTalkReOpen",// 

    OnClickMapBuild = "OnClickMapBuild",
    GoMapPlot = "GoMapPlot",

    OnItemValueChanged = "OnItemValueChanged",

    /** id, preremove */
    LayerRemovePre = "LayerRemovePre",
    LayerRemove = "LayerRemove",
    StopUIMuisc = "StopUIMuisc",

    RoleSelectItemClick = "RoleSelectItemClick",
    /**  id level1 */
    UnlockConstellation = "UnlockConstellation",
    /**  roleId */
    ConstellationLevelUp = "ConstellationLevelUp",
    /**  roleId */
    ConstellationStarUp = "ConstellationStarUp",
    /**  starId */
    ConstellationNotice = "ConstellationNotice",

    UIStoryLineRefresh = "UIStoryLineRefresh",

    UIDateSwitchRoleEvent = "UIDateSwitchRoleEvent",

    OpenUICount="OpenUICount",
    /** */
    UIStoryStartEvent = "UIStoryStartEvent",

    /** */
    UIStoryKilledEvent = "UIStoryKilledEvent",

    /** */
    UIStoryCompleteEvent = "UIStoryCompleteEvent",

    /** */
    UITransformToCloseEvent = "UITransformToCloseEvent",

    OnReturnUIHome = "OnReturnUIHome",
    
///////////////////////////////////////////////
    OnHeroineDataChange = "OnHeroineDataChange",//
    OnHeroineNameChange = "OnHeroineNameChange",//
    OnHeroineHeadIconChange = "OnHeroineHeadIconChange",//
    onHeroineLevelUp = "onHeroineLevelUp",//


}