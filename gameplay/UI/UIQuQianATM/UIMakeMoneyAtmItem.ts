import { Label } from "cc";
import { Sprite } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { Node } from "cc";
import { Utility } from "../../Utility/Utility";
import { TrAtm } from "../../../schema/schema";
import { PlayerSystem } from "../../Manager/PlayerSystem";
import { oops } from "db://oops-framework/core/Oops";
import { ParticleSystem } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class UIMakeMoneyAtmItem extends GameComponent {
    // UI 
    @property(Label)
    private texName: Label = null!;
    @property(Label)
    private texTargetValue: Label = null!;
    @property(Sprite)
    private iconSprite: Sprite = null!;
    @property(Node)
    private btnRoot: Node = null!;
    @property(Node)
    private objGet: Node = null!;
    @property(Node)
    private objRed: Node = null!;
    @property(Node)
    private effectAni: Node = null!;
    private cfg: TrAtm = null!;  // ATM
    private itemState: ItemState = ItemState.Locked;

    get id(): number {
        return this.cfg?.Id || 0;
    }

    // 
    public refresh(cfg: TrAtm): void {
        if (!cfg) {
            return;
        }

        this.cfg = cfg;
        this.texName.string = cfg.Desc;
        this.loadIcon(cfg.IconPath);
        this.effectAni.active = false;
        this.refreshUI();
    }

    // UI
    public refreshUI(): void {
        const makeMoneyData = PlayerSystem.Instance.MakeMoneyData;
        const curClickMoney = makeMoneyData.GetClickMakeMoneyNum();

        // 
        const curFormatted = Utility.FormatBigNumber(curClickMoney);
        const targetFormatted = Utility.FormatBigNumber(this.cfg.UnlockMoney);
        const isUnlocked = curClickMoney >= this.cfg.UnlockMoney;

        // 
        this.texTargetValue.string = `${isUnlocked ? `${curFormatted}` : curFormatted}/${targetFormatted}`;

        // 
        const currATMID = makeMoneyData.MakeMoneyInfo.CurATMID;
        if (currATMID === this.cfg.Id) {
            this.itemState = ItemState.Active;
        } else if (makeMoneyData.MakeMoneyInfo.ATMUnlockStateDict.get(this.id)) {
            if (this.itemState === ItemState.Locked) {
                this.playUnlockEffect();
            }
            this.itemState = ItemState.Unlocked;
        } else {
            this.itemState = ItemState.Locked;
        }

        // 
        this.updateButtonState();
        this.objGet.active = this.itemState !== ItemState.Locked;
        this.objRed.active = this.itemState === ItemState.Locked && isUnlocked;
    }

    // 
    private playUnlockEffect(): void {
        this.effectAni.active = true;
        this.effectAni.getComponentInChildren(ParticleSystem)?.play();
    }

    // 
    private updateButtonState(): void {
        this.btnRoot.children.forEach((child, index) => {
            child.active = index === this.itemState;
        });
    }

    // 
    public onClickUse(): void {
        if (this.itemState !== ItemState.Unlocked) return;
        PlayerSystem.Instance.MakeMoneyData.SetUsingATM(this.id);
    }

    // 
    public onClickUnlock(): void {
        if (this.itemState !== ItemState.Locked) return;

        const curClickMoney = PlayerSystem.Instance.MakeMoneyData.GetClickMakeMoneyNum();
        if (curClickMoney >= this.cfg.UnlockMoney) {
            PlayerSystem.Instance.MakeMoneyData.UnlockATM(this.id);
        } else {
            oops.gui.toast("");
        }
    }
    private async loadIcon(path: string) {
        let spF = await Utility.loadImage(path,"UIQuQian");
        if (spF) {
            this.iconSprite.spriteFrame = spF
        }
    }


    // 
    protected onDisable(): void {
        this.effectAni.active = false;
    }
}

// 
enum ItemState {
    Active = 0,    // 
    Unlocked = 1,  // 
    Locked = 2     // 
}

