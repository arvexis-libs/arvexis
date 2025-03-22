/*
 * @Date: 2021-08-12 09:33:37
 * @LastEditors: dgflash
 * @LastEditTime: 2022-11-11 17:41:53
 */

import { LayerType, UIConfig } from "../../../../../extensions/oops-plugin-framework/assets/core/gui/layer/LayerManager";

/**  */
export enum UIID {
    /**  */
    Loading = 1,
    /**  */
    Alert,
    /**  */
    Confirm,
    /** DEMO */
    Demo,
    /**  */
    Demo_Role_Info,

    /**  */
    MainVideo,
    /**  */
    Phone,
    /**  */
    Fitness,
    /**  */
    PhoneMessage,

    //
    UIMakeMoneyRootViewComp,
    //
    UILoveHistoryRootView,

    /**  */
    UICarport,
    /**  */
    UIInvest,
    /**  */
    UISecretary,
    /**  */
    UIShare,
    /**  */
    UISettings,

    //
    UIFreeMoney,
    //
    UICommonGetAwardView,
    //ATM
    UIQuQianATM,
    //
    UIQuQianDouble,
    //
    UIQuQianAutoClick,
    //
    UIKadianTask,
    
    /**  */
    UIHome,
    /**  */
    UILevelUp,
    /**  */
    UILover,
    /**  */
    UITapUp,
    /**  */
    UIOtherPlayer,

    //
    UIPhoto,

    /**  */
    UIPlayerInfo,
    UIPlayerInfoTips,

    //
    UIOffLine,
    //
    UITips,
    
    //
    UITTReward,
    UIBigCityMap,

    TalkView,
    CurrencyBar,
    UIRoleSelect,

    //UI
    UIPiano=38,
    UIPianoPlay,
    UIPianoOver,
    UIStoryReward,
    UIStoryLine,
    UIStoryLineSwitch,
    UIStoryLineSelect,
    UIStoryMask,

    /**  */
    UIConstellationNew,
    UIConstellationMain,
    UIConstellation,

    /** */
    UIDate,
    UIDateSelect,
    UIConstellationUnlockDialog,
    UIConstellationUnlockTips,
    UIConstellationNotice,

    UIChoice,
    UITransformAni,
    //
    UIGuide,
    UIConstellationTips,
    UIConstellationLevelUp,
    UIConstellationStarUp,

    UIGetItem,
    UIOpenFunction,

    UITransformWait,
    UINecklace,//

    UIItemTips,
    UIMain,//
    UIEffect_0=66,//ui
    UIEffect_1=67,
    UIEffect_2=68,
    UITextReward,//+
}

/**  */
export var UIConfigData: { [key: number]: UIConfig } = {
    [UIID.Loading]: { layer: LayerType.UI, prefab: "Prefab/UILoading", bundle: "UILoading" },
    [UIID.Alert]: { layer: LayerType.Dialog, prefab: "common/prefab/alert", mask: true },
    [UIID.Confirm]: { layer: LayerType.Dialog, prefab: "common/prefab/confirm", mask: true },
    [UIID.Demo]: { layer: LayerType.UI, prefab: "gui/prefab/demo" },
    [UIID.Demo_Role_Info]: { layer: LayerType.UI, prefab: "gui/prefab/role_info" },
    [UIID.MainVideo]: { layer: LayerType.Video, prefab: "Prefab/UIMainVideo", bundle:"UIMainVideo" },
    [UIID.UIHome]: { layer: LayerType.UI, prefab: "Prefab/UIHome", bundle:"UIHome" },
    [UIID.UILevelUp]: { layer: LayerType.UI, prefab: "Prefab/UILevelUp", bundle:"UILevelUp" },
    [UIID.UITTReward]: { layer: LayerType.UI, prefab: "Prefab/UISideBarReward", bundle: "SDK"},
    [UIID.UIBigCityMap]: { layer: LayerType.UI, prefab: "Prefab/UIBigCityMap", bundle: "UIBigCityMap"},
    [UIID.TalkView]: { layer: LayerType.UI, prefab: "Prefab/UITalkView", bundle: "UITalkView"},
    [UIID.CurrencyBar]: { layer: LayerType.UI, prefab: "Prefab/CurrencyBar", bundle: "CommonBar"},
    [UIID.UIRoleSelect]:{ layer: LayerType.UI, prefab: "Prefab/UIRoleSelect", bundle: "UIRoleSelect"},
    [UIID.Phone]: { layer: LayerType.UI, prefab: "Prefab/UIPhone", bundle: "UIPhone"},
    [UIID.UIPiano]: { layer: LayerType.UI, prefab: "Prefab/UIPiano", bundle: "UIPiano"},
    [UIID.UIPianoPlay]: { layer: LayerType.UI, prefab: "Prefab/UIPianoPlay", bundle: "UIPianoPlay"},
    [UIID.UIPianoOver]: { layer: LayerType.UI, prefab: "Prefab/UIPianoOver", bundle: "UIPianoOver"},
    
    [UIID.PhoneMessage]: { layer: LayerType.System, prefab: "Prefab/UIPhoneMessage", bundle:"UIPhone" },
    [UIID.UIStoryReward]: { layer: LayerType.UI, prefab: "Prefab/UIStoryReward", bundle: "UIStoryReward", mask: true },
    [UIID.UIKadianTask]:{ layer: LayerType.UI, prefab: "Prefab/UIKaDianTask", bundle: "UIKaDianTask", mask: true },
    [UIID.UIConstellationNew]: { layer: LayerType.PopUp, prefab: "Prefab/UIConstellationNew", bundle: "UIConstellation" },
    [UIID.UIConstellationMain]: { layer: LayerType.UI, prefab: "Prefab/UIConstellationMain", bundle: "UIConstellation" },
    [UIID.UIConstellation]: { layer: LayerType.UI, prefab: "Prefab/UIConstellation", bundle: "UIConstellation" },
    [UIID.UIStoryLine]:{ layer: LayerType.UI, prefab: "Prefab/UIStoryLine", bundle: "UIStoryLine", mask: true },
    [UIID.UIStoryLineSwitch]:{ layer: LayerType.UI, prefab: "Prefab/UIStoryLineSwitch", bundle: "UIStoryLine"},
    [UIID.UIStoryLineSelect]:{ layer: LayerType.UI, prefab: "Prefab/UIStoryLineSelect", bundle: "UIStoryLine"},
    [UIID.UIDate]:{ layer: LayerType.UI, prefab: "Prefab/UIDate", bundle: "UIDate" },
    [UIID.UIDateSelect]:{ layer: LayerType.UI, prefab: "Prefab/UIDateSelect", bundle: "UIDate" },
    [UIID.UIConstellationUnlockDialog]:{ layer: LayerType.UI, prefab: "Prefab/UIConstellationUnlockDialog", bundle: "UIConstellation" },
    [UIID.UIConstellationUnlockTips]:{ layer: LayerType.UI, prefab: "Prefab/UIConstellationUnlockTips", bundle: "UIConstellation" },
    [UIID.UIChoice]:{ layer: LayerType.UI, prefab: "Prefab/UIChoice", bundle: "UIChoice", mask: true  },
    [UIID.UIGuide]: { layer: LayerType.Guide, prefab: "Prefab/UIGuide", bundle: "UIGuide"},
    [UIID.UIConstellationNotice]:{ layer: LayerType.System, prefab: "Prefab/UIConstellationNotice", bundle: "UIConstellation" },
    [UIID.UITransformAni]:{ layer: LayerType.PopUp, prefab: "Prefab/UITransformAni", bundle: "UITransformAni", mask: true  },
    [UIID.UIConstellationTips]:{ layer: LayerType.UI, prefab: "Prefab/UIConstellationTips", bundle: "UIConstellation" },
    [UIID.UIConstellationLevelUp]:{ layer: LayerType.UI, prefab: "Prefab/UIConstellationLevelUp", bundle: "UIConstellation" },
    [UIID.UIConstellationStarUp]:{ layer: LayerType.UI, prefab: "Prefab/UIConstellationStarUp", bundle: "UIConstellation" },
    
    [UIID.UIGetItem]:{ layer: LayerType.UI, prefab: "Prefab/UIGetItem", bundle: "UIGetItem" },
    [UIID.UIOpenFunction]:{ layer: LayerType.UI, prefab: "Prefab/UIOpenFunction", bundle: "OpenFunction" },
    
    [UIID.UIStoryMask]: { layer: LayerType.UI, prefab: "Prefab/UIStoryMask", bundle: "UIStoryReward", mask: true },
    [UIID.UITransformWait]:{ layer: LayerType.PopUp, prefab: "Prefab/UITransformAniWait", bundle: "UITransformAni"},
    [UIID.UINecklace]: { layer: LayerType.UI, prefab: "Prefab/UINecklace", bundle:"UIGuide" },
    [UIID.UIItemTips]: { layer: LayerType.PopUp, prefab: "Prefab/UIItemTips", bundle:"UIItemTips" },
    [UIID.UIMain]: { layer: LayerType.UI, prefab: "Prefab/UIMain", bundle:"UIMain" },
    [UIID.UIEffect_0]: { layer: LayerType.PopUp, prefab: "Prefab/UIEffect_0", bundle:"UIMain" },
    [UIID.UIEffect_1]: { layer: LayerType.PopUp, prefab: "Prefab/UIEffect_1", bundle:"UIMain" },
    [UIID.UIEffect_2]: { layer: LayerType.PopUp, prefab: "Prefab/UIEffect_2", bundle:"UIMain" },
    [UIID.UITextReward]: { layer: LayerType.UI, prefab: "Prefab/UITextReward", bundle:"UIMain" },

}