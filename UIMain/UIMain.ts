import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director, EventHandle
} from "cc";
import { CCComp } from "db://oops-framework/module/common/CCComp";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { TapSystem } from "db://assets/script/game/gameplay/Manager/TapSystem";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import { TaskSystem } from "db://assets/script/game/gameplay/Manager/TaskSystem";
import { Utility } from "db://assets/script/game/gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { UITimerManager } from "../gameplay/Manager/UITimerManager";
import ConfigManager from "../manager/Config/ConfigManager";
import { TimeUtility } from "../gameplay/Utility/TimeUtility";
import { TaskType } from "../gameplay/GameDataModel/TaskType";
import { GameHelper } from "../gameplay/GameTool/GameHelper";
import { TbInteraction, TbVideo, TrInteraction, TrUIGuide } from "../schema/schema";
import { UIMainVideoComp } from "../UIMainVideo/UIMainVideoComp";
import { FunctionOpenType } from "../gameplay/GameDataModel/FunctionOpenType";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";
import { SdkManager } from "../../modules/sdk/SdkManager";
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { HeartSystem } from "../gameplay/Manager/HeartSystem";
import { color } from "cc";
import { changeSpriteImage } from "../common/UIExTool";
import { StorySystem } from "../gameplay/Manager/StorySystem";
import { ItemEnum } from "../gameplay/GameDataModel/GameEnum";
import { tips } from "../common/prompt/TipsManager";
import { GuideManager } from "../UIGuide/GuideManager";
import { LayerType } from "db://oops-framework/core/gui/layer/LayerManager";
import { EditBox } from "cc";
import { sys } from "cc";
import { Notification } from "../common/UINotification/Notification";
import { UINotification } from "../common/UINotification/UINotification";
import { HeroineDataManager } from "./HeroineDataManager";
import { Sprite } from "cc";
import { sp } from "cc";
import { MagicBox } from "./MagicBox";
import { BlockInputEvents } from "cc";
import { PropType } from "./HeroineDataManager";
import { Skeleton } from "cc";
import { TimeState } from "./TimeState";
const { ccclass, property } = _decorator;

@ccclass('UIMain')
export class UIMain extends CCComp {
    @property(Label) TxtCashValue: Label = null!;//
    @property(Label) TxtGemValue: Label = null!;//
    @property(Label) TxtRoleLv: Label = null!;//
    @property(Label) TxtRoleName: Label = null!;////
    @property(Label) TxtGameTime: Label = null!;//
    @property(Label) TxtTimeState: Label = null!;//
    @property(Label) TxtKeyCount: Label = null!;//
    @property(Label) TxtKeyDesc: Label = null!;//

    @property(Button) BtnCashAdd:Button = null!;//
    @property(Button) BtnGemAdd:Button = null!;//
    @property(Button) BtnHeadIcon:Button = null!;//
    @property(Button) BtnTimeState:Button = null!;//
    @property(Button) BtnTips:Button = null!;//Tips
    @property(Button) BtnPhone:Button = null!;//
    @property(Button) BtnIdentity:Button = null!;//
    @property(Button) BtnClothStore:Button = null!;//
    @property(Button) BtnShop:Button = null!;//
    @property(Button) BtnBoyFriend:Button = null!;//
    @property(Button) BtnMagicBox:Button = null!;//
    @property(Button) BtnKeyAdd:Button = null!;//

    @property(Sprite) SpriteHeadIcon: Sprite = null!;
    @property(Sprite) SpriteBg: Sprite = null!;
    @property(Node) MagicBoxTips: Node = null!;
    @property(Node) ArrBg: Node[] = []!;
    @property(Node) TimeTips: Node = null!;
    @property(TimeState) TimeState: TimeState = null!;
    @property(Node) RoleSpine: Node = null!;
    @property(sp.Skeleton) SpineMagicBox : sp.Skeleton = null!;

    onLoad() {
        this.RegistEvents();
        this.TimeTips.active =  false
    }

    async start() {
        HeroineDataManager.Instance.SetProp(PropType.Wisdom, 100);
        this.InitPropShow();
    }

    protected onEnable(): void {
        this.MagicBoxTips.getComponent(BlockInputEvents)!.enabled = false;
    }


    reset() {
    }

   
    protected update(dt: number): void {

        
    }

    onDestroy() {
        this.UnRegistEvents();
    }

    ///////////////////////////////////
    InitPropShow() { 
        this.RefreshName();
        this.RefreshHeadIcon();
        this.RefreshCurrency();
        this.RefreshLv();
        this.RefreshKey();
        this.RefreshBg();
        this.RefreshTimeState();
    }


    RefreshHeadIcon()    ///
    { 
        oops.res.loadAsync<SpriteFrame>("UIMain", `Sprites/${HeroineDataManager.Instance.GetHeadIcon}/spriteFrame`).then((sp)=>{
            if (sp) {
                this.SpriteHeadIcon.spriteFrame = sp;
            }
        });
    }

    RefreshTimeState()    ////UI
    {
        let timePoint = HeroineDataManager.Instance.GetCurVirtualTimePoint();
        //this.TxtGameTime.string = `${timePoint}`
        //todo/
        this.TimeState.changeTimeAnim(timePoint)
        this.TimeState.SetLastTime(timePoint);
    }
    RefreshGetKeyTimeLeft()
    {
        this.schedule(() => {
            this.TxtKeyDesc.string = `${HeroineDataManager.Instance.GetKeyTimeLeft()}        X1`;
        }, 1)
    }
    RefreshName()
    {
        this.TxtRoleName.string = HeroineDataManager.Instance.GetName();
    }
    RefreshLv()
    {
        this.TxtRoleLv.string = `LV.${HeroineDataManager.Instance.getLvCur()}`;
        this.RefreshKey();
    }
    RefreshCurrency()    ///
    {
        this.TxtCashValue.string = GameData.getCurrency(ItemEnum.Cash).toString();
        this.TxtGemValue.string = GameData.getCurrency(ItemEnum.Gem).toString();
    }

    RefreshKey()
    {
        this.TxtKeyCount.string = `${GameData.getCurrency(ItemEnum.Key)}/${HeroineDataManager.Instance.GetKeyCountMax()}`;
    }

    RefreshBg()
    {
        let curVirtualTime = HeroineDataManager.Instance.GetCurVirtualTimeArea();
        for (let i = 0; i < this.ArrBg.length; i++) {
            const element = this.ArrBg[i];
            element.active = i == (curVirtualTime- 1);
        }
    }

    BtnCashAdd_Click() {

    }

    BtnGemAdd_Click() {

    }

    BtnHeadIcon_Click() {
        oops.gui.open(UIID.UIHeroineInfo);
    }
    BtnTimeState_click() {
        let nextVirtualTime = HeroineDataManager.Instance.GetNextVirtualTimeArea()!;
        let nextVirtualTimePoint = HeroineDataManager.Instance.GetFirstTimePointByTimeArea(nextVirtualTime)!;
        HeroineDataManager.Instance.SetCurVirtualTimePoint(nextVirtualTimePoint);
    }
    BtnTips_Click() { 
        this.TimeTips.active = true;
    }
    BtnCloseTips_Click() { 
        this.TimeTips.active = false;
    }
    BtnPhone_Click() {
        oops.gui.openAsync(UIID.TalkView, {Id:200001});
        // GuideManager.Instance.FinishGuide();
        // oops.gui.openAsync(UIID.Phone);
    }
    BtnTaskType_0_Click() {

    }
    BtnTaskType_1_Click() {

    }
    BtnIdentity_Click() {

    }
    BtnClothStore_Click() {

    }
    BtnShop_Click() {
      
    }
    BtnBoyFriend_Click() {
        // 
        oops.gui.open(UIID.UIBoyFriend);
        oops.gui.remove(UIID.UIMain);
    }
    BtnMagicBox_Click() {
        let nextVirtualTime = HeroineDataManager.Instance.GetNextVirtualTimePoint()!;
        HeroineDataManager.Instance.SetCurVirtualTimePoint(nextVirtualTime);

        this.SpineMagicBox.setAnimation(0, "click", true);
        this.scheduleOnce(() => { 
            this.SpineMagicBox.setAnimation(0, "idle", true);
        }, 2);
        let magicBox = new MagicBox();
        magicBox.Init(this.MagicBoxTips);
    }
    BtnKeyAdd_Click() {
        let d = HeroineDataManager.Instance.GetKeyTimeLeft();
    }

    onHeroineLevelUp() {
        this.RefreshLv();
        // 
        oops.gui.open(UIID.UIMainLevelUp);
    }

    private RegistEvents() {
        this.on(GameEvent.OnHeroineNameChange, this.RefreshName, this);
        this.on(GameEvent.OnHeroineHeadIconChange, this.RefreshHeadIcon, this);
        this.on(GameEvent.OnMoneyChange, this.RefreshCurrency, this);

        this.on(GameEvent.onHeroineLevelUp, this.RefreshLv, this);
        this.on(GameEvent.onHeroineKeyChange, this.RefreshKey, this);
        this.on(GameEvent.onHeroineVirtualTimeChange, this.RefreshBg, this);
        this.on(GameEvent.onHeroineVirtualTimeChange, this.RefreshTimeState, this);
    }

    private UnRegistEvents() {
        this.off(GameEvent.OnHeroineNameChange);
        this.off(GameEvent.OnHeroineHeadIconChange);
        this.off(GameEvent.OnMoneyChange);
        this.off(GameEvent.onHeroineLevelUp);
        this.off(GameEvent.onHeroineKeyChange);
        this.off(GameEvent.onHeroineVirtualTimeChange) 
    }
}

