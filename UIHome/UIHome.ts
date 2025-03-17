import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director, EventHandle
} from "cc";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { smc } from "db://assets/script/game/common/ecs/SingletonModuleComp";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { TapSystem } from "db://assets/script/game/gameplay/Manager/TapSystem";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import { TaskSystem } from "db://assets/script/game/gameplay/Manager/TaskSystem";
import { FunctionOpenSystem } from "db://assets/script/game/gameplay/Manager/FunctionOpenSystem";
import { Utility } from "db://assets/script/game/gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { UITimerManager } from "../gameplay/Manager/UITimerManager";
import ConfigManager from "../manager/Config/ConfigManager";
import { TimeUtility } from "../gameplay/Utility/TimeUtility";
import { TaskType } from "../gameplay/GameDataModel/TaskType";
import { GameHelper } from "../gameplay/GameTool/GameHelper";
import { TbInteraction, TbVideo, TrInteraction, TrUIGuide } from "../schema/schema";
import { UITaskItem } from "./UITaskItem";
import { UIHomeButtonBtn } from "./UIHomeButtonBtn";
import { UIMainVideoComp } from "../UIMainVideo/UIMainVideoComp";
import { FunctionOpenType } from "../gameplay/GameDataModel/FunctionOpenType";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";
import { RichText } from "cc";
import { SdkManager } from "../../modules/sdk/SdkManager";
import { Camera } from "cc";
import { Animation } from "cc";
import { Sprite } from "cc";
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { Color } from "cc";
import { HeartSystem } from "../gameplay/Manager/HeartSystem";
import { color } from "cc";
import { math } from "cc";
import { changeSpriteImage } from "../common/UIExTool";
import { Transform } from "stream";
import { TaskBarCom } from "./TaskBarCom";
import { StorySystem } from "../gameplay/Manager/StorySystem";
import { ItemEnum } from "../gameplay/GameDataModel/GameEnum";
import { tips } from "../common/prompt/TipsManager";
import { GuideManager } from "../UIGuide/GuideManager";
import { Size } from "cc";
import { DEBUG } from "cc/env";
import { LayerType } from "db://oops-framework/core/gui/layer/LayerManager";
import { EditBox } from "cc";
import { GameDot } from "../gameplay/Manager/GameDot";
import { game } from "cc";
import { sys } from "cc";
import { Notification } from "../common/UINotification/Notification";
import { UINotification } from "../common/UINotification/UINotification";
import { EventHandler } from "cc";
const { ccclass, property } = _decorator;

/**  */
@ccclass('UIHome')
export class UIHome extends CCComp {

    // 
    @property(Node)
    m_Root: Node = null!;
    @property(Sprite)
    headLvFillBg: Sprite = null!;
    @property(Sprite)
    headLvFill: Sprite = null!;
    @property(Node)
    headLvFilleff: Node = null!;
    @property(Node)
    headLvFillLock: Node = null!;

    @property(Node)
    TapChangedView: Node = null!;

    // 
    @property(Button)
    openLvUpBtn: Button = null!;
    @property(Button)
    m_Button_PlayVideo: Button = null!;
    @property(Button)
    m_Button_Tap: Button = null!;
    @property(Button)
    sideBarBtn: Button = null!;
    @property(Button)
    PlayerHead: Button = null!;
    @property(Button)
    OpenTapBtn: Button = null!;
    @property(Node)
    goLvShow: Node = null!;
    @property(Node)
    goLvShowEffect: Node = null!;
    @property(Button)
    btnShow1: Button = null!;
    @property(Sprite)
    PlayerIcon: Sprite = null!;

    @property(Sprite)
    imgCostIcon: Sprite = null!;

    @property(Sprite)
    imgCost02: Sprite = null!;
    
    // 
    @property(Label)
    m_Text_money: Label = null!;
    @property(Label)
    m_Text_Level: Label = null!;
    @property(Label)
    m_Text_CurExp: Label = null!;

    @property(Label)
    expNum: Label = null!;

    @property(Node)
    Tips_Tap: Node = null!;
    @property(Prefab)
    Tips_Eff1: Prefab = null!; // 
    @property(Node)
    playerInfo1: Node = null!;
    @property(Node)
    playerInfo2: Node = null!;
    @property(Node)
    playerInfo3: Node = null!;
    @property(Node)
    Effect_ExpSlider: Node = null!;
    @property(Node)
    Tips_GuideTap: Node = null!;
    @property(Node)
    m_Transform_ExpSlider: Node = null!
    // 
    @property(Node)
    m_Transform_ScrollItem: Node = null!;
    @property(Node)
    LevelUpAwards: Node[] = [];

    @property(Node)
    buttomBtnsParent: Node = null!;
    @property(Sprite)
    btnInters: Sprite[] = [];

    @property(Button)
    ArrBtnGuide: Button[] = []!;
    @property(Node)
    ArrNodeGuideTakeUp: Node[] = []!;//
    @property(Node)
    ArrHideNode: Node[] = []!;//
    @property(Node)
    BtnGotoCity: Node = null!;
    // 
    // @property(Sprite)
    // PlayerHead: Sprite = null!;

    @property(Sprite)
    main_bar1: Sprite = null!;

    // 
    @property(UIHomeButtonBtn)
    mHomeBtn1: UIHomeButtonBtn = null!;

    @property(TaskBarCom)
    mTaskBar: TaskBarCom = null!;

    @property(Node)
    TaskContext: Node = null!;

    // 
    @property(Label)
    m_interaction_label: Label = null!;
    @property(Sprite)
    m_interaction_icon: Sprite = null!;
    @property(Label)
    m_interaction_label1: Label = null!;
    @property(Sprite)
    m_interaction_icon1: Sprite = null!;
    @property(Button)
    m_interaction_close: Button = null!;

    @property(Node)
    goStartPos = null!;
    @property(Node)
    goEndPosUp = null!;
    @property(Node)
    goEndPosMid = null!;

    @property(Sprite)
    lvUpBg0: Sprite = null!;

    @property(Sprite)
    lvUpBg1: Sprite = null!;

    @property(Node)
    goEffectParentUp = null!;

    @property(Node)
    goEffectParentMidParent = null!;

    @property(Animation)
    animLvUp = null!;

    @property(EditBox)
    mEditoBox: EditBox = null!
    @property(Node)
    mGM: Node = null!
    @property(Node)
    ChangeRoleIcon: Node = null!
    @property(Node)
    phoneMessageNode: Node = null!;

    private videoId: number = 0;
    private expSliderSize: Vec2 = Vec2.ZERO;
    private TapEffPool: NodePool = new NodePool();
    private TapNumPool: NodePool = new NodePool();
    private second: number = 0;
    private taskList: UITaskItem[] = [];
    private levelLoveguide: boolean = false;
    private isClickmHomeBtn: boolean = false;

    public mMakeMoney: Node = null!
    public mLove: Node = null!
    public mTask: Node = null!
    public PlayStart: boolean = false;

    private m_videoCfgId: number = 0;
    private heartSoundId: number = -1;
    private isPlayHeartAni : boolean = false;   //

    //
    private mPlayingActionVideoId: number = 0;
    mainCamera: any;
    onAdded(args: any) {
        this.m_videoCfgId = args;
        return true;
    }

    onLoad() {
        GameData.InitGuideData();

        this.expSliderSize = new Vec2(this.m_Transform_ExpSlider.getComponent(UITransform)?.contentSize.x, this.m_Transform_ExpSlider.getComponent(UITransform)?.contentSize.y);

        this.InitButtonEvent();
        this.InitEvents();
        this.InitPools();
        this.checkOfflineAward();
        if (GameData.GetGuideStep()>=1000) {
            this.FirstRefresh();
        }else{
            //
            let player1 = ConfigManager.tables.TbPlayer.get(1);
            let player2 = ConfigManager.tables.TbPlayer.get(2);

            const player1InitXinWu = ConfigManager.tables.TbConst.get("InitTokenNum1")?.Int || 0;
            const player2InitXinWu = ConfigManager.tables.TbConst.get("InitTokenNum2")?.Int || 0;
            GameData.updateCurrency(player1?.ItemId!, player1InitXinWu);
            GameData.updateCurrency(player2?.ItemId!, player2InitXinWu);

        }
        this.RefreshInteractionUI();
        this.refreshWhenStoryRefreshEvent();

        // 

        this.m_Text_Level.color = Color.WHITE;

        this.on(GameEvent.PhoneDataChange, this.updatePhoneMessageState, this);
    }

    async start() {
        if (GameData.GetGuideStep()<1015) {
            this.BtnGotoCity.active = false;
        }
        
        if (GameData.IsGuideFinished(1020)) {
            UIMusicManager.inst.playUIMusic(UIID.UIHome, 1001);
        }
        this.ChangeRoleIcon.active = GameData.GetGuideStep()>=2030
        this.tryShowUiNecklace();
        this.ShowGuide();
        this.SetHeadIcon();
        this.checkCanShowSideBarReward();
        this.updatePhoneMessageState();


        // StorySystem.Instance.Play(20002);
        // oops.gui.openAsync(UIID.UIStoryReward, {
        //     awardType: [10000002,10000002],
        //     awardValue: [1,1]
        // });
    }

    //#region 
    ShowGuide() {
        let bigMap = oops.gui.get(UIID.UIBigCityMap)
        if (bigMap) {
            return;
        }

        GuideManager.Instance.TryShowGuide(1000, null!, () => {}, () => {
            this.tryShowUiNecklace();
        }, this.HideOrDisplayUINode, this.ArrHideNode);
        GuideManager.Instance.TryShowGuide(1020, this.ArrBtnGuide, () => {}, () => {
        }, this.HideOrDisplayUINode, this.ArrHideNode,this.ArrNodeGuideTakeUp);

        GuideManager.Instance.TryShowGuide(1080, this.ArrBtnGuide, () => { }, () => {
            GuideManager.Instance.TryShowGuide(1090, null!, () => { }, () => {
                GuideManager.Instance.TryShowGuide(1101, this.ArrBtnGuide, () => {}, () => {}, ()=>{}, [],this.ArrNodeGuideTakeUp);
                
            });
        },()=>{},[],this.ArrNodeGuideTakeUp);

        GuideManager.Instance.TryShowGuide(1120, this.ArrBtnGuide, () => {}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
        GuideManager.Instance.TryShowGuide(1140, this.ArrBtnGuide, () => {}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
        GuideManager.Instance.TryShowGuide(1220, this.ArrBtnGuide, () => {}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
        GuideManager.Instance.TryShowGuide(2010, null!, () => {}, () => {
            GuideManager.Instance.TryShowGuide(2015, this.ArrBtnGuide, () => {}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
        });
        
        GuideManager.Instance.TryShowGuide(2040, this.ArrBtnGuide, () => {
            this.ChangeRoleIcon.active = true;
         }, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);

        if (GameData.IsGuideFinished(1050)) {
            this.HideOrDisplayUINode(true, this.ArrHideNode)
        }
    }

    tryShowUiNecklace(){
        if (GameData.GetGuideStep()>=1000 && GameData.GetGuideStep()<1010) {
            StorySystem.Instance.showMask();
            this.HideOrDisplayUINode(false,this.ArrHideNode)
            oops.gui.openAsync(UIID.UINecklace).then(()=>{
                StorySystem.Instance.hideMask();
            })
            
        }
    }

    

    ///Ui
    HideOrDisplayUINode(display: boolean, arrHideNode: Node[]) {
        for (let i = 0; i < arrHideNode.length; i++) {
            const element = arrHideNode[i];
            element.active = display;
        }
    }
    private async checkCanShowSideBarReward() {
        let canShow = await SdkManager.inst.canShowSideBar();
        if (canShow) {
            this.sideBarBtn.node.active = true;
        }
        else {
            this.sideBarBtn.node.active = false;
        }
    }

    protected onEnable(): void {
        this.PlayStart = true;
    }

    private TryToLevelUp() {
        //console.error("");
        if (PlayerSystem.Instance.CurExp >= PlayerSystem.Instance.CurNeedExp) {
            PlayerSystem.Instance.TryLevelUp();
            this.TaskInfoRefresh();
            this.LoveDesRefresh();
        }
        PlayerSystem.Instance.ClearCacheHeartValue();
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    private interval: number = 0; //
    private hasInterFlag: boolean = false; //

    protected update(dt: number): void {

        if (this.hasInterFlag) {
            this.interval += dt;
            if (this.interval >= HeartSystem.Instance.GetClickedInterval()) {
                this.interval = 0;
                this.hasInterFlag = false;
            }
        }
        else {
            this.interval = 0;
        }

        //
        if(this.mPlayingActionVideoId == 0){
            if (this.second >= 5) {
                this.Tips_Tap.active = true;
                this.second = 0;
            }
            else {
                    this.second += dt;
            }
    
        }
        
        if (this.goLvShow.active || GuideManager.Instance.IsInFinger()) {
            this.Tips_Tap.active = false;
            this.second = 0;
        }
    }

    onDestroy() {
        this.off(GameEvent.ShowPhone);
        this.off(GameEvent.RefreshHomeView);
        this.off(GameEvent.OnWealthChanged);
        this.off(GameEvent.OnSkinChange);
        this.off(GameEvent.OnShowHomeTip);
        this.off(GameEvent.OnGuideShow);
        this.off(GameEvent.PlayerLevelChange);
        this.off(GameEvent.TaskListRefresh);
        this.off(GameEvent.OnlineClock);
        this.off(GameEvent.OnCloseLvup);
        this.off(GameEvent.LayerRemove);
        this.off(GameEvent.MAIN_VIDEO_END);
        this.off(GameEvent.OnPlayHomeVideo);
        this.off(GameEvent.RoleSelectItemClick);
        this.off(GameEvent.OnItemValueChanged);
        this.off(GameEvent.ConstellationStarUp);
        this.off(GameEvent.ConstellationLevelUp);
        this.off(GameEvent.UIStoryLineRefresh);
        this.off(GameEvent.UIStoryKilledEvent);
        this.off(GameEvent.UIStoryCompleteEvent);
        this.off(GameEvent.OnReturnUIHome);
    }

    private InitPools() {
        for (let i = 0; i < 10; i++) {
            let eff = instantiate(this.Tips_Eff1);
            this.TapEffPool.put(eff);
        }

        for (let i = 0; i < 10; i++) {
            let tr = instantiate(this.m_Transform_ScrollItem);
            this.TapNumPool.put(tr);
        }
    }
    private OnGuideShow() {
        this.Tips_Tap.active = false;
    }

    private InitButtonEvent() {
        this.mGM.active = false;
        //this.PlayerHead.node.on(Button.EventType.CLICK, this.OnClickHead, this);
        this.openLvUpBtn.node.on(Button.EventType.CLICK, this.onClickOpenLvUp, this);
    }

    private InitEvents() {
        this.on(GameEvent.ShowPhone, this.onHandler, this);
        this.on(GameEvent.RefreshHomeView, this.onHandler, this);
        this.on(GameEvent.OnWealthChanged, this.onHandler, this);
        this.on(GameEvent.OnSkinChange, this.onHandler, this);
        this.on(GameEvent.OnShowHomeTip, this.onHandler, this);
        this.on(GameEvent.OnGuideShow, this.onHandler, this);
        this.on(GameEvent.PlayerLevelChange, this.onHandler, this);
        this.on(GameEvent.TaskListRefresh, this.onHandler, this);
        this.on(GameEvent.OnlineClock, this.onHandler, this);
        this.on(GameEvent.OnPlayHomeVideo, this.onHandler, this);
        this.on(GameEvent.MAIN_VIDEO_END, this.onHandler, this);

        this.on(GameEvent.OnCloseLvup, this.onHandler, this);

        this.on(GameEvent.LayerRemove, this.onHandler, this);
        this.on(GameEvent.RoleSelectItemClick, this.onHandler, this);
        this.on(GameEvent.OnItemValueChanged, this.onHandler, this);
        this.on(GameEvent.ConstellationStarUp, this.onHandler, this);
        this.on(GameEvent.ConstellationLevelUp, this.onHandler, this);
        this.on(GameEvent.UIStoryLineRefresh, this.onHandler, this);
        this.on(GameEvent.UIStoryKilledEvent, this.onHandler, this);
        this.on(GameEvent.UIStoryCompleteEvent, this.onHandler, this);
        this.on(GameEvent.OnReturnUIHome, this.onHandler, this);
    }

    private onHandler(event: string, args: any): void {
        switch (event) {
            case GameEvent.ShowPhone:
                this._showPhone();
                break;
            case GameEvent.RefreshHomeView:
                this.Refresh();
                break;
            case GameEvent.OnWealthChanged:
                this.OnWealthChanged(args);
                break;
            case GameEvent.OnSkinChange:
                this.OnSkinChange();
                this.refreshWhenStoryRefreshEvent();
                break;
            case GameEvent.OnShowHomeTip:
                this.OnShowHomeTip();
                break;
            case GameEvent.OnGuideShow:
                this.OnGuideShow();
                this.ShowGuide();
                break;
            case GameEvent.PlayerLevelChange:
                this.HideALLButtonByGuide();
                this.RefBtnInters();
                break;
            case GameEvent.TaskListRefresh:
                this.RefreshTaskList(args);
                break;
            case GameEvent.OnlineClock:
                this.RefreshClock();
                break;
            case GameEvent.OnPlayHomeVideo:
                this.PlayIdleVideo();
                break;
            case GameEvent.MAIN_VIDEO_END:
                this.PlayIdleVideo();
                break;
            case GameEvent.OnCloseLvup:
                this.OnCloseLvup();
                this.refreshWhenStoryRefreshEvent();
                break;
            case GameEvent.LayerRemove:
                if (this.isHomeFront()) {
                    this.Refresh();
                    this.TryToLevelUp();
                    this.scheduleOnce(() => {
                        GuideManager.Instance.TryShowGuide(1120, this.ArrBtnGuide!, null!, null!, ()=>{},[],this.ArrNodeGuideTakeUp)
                    }, 0.05);
                    if (GameData.IsGuideFinished(1020)) {
                        UIMusicManager.inst.playUIMusic(UIID.UIHome, 1001);
                    }
                    GuideManager.Instance.TryShowGuide(2040, this.ArrBtnGuide, () => {
                        this.ChangeRoleIcon.active = true;
                     }, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
                }
                break;
            case GameEvent.RoleSelectItemClick:
                this.changeCurRole(args);
                break;
            case GameEvent.OnItemValueChanged:
                this.Refresh();
            case GameEvent.ConstellationStarUp:
                this.Refresh();
                break;
            case GameEvent.ConstellationLevelUp:
                this.Refresh();
                break;
            case GameEvent.UIStoryKilledEvent:
            case GameEvent.UIStoryLineRefresh:
                this.refreshWhenStoryRefreshEvent();
                // idle 
                this.PlayIdleVideo();
                break;
            case GameEvent.UIStoryCompleteEvent:
                if (args.cfgId === 50009) {
                    this.BtnGotoCity.active = true;
                    this.ShowGuide();
                }
                break;
            case GameEvent.OnReturnUIHome:
                this.refreshWhenStoryRefreshEvent();
                break;
        }
    }

    private refreshWhenStoryRefreshEvent() {
        
        this.TaskInfoRefresh();
        const taskCfg = PlayerSystem.Instance.GetTbTask();
        const giftIds = taskCfg.GiftGroup;
        this.dialogTid = giftIds.length > 0 ? giftIds[0] : 0;
        if (this.dialogTid > 0 && (!StorySystem.Instance.IsLookComplete(this.dialogTid))) {
            this.goLvShow.active = true;
            this.btnShow1.node.active = true;
            let anim = this.btnShow1.getComponent(Animation);
            if (anim != null && anim?.defaultClip != null) {
                //
                let clipName = anim.defaultClip.name;
                let state = anim.getState(clipName);
                if(state != null){
                    state.time = 0;
                    state.sample();
                }
                this.goLvShowEffect.active = false;
            }
            if(this.heartSoundId <= 0){
                Utility.PlayAudioOnId(2052).then(a=>this.heartSoundId=a);
            }

        }
        else {
            this.goLvShow.active = false;
            if(this.heartSoundId > 0)
            {
                oops.audio.stopEffectById(this.heartSoundId);
                this.heartSoundId = 0;
            }
        }

    }
    /**
     * UIHome 
     */
    private isHomeFront(): boolean {
        let cnt1 = oops.gui.getUICount(LayerType.UI);
        let cnt2 = oops.gui.getUICount(LayerType.PopUp);
        let cnt3 = oops.gui.getUICount(LayerType.Dialog);

        return cnt1 == 1 && cnt2 == 0 && cnt3 == 0;
    }

    private changeCurRole(roleId: number) {
        //this.curRole = roleId;
        //this.Refresh();

        let playerId = roleId;

        if (GameData.PlayerData.GlobalData.CurPlayId !== playerId) {
            //TODO 
            GameData.PlayerData.GlobalData.CurPlayId = playerId;
            oops.message.dispatchEvent(GameEvent.RefreshHomeView);
            oops.message.dispatchEvent(GameEvent.OnSkinChange);
        }

        console.log("", roleId);
    }

    private RefreshTaskList(type: TaskType) {
        //,
        if (type == TaskType.Video) {
            this.videoId = PlayerSystem.Instance.GetPlayVideoId();
            let needShow = this.videoId > 0;
            this.m_Button_PlayVideo.node.active = needShow;
        }
        else if (type == TaskType.PhoneMessage) {

        }
    }
    private _showPhone() {
        // oops.gui.openAsync(UIID.Phone);
        //oops.gui.openAsync(UIID.TalkView);
    }
    private Button_MakeMoney(event: EventTouch, data: any) {
        oops.gui.openAsync(UIID.UIMakeMoneyRootViewComp);
    }

    private Button_Love(event: EventTouch, data: any) {
        // if (this.IsFunctionOpen(FunctionOpenType.Love)) {// todo Love
        //     oops.gui.openAsync(UIID.UILoveHistoryRootView);
        // }
    }

    private OnClickStoryLine() {
        oops.gui.openAsync(UIID.UIStoryLine);
    }

    OnClickBtnBack()
    {
        oops.gui.open(UIID.UIMain);
        oops.gui.remove(UIID.UIHome);
    }

    // 
    private updatePhoneMessageState() {
        this.phoneMessageNode.active = GameData.IsPhoneHasNoReaded();
    }

    private OnClickPhone(event: EventTouch, data: any) {
        // console.error("OnClickPhone");
        // if (this.IsFunctionOpen(FunctionOpenType.Phone)) {
        // this._showPhone();
        // }
        // oops.gui.openAsync(UIID.TalkView, {Id:200001});
        GuideManager.Instance.FinishGuide();
        oops.gui.openAsync(UIID.Phone);
    }

    private OnClickPlayPlot() {
        let id = this.mEditoBox.string;
        let nId = parseInt(id) || 0;
        StorySystem.Instance.Play(nId);
    }

    private OnClickClothes(event: EventTouch, data: any) {
        if(sys.isBrowser){
            GameData.updateCurrency(ItemEnum.YuPei, 1000);
            GameData.updateCurrency(ItemEnum.Biao, 1000);
            
        }
        tips.confirm("", () => {
        }, "", () => {
        }, "", false);
    }

    private OnClickXieZhen(event: EventTouch, data: any) {
        tips.confirm("", () => {
        }, "", () => {
        }, "", false);
    }

    private OnClickWorldTree(event: EventTouch, data: any) {
        tips.confirm("", () => {
        }, "", () => {
        }, "", false);
    }

    private OnClickCity() {
        /*GameHelper.TransformLayer("HeiPingZhuanChang", 0.33, () => {
            oops.gui.openAsync(UIID.UIBigCityMap).then(() => {
                GuideManager.Instance.FinishGuide();
            });
        });*/
        GameHelper.TransformWait(()=>{
            oops.gui.openAsync(UIID.UIBigCityMap).then(() => {
                GuideManager.Instance.FinishGuide();
                oops.message.dispatchEvent(GameEvent.UITransformToCloseEvent);
            });
        });
        if(this.heartSoundId > 0)
        {
            oops.audio.stopEffectById(this.heartSoundId);
            this.heartSoundId = 0;
        }
    }

    //
    private OnClickDate() {
        oops.gui.openAsync(UIID.UIDate);
    }

    IsFunctionOpen(id: FunctionOpenType): boolean {
        return GameHelper.IsFunctionOpen(id, true);
    }

    // 
    private OnClickLover(event: EventTouch, data: any) {
        if (this.IsFunctionOpen(FunctionOpenType.Skin)) {
            oops.gui.openAsync(UIID.UILover);
        }
    }

    // 
    private OnClickMakeMoney() {
        GameData.isActive = true;
        oops.gui.openAsync(UIID.UIMakeMoneyRootViewComp);
    }

    // 
    private OnClickTapUp(event: EventTouch, data: any) {
        this.isClickmHomeBtn = true;
        let curGuideState = this.levelLoveguide;
        this.HideALLButtonByGuide();

        oops.gui.openAsync(UIID.UITapUp, curGuideState);
    }

    private RefreshInteractionUI() {
        this.RefBtnInters();
        let actionId = PlayerSystem.Instance.GetInteractionType();
        let actionCfgId = HeartSystem.Instance.getCurActionCfgId(actionId);
        let data: TrInteraction = ConfigManager.tables.TbInteraction.get(actionCfgId)!;
        this.m_interaction_label.string = this.m_interaction_label1.string = data.Name;
        this.RefreshInteractionIcon(data.Icon);
    }

    private async RefreshInteractionIcon(url: string) {
        let spF = await Utility.loadImage(url, "UIHome");
        if (spF) {
            this.m_interaction_icon.spriteFrame = this.m_interaction_icon1.spriteFrame = spF;
            this.m_interaction_icon.sizeMode = this.m_interaction_icon1.sizeMode = Sprite.SizeMode.RAW; // 
        }
    }
    private OnWealthChanged(money: number) {
        //this.m_Text_money.string = Utility.FormatBigNumber(money);
    }

    private OnClickFitness(event: EventTouch, data: any) {
        console.error("OnClickFitness");
        if (this.IsFunctionOpen(FunctionOpenType.Fitness)) {
            oops.gui.openAsync(UIID.Fitness);
        }
    }

    private OnClickPhoto(event: EventTouch, data: any) {
        //if (this.IsFunctionOpen(FunctionOpenType.BigMap))
        {
            oops.gui.openAsync(UIID.UIBigCityMap);
        }

    }
    private OnClickAutoBtn() {
        oops.gui.openAsync(UIID.UIQuQianAutoClick);
    }
    private OnClickMoreBtn() {
        //this.morePanel.active = (!this.morePanel.active);
    }
    private OnClickSettingsBtn() {
        oops.gui.open(UIID.UISettings);
    }

    private OnClickFreeBtn() {
        oops.gui.openAsync(UIID.UIFreeMoney);
    }

    private onClickTTRuKou(event: EventTouch, data: any) {
        oops.gui.openAsync(UIID.UITTReward);
    }

    private OnClickNewPlayer() {
        //UIOtherPlayerContext.Instance.Open();
    }

    private OnClickHead() {

        this.mGM.active = sys.isBrowser;
        oops.gui.open(UIID.UIRoleSelect);
        GuideManager.Instance.FinishGuide();
    }

    private onClickOpenLvUp() {
        oops.gui.open(UIID.UILevelUp, true);
    }

    private OnClickShareBtn() {
        oops.gui.open(UIID.UIShare);
    }

    private OnClickNewRole() {
        //UINewRoleContext.Instance.Open();
        oops.gui.openAsync(UIID.UIOtherPlayer);
    }
    private OnShowHomeTip() {
        var playCfg = PlayerSystem.Instance.GetSuitRoleCfg()!;
        this.second = 0;
        this.Tips_Tap.active = false;
        let addValue = HeartSystem.Instance.GetHeartValue(PlayerSystem.Instance.GetInteractionType());
        let reduceMoney = HeartSystem.Instance.GetCostValue(PlayerSystem.Instance.GetInteractionType());
        addValue = GameData.culateCurrencyWithBouns(playCfg.ExpId, addValue);

        this.showTapNumPool("+" + addValue, "-" + reduceMoney);
        this.PlayerInfoRefresh();
        PlayerSystem.Instance.TryLevelUp();
    }

    //
    private OnClickTap(event: EventTouch, customEventData: string) {
        GuideManager.Instance.FinishGuide();
        this.ShowGuide();
        if (this.hasInterFlag)
            return;
        this.hasInterFlag = true;

        this.second = 0;
        this.Tips_Tap.active = false;
        let log: string = "";
        
        if ((PlayerSystem.Instance.CurExp >= PlayerSystem.Instance.CurNeedExp) &&
            !TaskSystem.Instance.CheckCompleteAllTask()) {
            log = "";
            TipsNoticeUtil.PlayNotice(log);

            //:
            if(TaskSystem.Instance.HasTask((TaskType.Interaction)) && !TaskSystem.Instance.GetTaskComplete(TaskType.Interaction)){

                if (!PlayerSystem.Instance.EnoughCost()) {
                    oops.gui.open(UIID.UIGetItem);
                    log = "";
                    TipsNoticeUtil.PlayNotice(log);
                    return;
                }
        
                PlayerSystem.Instance.OnClickTap();
                let reduceMoney = HeartSystem.Instance.GetCostValue(PlayerSystem.Instance.GetInteractionType());
                this.showTapNumPool("", "-" + reduceMoney);
                
                var playCfg = PlayerSystem.Instance.GetSuitRoleCfg()!;
                GameData.updateCurrency(playCfg.ItemId, -reduceMoney);
                this.TryToLevelUp();

                Utility.PlayAudio(2007);
                this.PlayInterVideo();
                this.PlayerInfoRefresh();
            }
            return;
        }

        if (!PlayerSystem.Instance.EnoughCost()) {
            oops.gui.open(UIID.UIGetItem);
            log = "";
            TipsNoticeUtil.PlayNotice(log);
            return;
        }

        if (PlayerSystem.Instance.CurLv > PlayerSystem.Instance.MaxLv % 1000) {
            TipsNoticeUtil.PlayNotice("");
            return;
        }

        var playCfg = PlayerSystem.Instance.GetSuitRoleCfg()!;
        this.showTapEff(Utility.GetMouseLocalPosition(event));
        this.Tips_Tap.active = false;

        let addValue = HeartSystem.Instance.GetHeartValue(PlayerSystem.Instance.GetInteractionType());
        let reduceMoney = HeartSystem.Instance.GetCostValue(PlayerSystem.Instance.GetInteractionType());

        let showAddValue = GameData.culateCurrencyWithBouns(playCfg.ExpId, addValue);
        this.showTapNumPool("+" + showAddValue, "-" + reduceMoney);
        //GameData.PlayerData.GlobalData.SubtractWealth(TapSystem.Instance.TapMoney);
        //PlayerSystem.Instance.TotalExp += addValue;
        SdkManager.inst.event("sense_get_map", { userid: PlayerSystem.Instance.CurPlayId, sense_get_map:Math.ceil(addValue), sense_get_map_where: 2 });
        SdkManager.inst.event("inter_click", { userid: PlayerSystem.Instance.CurPlayId, inter_click: PlayerSystem.Instance.GetInteractionType(), inter_click_value: 1 });

        PlayerSystem.Instance.OnClickTap();
        GameData.updateCurrency(playCfg.ExpId, addValue);
        GameData.updateCurrency(playCfg.ItemId, -reduceMoney);

        this.TryToLevelUp();

        Utility.PlayAudio(2007);
        this.PlayInterVideo();
        this.PlayerInfoRefresh();
    }

    public m_videoCfg: TbVideo | undefined = null!;
    private OnSkinChange() {
        const cfgId = PlayerSystem.Instance.HomeVideoId;
        if (this.m_videoCfgId != cfgId) {
            this.m_videoCfgId = cfgId;
            //HomeView.Instance.Delete();
            this.PlayIdleVideo();
        }
    }
    private RefreshClock(): void {
        let show = false;
        const onlineConfigs = ConfigManager.tables.TbOnline.getDataList();
        const globalData = GameData.PlayerData.GlobalData;

        // for (const cfgData of onlineConfigs) {
        //     if (!(cfgData.Id in globalData.OnlineState)) continue;

        //     const state = globalData.OnlineState.get(cfgData.Id);
        //     const remainingTime = cfgData.Time * 60 - globalData.OnlineTime;

        //     if (!state && remainingTime > 0) {
        //         this.onlineTime.string = this.formatTime(remainingTime);
        //         show = true;
        //         break;
        //     }
        // }

        // this.onlineTime.node.active = show;
        // this.onlineTimeBg.active = show;
    }

    private formatTime(totalSeconds: number): string {
        if (totalSeconds <= 0) {
            return "00:00";
        }
        const hours = Math.floor(totalSeconds / 3600);
        const remainingSeconds = totalSeconds % 3600;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        return hours > 0
            ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(minutes)}:${pad(seconds)}`;
    }

    public checkOfflineAward(): void {
        return;
        if (UITimerManager.Instance.IsStartRecordOfflineTime) {
            return;
        }

        // 
        const getAwardMinTime = ConfigManager.tables.TbConst.get("OfflineMinAwardTime")?.Int!;

        const globalData = GameData.PlayerData.GlobalData;

        // 
        if (globalData.OfflineTimer <= 0 ||
            !globalData.PlayedKeyNodeList.has(1101)) {
            UITimerManager.Instance.startRecordOfflineTime();
            return;
        }

        // 
        const currentTime = TimeUtility.GetTimeStamp() - GameData.PlayerData.GlobalData.OfflineTimer;
        const offset = currentTime - globalData.OfflineTimer;

        // 
        if (offset < getAwardMinTime) {
            UITimerManager.Instance.startRecordOfflineTime();
            return;
        }

        // 
        oops.gui.open(UIID.UIOffLine);
    }


    public Refresh() {
        this.second = 0;
        this.Tips_Tap.active = false;

        this.VideoBtnRefresh();
        this.PlayerInfoRefresh();
        this.LoveDesRefresh();
        this.TaskInfoRefresh();
        this.BottomBtnUpdate();
        this.SetHeadIcon();
        this.RefreshInteractionUI();
        // Notification.setNeedRefresh(Notification.Type.LvReward);
        // Notification.setNeedRefresh(Notification.Type.Day7);
    }

    public FirstRefresh() {
        this.Refresh();
        this.TryPlayLevel1Video();
        this.HideALLButtonByGuide();
    }

    private TryPlayLevel1Video() {
        if (PlayerSystem.Instance.CurLv === 1 && this.videoId > 0) {
            this.OnClickPlayVideo();
        } else {
            this.PlayIdleVideo();
        }
    }

    private OnClickPlayVideo() {
        PlayerSystem.Instance.PlayVideo(this.videoId, this.PlayIdleVideo);
        this.VideoBtnRefresh();
        this.LoveDesRefresh();
    }

    private PlayIdleVideo() {
        // 

        if(StorySystem.Instance.isPlaying){
            console.log("");
            return;
        }
        this.mPlayingActionVideoId = 0;
        let num = PlayerSystem.Instance.HomeVideoId;
        UIMainVideoComp.getInstance().playUrl(num, true);
    }

    private PlayInterVideo() {
        let id = PlayerSystem.Instance.GetInteractionType();
        let actionCfgId = HeartSystem.Instance.getCurActionCfgId(id);//actionCfgId

        let cfg = ConfigManager.tables.TbInteraction.get(actionCfgId);
        if (cfg == null)
            return;

        let randomIndex = Math.floor(Math.random() * cfg.VideoIdList.length);
        console.log(randomIndex);
        let videoCfg = ConfigManager.tables.TbVideo.get(cfg.VideoIdList[randomIndex]);
        if (videoCfg == null)
            return;

        if (this.mPlayingActionVideoId == videoCfg.Id && this.mPlayingActionVideoId != 0)
            return;

        this.mPlayingActionVideoId = videoCfg.Id;

        UIMainVideoComp.getInstance().playUrl(videoCfg.Id, false, undefined, true);
    }

    private VideoBtnRefresh() {
        this.m_Button_PlayVideo.node.active = false;
        if (PlayerSystem.Instance.CurLv === 1) {
            //this.videoId = PlayerSystem.Instance.GetPlayVideoId();
            this.videoId = 0;
            const needShow = this.videoId > 0;
            this.m_Button_PlayVideo.node.active = needShow;
        }
    }

    private BottomBtnUpdate() {
        return;

        this.mHomeBtn1.onRefresh();
        // this.mHomeBtn2.onRefresh();
        // this.mHomeBtn3.onRefresh();
        // this.mHomeBtn4.onRefresh();
        // this.mHomeBtn5.onRefresh();
    }

    private TaskInfoRefresh() {
        this.mTaskBar.refreshTasks();
    }

    private LoveDesRefresh() {
        //this.m_Button_Love_lock.active = !FunctionOpenSystem.Instance.IsOpen(FunctionOpenType.Love);

        // const { num, isMax } = this.GetLoveLvNum();
        // const showLoveDes = num > 0 && !isMax &&
        //     !(this.videoId > 0 && !GameData.PlayerData.GlobalData.PlayedKeyNodeList.has(this.videoId));

        //this.LoveDes.active = showLoveDes;
        //this.txtLoveDes.string = `${num}<color=#fe5293></color>`;
    }

    public onClickCostItem(){
        var costCfg = PlayerSystem.Instance.GetSuitRoleCfg();
        if (costCfg != null) {
            var itemCfg = ConfigManager.tables.TbItem.get(costCfg.ItemId);
            Utility.OpenItemTips(itemCfg?.Id!,this.imgCostIcon.node);
        }
    }

    private PlayerInfoRefresh() {

        const playerId = PlayerSystem.Instance.CurPlayId;

        var costCfg = PlayerSystem.Instance.GetSuitRoleCfg();
        if (costCfg == null) {

        }
        else {
            this.m_Text_money.string = GameData.getCurrency(costCfg?.ItemId).toString();
            var itemCfg = ConfigManager.tables.TbItem.get(costCfg.ItemId);

            oops.res.loadAsync<SpriteFrame>("CommonRes", itemCfg?.Icon + "/spriteFrame").then((sp) => {
                if (this.isValid) {
                    this.imgCostIcon.spriteFrame = sp;
                    this.imgCostIcon.sizeMode = Sprite.SizeMode.RAW;
                }
            });
        }

        this.m_Text_Level.string = PlayerSystem.Instance.IsMaxLv ? "" : `Lv.${PlayerSystem.Instance.CurLv}`;


        this.RefExpSlider();
        // 
        this.lastLv = PlayerSystem.Instance.CurLv;
        this.CalcLv();
        let rightMaxLv = ConfigManager.tables.TbConst.get("RoleMaxLevel")?.Int || 999;
        if (this.rightLv == rightMaxLv && this.curKeyNode == 0) {
            this.expNum.string = `${Math.floor(1 * 100)}`;
            this.headLvFill.fillRange = 0;
            this.headLvFilleff.setPosition(0, -100);
            this.headLvFillLock.active = false;
        }
        else {
            let v2 = (PlayerSystem.Instance.CurLv - this.leftLv) / (this.rightLv - this.leftLv);
            v2 = Math.min(1, v2);
            this.expNum.string = `${Math.floor(v2 * 100)}`;
            this.headLvFill.fillRange = v2;
            this.headLvFilleff.setPosition(0, -100 + (1 - v2) * 180);
            this.headLvFillLock.active = true;
        }

        this.headLvFillLock.active = false;

        // 
        for (let i = 0; i < this.LevelUpAwards.length; i++) {
            this.LevelUpAwards[i].active = false;
        }
        const cfg1 = PlayerSystem.Instance.GetTbTask();
        if (!cfg1 || cfg1.AwardId.length == 0) {
            return;
        }
        for (let i = 0; i < cfg1.AwardId.length; i++) {
            const id = cfg1.AwardId[i];
            this.LevelUpAwards[id - 1].active = true;
        }


        // 
        var cfg = ConfigManager.tables.TbPlayer.get(PlayerSystem.Instance.CurPlayId);
        if (cfg == null)
            return;

        let trLv = PlayerSystem.Instance.CurLv;
        let trCfg = PlayerSystem.Instance.GetTbTask(trLv);
        if (trCfg.KeyNode > 0 || cfg.Id == PlayerSystem.Instance.MaxLv) {
            this.rightLv = trCfg.Id;
        } else {
            while (trCfg.KeyNode == 0 && cfg.Id < PlayerSystem.Instance.MaxLv % 1000) {
                trLv++;
                if (trLv > PlayerSystem.Instance.MaxLv % 1000) {
                    break;
                }
                trCfg = PlayerSystem.Instance.GetTbTask(trLv);
            }
            this.rightLv = trCfg.Id;
        }
        let cfg2 = ConfigManager.tables.TbKeyNode.get(trCfg.KeyNode)!;
        if (cfg2 == null)
        {
            trCfg = PlayerSystem.Instance.GetTbTask(--trLv);
            while (trCfg.KeyNode == 0) {
                trLv--;
                trCfg = PlayerSystem.Instance.GetTbTask(trLv);
            }
            cfg2 = ConfigManager.tables.TbKeyNode.get(trCfg.KeyNode)!;
        }
        const imgPath = ConfigManager.tables.TbAtlas.get(cfg2.ImagePath)!;
        this.loadAsync<SpriteFrame>("Sprites", imgPath.Path + "/spriteFrame",).then((sp) => {
            if (this.isValid) {
                this.headLvFillBg.spriteFrame = sp;
            }
        });
    }

    private SetHeadIcon() {
        const roleCfg = ConfigManager.tables.TbPlayer.get(PlayerSystem.Instance.CurPlayId);
        oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/" + roleCfg?.IconPath + "/spriteFrame").then((sp) => {
            if (this.isValid) {
                this.PlayerIcon.spriteFrame = sp;
            }
        });

    }

    private RefExpSlider() {
        const needExp = PlayerSystem.Instance.CurNeedExp;
        const curExp = PlayerSystem.Instance.CurExp > needExp ? needExp : PlayerSystem.Instance.CurExp;
        this.m_Text_CurExp.string = `${curExp}/${needExp}`;
        let v = Math.min(1, curExp / needExp);
        if (PlayerSystem.Instance.IsMaxLv) {
            v = 1;
            this.m_Text_CurExp.string = `${needExp}/${needExp}`;
        }

        this.main_bar1.fillRange = v;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }



    private leftLv: number = 0;
    private rightLv: number = 0;
    private lastLv: number = 0;
    private curKeyNode: number = 0;
    private CalcLv(): void {
        let MAX_LV = ConfigManager.tables.TbConst.get("RoleMaxLevel")?.Int || 999;
        const cfg = PlayerSystem.Instance.GetTbTask(this.lastLv);
        // left
        if (cfg.Id == 1) {
            this.leftLv = 1;
        } else {
            let tlLv = this.lastLv;
            let tlCfg = PlayerSystem.Instance.GetTbTask(tlLv);
            while (tlCfg.KeyNode == 0 && tlLv > 1) {
                tlLv--;
                tlCfg = PlayerSystem.Instance.GetTbTask(tlLv);
            }
            this.leftLv = tlLv;
        }

        // right
        let trLv = this.lastLv + 1;
        trLv = Math.min(MAX_LV, trLv);
        let trCfg = PlayerSystem.Instance.GetTbTask(trLv);
        if (trCfg.KeyNode > 0 || cfg.Id == PlayerSystem.Instance.MaxLv) {
            this.rightLv = trCfg.Id;
        } else {
            while (trCfg.KeyNode == 0 && cfg.Id < PlayerSystem.Instance.MaxLv) {
                trLv++;
                if (trLv > MAX_LV) {
                    break;
                }
                trCfg = PlayerSystem.Instance.GetTbTask(trLv);
                if (trCfg == null) {
                    let a = 0;
                }
            }
            this.rightLv = trCfg.Id;
        }
        this.curKeyNode = trCfg.KeyNode;

        if (PlayerSystem.Instance.CurPlayId > 1) {
            this.rightLv -= PlayerSystem.Instance.CurPlayId * 1000;
        }
    }


    private GetLoveLvNum(): { num: number; isMax: boolean } {
        let rightLv = 0;
        let MAXLV = ConfigManager.tables.TbConst.get("RoleMaxLevel")?.Int || 999;
        let trLv = PlayerSystem.Instance.CurLv;
        const cfg = PlayerSystem.Instance.GetTbTask(trLv);
        let trCfg = PlayerSystem.Instance.GetTbTask(trLv);

        if (trCfg.KeyNode > 0 || cfg.Id === PlayerSystem.Instance.MaxLv) {
            rightLv = trCfg.Id;
        } else {
            while (trCfg.KeyNode === 0 && cfg.Id < PlayerSystem.Instance.MaxLv) {
                trLv++;
                if (trLv > MAXLV) {
                    break;
                }
                trCfg = PlayerSystem.Instance.GetTbTask(trLv);
            }
            rightLv = trCfg.Id;
        }

        const isMax = trCfg.KeyNode === 0 || trLv >= MAXLV;

        if (PlayerSystem.Instance.CurPlayId > 1) {
            rightLv -= PlayerSystem.Instance.CurPlayId * 1000;
        }

        return {
            num: rightLv - PlayerSystem.Instance.CurLv,
            isMax
        };
    }

    public showTapNumPool(st1: string, st2: string): void {
        // 
        const tans = this.TapNumPool.get();
        if (!tans) return;

        tans.active = true;
        // 
        const txtExp = tans.getChildByName('txtExp')?.getComponent(Label);
        const todo2 = tans.getChildByName('todo2');
        const txtExpAdd = todo2?.getChildByName('txtExpAdd')?.getComponent(Label);
        const todo3 = tans.getChildByName('todo3');
        const txtMoney = todo3?.getChildByName('txtMoney')?.getComponent(Label);

        var costCfg = PlayerSystem.Instance.GetSuitRoleCfg();
        if (costCfg == null) {

        }
        else {
            var itemCfg = ConfigManager.tables.TbItem.get(costCfg.ItemId);

            oops.res.loadAsync<SpriteFrame>("CommonRes", itemCfg?.Icon + "/spriteFrame").then((sp) => {
                if (this.isValid) {
                    var imgCost02 = tans.getChildByPath('todo3/Sprite-001/imgCost02')?.getComponent(Sprite);
                    if (imgCost02 != null) {
                        imgCost02.spriteFrame = sp;
                        // imgCost02.sizeMode = Sprite.SizeMode.RAW;
                    }

                }
            });
        }

        // 
        if (txtExp){
            txtExp.string = st1;
            txtExp.node.active = st1 != "";
        } 
        if (txtMoney) txtMoney.string = st2;
        console.log(GameData.GetConstellationHeartAddByRoleId(PlayerSystem.Instance.CurPlayId));
        if (txtExpAdd) txtExpAdd.string = '+' + (GameData.GetConstellationHeartAddByRoleId(PlayerSystem.Instance.CurPlayId) * 100).toFixed(0) + '%';

        if(todo2){
            todo2.active = st1 != "";
        }
        if(todo3){
            todo3.setPosition(st1 == "" ? new Vec3(0, 84, 0): new Vec3(118, 84, 0));
        }
        // 
        tans.setParent(this.m_Transform_ScrollItem.parent);
        tans.setPosition(Vec3.ZERO);
        tans.setScale(Vec3.ONE);
        tans.active = true;

        // 
        tween(tans)
            .to(0.3, { scale: new Vec3(1.2, 1.2, 1.2) })
            .to(0.2, { scale: Vec3.ONE })
            .start();

        tween(tans)
            .to(1, { position: new Vec3(0, 50, 0) })
            .call(() => {
                tans.active = false;
                this.TapNumPool.put(tans);
            })
            .start();
    }

    private showTapEff(pos: Vec3) {
        const obj = this.TapEffPool.get()!;
        if (!obj) return;

        obj.setParent(this.node);
        obj.setWorldPosition(pos);
        obj.active = false;
        obj.active = true;

        const anim = obj.getComponentInChildren(Animation)!;
        anim?.stop();
        anim?.play();

        tween(obj).delay(0.75).call(() => {
            if (obj) {
                obj.active = false;
                this.TapEffPool.put(obj);
            }
        }).start();
    }

    private checkCanAddExp(): boolean {
        var log = "";
        if (GameData.PlayerData.GlobalData.money < TapSystem.Instance.TapMoney) {
            log = "";
            if (!GameData.isOpenFreeMoney) {
                GameData.isOpenFreeMoney = true;
                oops.gui.openAsync(UIID.UIFreeMoney);
            }
            return false;
        }

        if (PlayerSystem.Instance.CurExp >= PlayerSystem.Instance.CurNeedExp) {
            PlayerSystem.Instance.TryLevelUp();
            return false;
        }

        return true;
    }
    /***********************************************************************************/
    private HideALLButtonByGuide() {
        return;

        // this.m_Button_MakeMoney.node.active = this.IsSatisfyCondition(5);
        // this.m_Button_Love.node.active = this.IsSatisfyCondition(2);

        // this.freeBtn.node.active = this.IsSatisfyCondition(3);
        // this.aotuBtn.node.active = this.IsSatisfyCondition(4);

        // this.mHomeBtn1.node.active = this.IsSatisfyCondition(6);
        // this.mHomeBtn2.node.active = this.IsSatisfyCondition(7);
        // this.mHomeBtn3.node.active = this.IsSatisfyCondition(1);
        // this.mHomeBtn4.node.active = this.IsSatisfyCondition(8);
        // this.mHomeBtn5.node.active = this.IsSatisfyCondition(9);
        // this.onlineBtn.node.active = this.IsSatisfyCondition(10);
        // this.lvrewardBtn.node.active = this.IsSatisfyCondition(11);
        // const oldActive = this.Tips_GuideTap.active;
        // this.Tips_GuideTap.active = !this.mHomeBtn3.node.active;
        // const newActive = this.Tips_GuideTap.active;
        // if (this.mHomeBtn3guide.active == true && oldActive == newActive) {
        //     //
        //     //4 
        //     if (this.isClickmHomeBtn || PlayerSystem.Instance.CurLv >= 4) {
        //         this.levelLoveguide = false;
        //         this.mHomeBtn3guide.active = this.levelLoveguide;
        //     }
        // }
        // else {
        //     this.levelLoveguide = !oldActive == newActive;
        //     this.mHomeBtn3guide.active = this.levelLoveguide;
        // }
    }

    public IsSatisfyCondition(index: number) {
        const guide = ConfigManager.tables.TbUIGuide.get(index)!;

        if (guide.LevelExp[1] > 0) {
            if (PlayerSystem.Instance.CurLv > guide.LevelExp[0]) {
                return true;
            }
            if (PlayerSystem.Instance.CurExp < guide.LevelExp[1]) {
                return false;
            }
        }
        else {
            if (PlayerSystem.Instance.CurLv < guide.LevelExp[0]) {
                return false;
            }
        }
        return true;
    }

    //  
    public RefBtnInters() {
        for (let index = 0; index < this.btnInters.length; index++) {
            const element = this.btnInters[index];
            let [unlock, lv] = HeartSystem.Instance.IsInterUnlocked(index + 1);

            if (unlock)
                element.color = color(255, 255, 255, 255);
            else
                element.color = color(255, 255, 255, 153);


            // 
            const txtLockDes = element.node.getChildByName('txtLockDes')?.getComponent(Label);
            if (txtLockDes != null) {
                txtLockDes.node.active = !unlock;
                txtLockDes.string = `${lv}`;
            }

            let notiType = element.node.getComponent(UINotification);
            if(notiType!=null)
                Notification.SetNeedRefresh(notiType.GetTypeKey());
            
        }


    }


    //#region 
    private async OnBtnShow1Clicked() {
        if(this.isPlayHeartAni){
            return;
        }
        var anim = this.btnShow1.node.getComponent(Animation);
        anim?.play();
        await this.delay(1000);
        if(this.heartSoundId > 0)
        {
            oops.audio.stopEffectById(this.heartSoundId);
            this.heartSoundId = 0;
            oops.audio.stopAll();
        }
        this.btnShow1.node.active = false;
        StorySystem.Instance.Play(this.dialogTid,()=>{
            this.ShowGuide();
        });
        // oops.gui.openAsync(UIID.TalkView, this.dialogTid);
    }

    // 
    private OnClickOpenTap() {
        GuideManager.Instance.FinishGuide();
        this.OpenTapBtn.node.active = false;
        this.TapChangedView.active = true;
        this.buttomBtnsParent.active = false;

        var anim = this.TapChangedView.getComponent(Animation);
        anim?.play();
        this.RefBtnInters();
        GuideManager.Instance.TryShowGuide(1102, this.ArrBtnGuide, () => {}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
    }


    ///
    private OnClickTapChanged(event: EventTouch, data: any) {
        GuideManager.Instance.FinishGuide();
        let id = parseInt(data);

        //
        let [isUnlock, lv, Name] = HeartSystem.Instance.IsInterUnlocked(id);
        if (!isUnlock) {
            let audio = ConfigManager.tables.TbAudio.get(2016)!;
            oops.audio.playEffect(audio?.Resource, "Audios");
            TipsNoticeUtil.PlayNotice(Name + "");
            return;
        }

        this.OpenTapBtn.node.active = true;
        this.TapChangedView.active = false;
        this.buttomBtnsParent.active = true;
        PlayerSystem.Instance.SetInteractionType(id);
        this.RefreshInteractionUI();

        if (GameData.GetGuideStep()>=1120) {
            this.PlayInterVideo();
        }
    }


    private OnClickInteractioClose(event: EventTouch, data: any) {
        this.OpenTapBtn.node.active = true;
        this.TapChangedView.active = false;

        this.buttomBtnsParent.active = true;
    }

    private async RefEffect() {

        if (this.goEndPosMid != null && this.goEndPosUp != null) {



            var node = (this.goEffectParentMidParent as any);
            for (let index = 0; index < node.children.length; index++) {

                var obj = node.children[index];
                obj.active = true;

                let startPos = (this.goEffectParentUp as any).worldPosition;
                let endPosMid = (this.goEndPosMid as any).worldPosition;

                tween({ value: startPos })
                    .to(1, { value: endPosMid }, {
                        onUpdate: (target?: { value: number; }, ratio?: number) => {
                            if (!target) return; // Ensure target is defined

                            (obj as any).setWorldPosition(target.value);//=target.value;
                        },
                        onComplete: () => {
                            //(obj as any).active=false;
                        }
                    })
                    .start();

                await this.delay(600);// 0.2;
            }

            for (let index = 0; index < node.children.length; index++) {
                var obj = node.children[index];
                obj.active = false;
            }
        }
    }

    private dialogTid = 0;
    private OnCloseLvup() {
        // 
        const taskCfg = PlayerSystem.Instance.GetTbTask();
        const giftIds = taskCfg.GiftGroup;
        this.dialogTid = giftIds.length > 0 ? giftIds[0] : 0;
        if (this.dialogTid <= 0) {
            this.goLvShow.active = false;
            return;
        }
        this.goLvShow.active = true;
        this.btnShow1.node.active = true;
        var anim = this.btnShow1.node.getComponent(Animation);
        anim?.stop();
        if(this.heartSoundId > 0)
        {
            oops.audio.stopEffectById(this.heartSoundId);
            this.heartSoundId = 0;
        }
        Utility.PlayAudioOnId(2051);
        //
        if (PlayerSystem.Instance.IsMaxLv)
            return;

        if (taskCfg.AwardId.length > 0) {
            var imgName0;
            var imgName1;
            if (taskCfg.AwardId[0] == 2) {
                imgName0 = ConfigManager.tables.TbAtlas.get("BgLevelUp00");
                imgName1 = ConfigManager.tables.TbAtlas.get("BgLevelUp01");
            }
            else {
                imgName0 = ConfigManager.tables.TbAtlas.get("BgLevelUp10");
                imgName1 = ConfigManager.tables.TbAtlas.get("BgLevelUp11");
            }
            if (imgName0 != null && imgName1 != null) {
                changeSpriteImage(this.lvUpBg0, imgName0.Path, "UIHome");
                changeSpriteImage(this.lvUpBg1, imgName1.Path, "UIHome");
            }
        }


        const preLv = PlayerSystem.Instance.CurLv - 1;
        var preCfg = ConfigManager.tables.TbTask.get(preLv);
        if (preCfg == null)
            return;
        let preExp = preCfg.NeedExp;

        this.m_Text_CurExp.string = `${preExp}/${preExp}`;

        //
        this.lvUpBg1.fillRange = 0;
        let audioId = -1;
        
        //
        this.isPlayHeartAni = true;
        Utility.PlayAudioOnId(2056).then(a=>audioId=a);
        tween({ value: 1 })
            .to(3, { value: 0 }, {
                onUpdate: (target?: { value: number; }, ratio?: number) => {
                    if (!target) return; // Ensure target is defined

                    this.main_bar1.fillRange = target.value;
                    this.lvUpBg1.fillRange = 1 - target.value;

                    var tempExp = Math.floor(target.value * (preExp));
                    this.m_Text_CurExp.string = `${tempExp}/${preExp}`;
                },
                onComplete: () => {
                    this.isPlayHeartAni = false;
                    this.RefExpSlider();
                    if(audioId > 0) {
                        oops.audio.stopEffectById(audioId);
                        Utility.PlayAudioOnId(2052).then(a=>this.heartSoundId=a);
                    }
                }
            })
            .start();

        //

        if (this.goEndPosMid != null && this.goEndPosUp != null) {

            let startPos = (this.goStartPos as any).worldPosition;
            let endPos0 = (this.goEndPosUp as any).worldPosition;
            let endPosMid = (this.goEndPosMid as any).worldPosition;

            (this.goEffectParentUp as any).active = true;
            tween({ value: startPos })
                .to(3, { value: endPos0 }, {
                    onUpdate: (target?: { value: number; }, ratio?: number) => {
                        if (!target) return; // Ensure target is defined

                        (this.goEffectParentUp as any).setWorldPosition(target.value);//=target.value;
                    },
                    onComplete: () => {
                        (this.goEffectParentUp as any).active = false;
                    }
                })
                .start();
        }

        //
        this.RefEffect();
    }
    //#endregion
    private OnBtn1()
    {
        SdkManager.inst.event("sense_level", { userid: PlayerSystem.Instance.PlayerData.cfgId, sense_level: PlayerSystem.Instance.PlayerData.level });
    }
    private OnBtn2()
    {
        // SdkManager.inst.event("mapstory_end_times", { userid: PlayerSystem.Instance.CurPlayId, mapstory_end_times: 1});
        SdkManager.inst.event("sense_level", { userid: PlayerSystem.Instance.PlayerData.cfgId, sense_level: PlayerSystem.Instance.PlayerData.level.toString() });
    }
    private OnBtn3()
    {
        SdkManager.inst.event("inter_click", { userid: PlayerSystem.Instance.CurPlayId, inter_click: PlayerSystem.Instance.GetInteractionType(), inter_click_value: 1 });
    }

    private OnBtn4()
    {
        SdkManager.inst.event("message_get", {userid: PlayerSystem.Instance.CurPlayId, message_get: 1});
    }
    private OnBtn5()
    {
        
    }
    private OnBtn6()
    {

    }
}

