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

    onLoad() {
        this.RegistEvents();
    }

    async start() {
        HeroineDataManager.Instance.SetPower({powerBody:100,powerAgility:100});
        this.SetRoleInfo("main_avatar");
    }

    protected onEnable(): void {
        
    }


    reset() {
    }

   
    protected update(dt: number): void {

        
    }

    onDestroy() {
        this.UnRegistEvents();
    }

    ///////////////////////////////////

    ///
    SetRoleInfo(spriteName:string) { 
        oops.res.loadAsync<SpriteFrame>("UIMain", `Sprites/${spriteName}/spriteFrame`).then((sp)=>{
            this.SpriteHeadIcon.spriteFrame = sp;
        });
    }

    ////UI
    SetTimeState(timeString:string)
    {
        this.TxtGameTime.string = timeString;
    }

    ///
    RefreshCurrency(event: string, ...args: any)
    {
        let currencyType = args[0];
        let currencyNum = args[1];
        let currencyDelta = args[2];//
        switch(currencyType)
        {
            case ItemEnum.Cash:
                this.TxtCashValue.string = currencyNum.toString();
                break;
            case ItemEnum.Gem:
                this.TxtGemValue.string = currencyNum.toString();
                break;
            default:
                break;
        }
    }

    BtnCashAdd_Click() {

    }

    BtnGemAdd_Click() {

    }

    BtnHeadIcon_Click() {

    }
    BtnTimeState_click() {

    }
    BtnTips_Click() { 

    }
    BtnPhone_Click() {
        // oops.gui.openAsync(UIID.TalkView, {Id:200001});
        GuideManager.Instance.FinishGuide();
        oops.gui.openAsync(UIID.Phone);
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
        oops.gui.open(UIID.UIHome);
        oops.gui.remove(UIID.UIMain);
    }
    BtnMagicBox_Click() {

    }
    BtnKeyAdd_Click() {

    }

    private RegistEvents() {
        this.on(GameEvent.OnMoneyChange, this.RefreshCurrency, this);
    }

    private UnRegistEvents() {
        this.off(GameEvent.OnMoneyChange);
    }
}

