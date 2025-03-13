import { Button } from "cc";
import { Label } from "cc";
import { Sprite } from "cc";
import { ScrollView } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../../../common/config/GameUIConfig";
import { GameEvent } from "../../../common/config/GameEvent";
import { Utility } from "../../Utility/Utility";
import { instantiate } from "cc";
import { Node } from "cc";
import UIMakeMoneyAtmItem from "./UIMakeMoneyAtmItem";
import { tween } from "cc";
import { Vec3 } from "cc";
import { PlayerSystem } from "../../Manager/PlayerSystem";
import { ParticleSystem } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class UIQuQianATMView extends GameComponent {
    @property(ScrollView)
    private scrollView: ScrollView = null!;
    @property(Node)
    private itemTemplate: Node = null!;
    @property(Label)
    private titleLabel: Label = null!;
    @property(Sprite)
    private iconSprite: Sprite = null!;
    @property(Node)
    private effectBombFront: Node = null!;
    @property(Node)
    private effectBombBehind: Node = null!;

    private curId: number = 0;
    private items: UIMakeMoneyAtmItem[] = [];

    onLoad() {
       
    }

    onEnable() {
        this.initView();
        this.registerEvents();
    }

    onDisable() {
        this.cleanup();
        this.unregisterEvents();
    }

    private initView(): void {
        const makeMoneyData = PlayerSystem.Instance.MakeMoneyData;
        const curId = makeMoneyData.MakeMoneyInfo.CurATMID;
        const curAtmCfg = ConfigManager.tables.TbAtm.get(curId);

        if (!curAtmCfg) {
            this.onClickClose();
            return;
        }

        this.curId = curId;
        this.titleLabel.string = curAtmCfg.Desc;
        this.loadIcon(curAtmCfg.IconPath);

        const atmList = ConfigManager.tables.TbAtm.getDataList();
        this.initItemList(atmList);

        this.playScrollAnimation(atmList.length);
        this.resetEffects();
    }

    private initItemList(atmList: any[]): void {
        const content = this.scrollView.content!;
        // 
        atmList.forEach((cfg, idx) => {
            let itemNode: Node;
            if (content.children.length > idx + 1) {
                itemNode = content.children[idx + 1];
            } else {
                itemNode = instantiate(this.itemTemplate);
                itemNode.parent = content;
            }
            
            const itemComp = itemNode.getComponent(UIMakeMoneyAtmItem);
            if (itemComp) {
                itemComp.refresh(cfg);
                itemNode.active = true;
                this.items.push(itemComp);
            }
        });
        this.scrollView.scrollToTop();
    }

    private playScrollAnimation(totalCount: number): void {
        let moveIndex = this.curId;
        if (moveIndex > totalCount - 3) moveIndex = totalCount - 3;
        if (moveIndex <= 3) return;

        const targetY = 186 * moveIndex - 16;
        tween(this.scrollView.content!)
            .to(0.2, { position: new Vec3(0, targetY, 0) })
            .start();
    }

    private resetEffects(): void {
        this.effectBombFront.active=false;
        this.effectBombBehind.active=false;
    }

    private onATMChange(event: string, args: any): void {
        const newId = PlayerSystem.Instance.MakeMoneyData.MakeMoneyInfo.CurATMID;
        const cfg = ConfigManager.tables.TbAtm.get(newId);
        if (!cfg) return;

        this.titleLabel.string = cfg.Desc;
        this.loadIcon(cfg.IconPath);

        this.items.forEach(item => item.refreshUI());

        if (this.curId !== newId && !PlayerSystem.Instance.MakeMoneyData.MakeMoneyInfo.ATMUsedList.includes(args)) 
        {
            this.playTransitionEffects();
            this.curId = newId;
        }
    }

    private playTransitionEffects(): void {
        //this.effectBombFront.getComponentsInChildren(ParticleSystem).forEach(item => item.stop());
        this.effectBombFront.active=true;
        this.effectBombFront.getComponentsInChildren(ParticleSystem).forEach(item => item.play());
       // this.effectBombBehind.getComponentsInChildren(ParticleSystem).forEach(item => item.stop());
       this.effectBombBehind.active=true;
        this.effectBombBehind.getComponentsInChildren(ParticleSystem).forEach(item => item.play());
    }

    private async loadIcon(path: string)
    {
        let spF = await Utility.loadImage(path,"UIQuQian");
        if (spF) {
            this.iconSprite.spriteFrame = spF
        }
    }

    private registerEvents(): void {
        this.on(GameEvent.OnATMChange,this.onATMChange,this);
    }

    private unregisterEvents(): void {
        this.off(GameEvent.OnATMChange);
    }

    private cleanup(): void {
        this.items = [];
        PlayerSystem.Instance.TryLevelUp();
        oops.message.dispatchEvent(GameEvent.RefreshHomeView);
    }

    private onClickClose(): void {
        oops.gui.remove(UIID.UIQuQianATM);
    }
}

