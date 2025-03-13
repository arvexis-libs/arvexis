import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director, Sprite
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
import { ItemUtils } from "../gameplay/Utility/ItemUtils";
import { ADEnum } from "../gameplay/Manager/GameDot";
import { color } from "cc";
import { Color } from "cc";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UITapUp')
@ecs.register('UITapUp', false)
export class UITapUp extends CCComp {
    @property(Button)
    private closeBtn: Button = null!;

    @property(Button)
    private closeBtn2: Button = null!;

    @property(Button)
    private switchBtn: Button = null!;

    @property(Button)
    private speedBtn: Button = null!;

    @property(Label)
    private txtCurExp: Label = null!;

    @property(Label)
    private txtNextExp: Label = null!;

    @property(Label)
    private txtCurMoney: Label = null!;

    @property(Label)
    private txtNextMoney: Label = null!;

    @property(Label)
    private txtCurLv: Label = null!;

    @property(Label)
    private txtSwitch: Label = null!;

    @property(Label)
    private txtCurDes: Label = null!;

    @property(Label)
    private txtSpend: Label = null!;

    @property(Sprite)
    private giftIcon: Sprite = null!;

    @property(Node)
    private guide: Node = null!;

    @property(Node)
    private switchUp: Node = null!;

    @property(Node)
    private spendUp: Node = null!;

    @property(Node)
    private maxLv: Node = null!;

    @property(Node)
    private Image_jiantou1: Node = null!;

    @property(Node)
    private Image_jiantou2: Node = null!;

    @property(Node)
    private Image_heartR: Node = null!;

    @property(Node)
    private Image_money: Node = null!;

    private curSelectIndex: number = 0;
    private switchNums: number[] = [1, 10, 100];
    private isShowGuide:boolean=false;
    private get CurSwitchNum(): number {
        return this.switchNums[this.curSelectIndex % 3];
    }

    private get Lv(): number {
        return GameData.PlayerData.GlobalData.TapLevel;
    }

    /**  */
    start() {
        this.closeBtn.node.on('click', this.onClickClose, this);
        this.closeBtn2.node.on('click', this.onClickClose, this);
        this.switchBtn.node.on('click', this.onClickSwitch, this);
        this.speedBtn.node.on('click', this.onClickSpeed, this);
    }
    protected onEnable(): void {
        this.refresh();
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    onDestroy() {

    }
    onAdded(args: any) {
        this.isShowGuide=args;
        GameData.isActive=true;
        return true;
    }
    private onClickClose() {
        GameData.isActive = false;
        // UITapUpContext
        oops.gui.remove(UIID.UITapUp)
    }

    private onClickSwitch() {
        this.curSelectIndex++;
        this.refresh();
    }

    private onClickSpeed() {
        if (this.guide.active) 
        {
            this.guide.active = false;
            this.isShowGuide=false;
        }

        const need = TapSystem.Instance.GetNextSpend(this.CurSwitchNum);
        if (GameData.PlayerData.GlobalData.money < need) {
             TipsNoticeUtil.PlayNotice("");
            console.error("");
            if (!GameData.isOpenFreeMoneyInTapUp) {
                GameData.isOpenFreeMoneyInTapUp = true;
                oops.gui.openAsync(UIID.UIFreeMoney);
            }
            return;
        }

        GameData.PlayerData.GlobalData.SubtractWealth(need);
        GameData.PlayerData.GlobalData.TapLevel += this.CurSwitchNum;
        GameData.PlayerData.GlobalData.TapLevel = Math.min(TapSystem.Instance.MaxTapCfgLv, GameData.PlayerData.GlobalData.TapLevel);
        this.refresh();

        // 

    }
 
    private refresh() {

        this.switchUp.active = false;
        this.spendUp.active = false;

        const iconId = GameData.PlayerData.GlobalData.TapLevel === 1 ? 1 : TapSystem.Instance.GetCurTapInfo().Icon;
        // Cocos Creator
        // this.giftIcon.spriteFrame = await this.loadSprite(`UITapUp/${iconId}`);

        this.txtCurLv.string = `Lv.${this.Lv}`;
        this.txtSwitch.string = `x${this.CurSwitchNum}`;

        this.txtCurDes.string = TapSystem.Instance.GetCurTapInfo().Des;
        this.txtCurExp.string = "+" + TapSystem.Instance.TapExp.toFixed(1);
        this.txtNextExp.string = "+" + TapSystem.Instance.GetNextExp(this.CurSwitchNum).toFixed(1);
        this.txtCurMoney.string = "-" + TapSystem.Instance.TapMoney.toFixed(1);
        this.txtNextMoney.string = "-" + TapSystem.Instance.GetNextMoney(this.CurSwitchNum).toFixed(1);

        this.txtSpend.string = Utility.FormatBigNumber(TapSystem.Instance.GetNextSpend(this.CurSwitchNum));
        const c = GameData.PlayerData.GlobalData.money >= TapSystem.Instance.GetNextSpend(this.CurSwitchNum) 
            ? new Color(255, 255, 255)
            : new Color(255, 0, 0)
        this.txtSpend.color = c;

        // this.guide.active = this.uiData.isShowGuide;
        this.guide.active = this.isShowGuide;

        // 
        if (TapSystem.Instance.IsMaxTapLv) {
            this.maxLv.active = true;
            this.switchBtn.node.active = false;
            this.speedBtn.node.active = false;

            this.txtNextExp.node.active = false;
            this.txtNextMoney.node.active = false;
            this.Image_jiantou1.active = false;
            this.Image_jiantou2.active = false;
            this.Image_heartR.active = false;
            this.Image_money.active = false;
            return;
        }

        // 
        if (GameData.PlayerData.GlobalData.TapLevel + this.CurSwitchNum > TapSystem.Instance.MaxTapCfgLv) {
            // 
        }

        // tip
        if (this.CurSwitchNum === 1) {
            if (GameData.PlayerData.GlobalData.money >= TapSystem.Instance.GetNextSpend(10)) {
                this.switchUp.active = true;
            }
        } else if (this.CurSwitchNum === 10) {
            this.spendUp.active = true;
        }
    }
}

