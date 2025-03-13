import {
    Node, EventTouch, _decorator, Component, Label, Button, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director
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
import { Toggle } from "cc";
import { Sprite } from "cc";
import ConfigManager from "../manager/Config/ConfigManager";
import { ScrollView } from "cc";
import { RichText } from "cc";
import { changeSpriteImage } from "../common/UIExTool";
import { find } from "cc";
import { SpriteFrame } from "cc";
import { Texture2D } from "cc";
import { ImageAsset } from "cc";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UILover')
@ecs.register('UILover', false)
export class UILover extends CCComp {
    private curIndex: number = 0;
    private skins: Node[] = [];
    private expSliderSize: Vec2 = new Vec2();
    private skinIds: number[] = [];
    private maxShowCount: number = 4;
    private adenum: string = "Reload_adv";

    // UI Components
    @property({ type: Node })
    private closeBtn: Node = null!;
    @property({ type: Node })
    private leftBtn: Node = null!;
    @property({ type: Node })
    private rightBtn: Node = null!;
    @property({ type: Node })
    private playBtn: Node = null!;
    @property({ type: Node })
    private useBtn: Node = null!;
    @property({ type: ScrollView })
    private scrollView: ScrollView = null!;
    @property({ type: Node })
    private content: Node = null!;
    @property({ type: Sprite })
    private img: Sprite = null!;
    @property({ type: Sprite })
    private icon: Sprite = null!;
    @property({ type: Node })
    private state1: Node = null!;
    @property({ type: Node })
    private state2: Node = null!;
    @property({ type: Node })
    private state3: Node = null!;
    @property({ type: Node })
    private state4: Node = null!;
    @property({ type: RichText })
    private state1Des: RichText = null!;
    @property({ type: Label })
    private m_Text_CurExp: Label = null!;
    @property({ type: Node })
    private m_Transform_ExpSlider: Node = null!;
    @property({ type: Toggle })
    private skin0: Toggle = null!;
    @property({ type: Toggle })
    private skin1: Toggle = null!;
    @property({ type: Toggle })
    private skin2: Toggle = null!;
    @property({ type: Toggle })
    private skin3: Toggle = null!;
    @property({ type: Toggle })
    private skin4: Toggle = null!;
    @property({ type: Toggle })
    private skin5: Toggle = null!;
    @property({ type: Toggle })
    private skin6: Toggle = null!;
    @property({ type: Toggle })
    private skin7: Toggle = null!;
    @property({ type: Toggle })
    private skin8: Toggle = null!;
    @property({ type: Toggle })
    private skin9: Toggle = null!;

    reset(): void {

    }
    start(): void {
        this.curIndex = PlayerSystem.Instance.CurSkin;

        this.skinIds = [];
        const dataList = ConfigManager.tables.Tbreloading.getDataList();
        for (const data of dataList) {
            if (PlayerSystem.Instance.PlayerData.cfgId !== Math.floor(data.Id / 100)) {
                continue;
            }
            this.skinIds.push(data.Id);
        }

        this.setToggle(this.curIndex);
        this.refresh();

        tween(this.node).delay(0.1).call(() => this.refreshPos()).start();
    }
    protected onLoad(): void {
        this.closeBtn.on(Button.EventType.CLICK, this.onClose, this);
        this.leftBtn.on(Button.EventType.CLICK, this.onClickLeft, this);
        this.rightBtn.on(Button.EventType.CLICK, this.onClickRight, this);
        this.playBtn.on(Button.EventType.CLICK, this.onClickPlay, this);
        this.useBtn.on(Button.EventType.CLICK, this.onClickUse, this);

        this.skin0.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin1.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin2.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin3.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin4.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin5.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin6.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin7.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin8.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);
        this.skin9.node.on(Toggle.EventType.TOGGLE, this.toggleChange, this);

        this.skins.push(this.skin0.node);
        this.skins.push(this.skin1.node);
        this.skins.push(this.skin2.node);
        this.skins.push(this.skin3.node);
        this.skins.push(this.skin4.node);
        this.skins.push(this.skin5.node);
        this.skins.push(this.skin6.node);
        this.skins.push(this.skin7.node);
        this.skins.push(this.skin8.node);
        this.skins.push(this.skin9.node);

        const uiTransform = this.m_Transform_ExpSlider.getComponent(UITransform);
        if (!uiTransform || !uiTransform.contentSize) {
            error("UITransform or contentSize is missing on m_Transform_ExpSlider");
            this.expSliderSize = new Vec2(0, 0); // Default value in case of failure
        } else {
            this.expSliderSize = new Vec2(uiTransform.contentSize.width, uiTransform.contentSize.height);
        }
    }

    private ondestroy(): void {
        oops.message.dispatchEvent(GameEvent.OnSkinChange);
        // 
        // Notification.setNeedRefresh(Notification.Type.Skin);
    }


    private onClose(): void {
        // Implement close logic for UILoverContext
        oops.gui.remove(UIID.UILover)
    }

    private onClickUse(): void {
        PlayerSystem.Instance.SetSkin(this.curIndex);
        this.refresh();
    }

    private onClickPlay(): void {
        // WxADSystem.Instance.showRewardedVideoAd(() => {
        const currentLookCount = PlayerSystem.Instance.PlayerData.SkinData.LookNum.get(this.curIndex) || 0;
        PlayerSystem.Instance.PlayerData.SkinData.LookNum.set(this.curIndex, currentLookCount + 1);
        const cfg = PlayerSystem.Instance.GetSkinInfo(this.curIndex);
        if (currentLookCount >= cfg.AD) {
            PlayerSystem.Instance.UnlockSkin(this.curIndex);
        }

        this.refresh();
        // Notification.setNeedRefresh(Notification.Type.Skin);
        // }, this.adenum);
    }

    private onClickRight(): void {
        this.curIndex++;
        this.setToggle(this.curIndex);
    }

    private onClickLeft(): void {
        this.curIndex--;
        this.setToggle(this.curIndex);
    }

    private refresh(): void {
        this.refreshSkin();
        this.refreshState();
    }

    private async refreshSkin(): Promise<void> {
        this.scrollView.enabled = this.skinIds.length > this.maxShowCount;
        const levelRewardId = ConfigManager.tables.TbConst.get("Level40Reward")?.Int!;

        for (let i = 0; i < this.skins.length; i++) {
            const skin = this.skins[i];
            if (i >= this.skinIds.length) {
                skin.active = false;
                continue;
            }
            skin.active = true;

            const cfg = PlayerSystem.Instance.GetSkinInfo(i)!;
            const golock = skin.getChildByName("lock")!;
            const gouse = skin.getChildByName("use")!;
            const txtDes = skin.getChildByName("des")?.getComponent(Label)!;
            const txtlockDes = find("lock/lockDes",skin)?.getComponent(Label)!;
            const icon = skin.getChildByName("icon")?.getComponent(Sprite)!;
            const gored = skin.getChildByName("red")!;

            // Common settings
            gored.active = false;
            golock.active = true;
            gouse.active = false;
            txtDes.string = cfg.Desc;
            
            this.loadImage(`Sprites/${cfg.IconId}`, icon);

            // Currently using
            if (i === PlayerSystem.Instance.CurSkin) {
                golock.active = false;
                gouse.active = true;

                this.loadImage(`Sprites/${cfg.IconId}`, this.img);
                continue;
            }

            // Available to use
            if (PlayerSystem.Instance.IsUnlockSkin(i)) {
                golock.active = false;
                continue;
            }

            // Locked
            if (PlayerSystem.Instance.CurLv < cfg.Open) {
                txtlockDes.string = `${cfg.Open}`;
                continue;
            }

            if (cfg.Id === levelRewardId) {
                txtlockDes.string = `40`;
            } else {
                // AD
                txtlockDes.string = `${cfg.AD}`;

                // if (cfg.Id === ConfigManager.tables.TbSDay.get(7).GiftGroup[0]) {
                //     txtlockDes.string = `<color=#fe5293>7</color>`;
                // }
            }

            if (!PlayerSystem.Instance.PlayerData.SkinData.LookNum.get(i)) {
                PlayerSystem.Instance.PlayerData.SkinData.LookNum.set(i,0);
            }
            gored.active = true;
        }
    }

    private refreshPos(): void {
        const rContent = this.content.getComponent(UITransform)!;
        const lp = rContent.node.position.clone();
        const l = rContent.contentSize.x / this.skinIds.length;
        const startX = l * (this.skinIds.length - this.maxShowCount) / 2;
        let toX = startX - l * this.curIndex;
        toX = Math.max(toX, -startX);
        lp.x = toX;

        rContent.node.setPosition(lp);
    }

    private refreshState(): void {
        this.leftBtn.active = this.curIndex > 0;
        this.rightBtn.active = this.curIndex < this.skinIds.length - 1;

        this.state1.active = false;
        this.state2.active = false;
        this.state3.active = false;
        this.state4.active = false;

        this.refreshPos();

        if (this.curIndex === PlayerSystem.Instance.CurSkin) {
            this.state3.active = true;
            return;
        }

        if (PlayerSystem.Instance.IsUnlockSkin(this.curIndex)) {
            this.state4.active = true;
            return;
        }

        const cfg = PlayerSystem.Instance.GetSkinInfo(this.curIndex);
        if (PlayerSystem.Instance.CurLv < cfg.Open) {
            this.state1.active = true;
            const cfg2 = ConfigManager.tables.TbPlayer.get(PlayerSystem.Instance.CurPlayId)!;
            this.state1Des.string = `${cfg2.Name} <color=#fe5293>${cfg.Open}</color> `;
            return;
        }

        this.state2.active = true;
        const needExp = cfg.AD;

        // Special case
        if (needExp === 0) {
            this.state2.active = false;
            return;
        }

        if (!PlayerSystem.Instance.PlayerData.SkinData.LookNum.get(this.curIndex)) {
            PlayerSystem.Instance.PlayerData.SkinData.LookNum.set(this.curIndex,0);
        }

        const curExp = PlayerSystem.Instance.PlayerData.SkinData.LookNum.get(this.curIndex)!;
        this.m_Text_CurExp.string = `${curExp}/${needExp}`;
        const v = Math.min(1, curExp / needExp);
        const progressW = v * this.expSliderSize.x;
        const progressH = this.expSliderSize.y;

        const expTransform = this.m_Transform_ExpSlider.getComponent(UITransform);
        expTransform?.setContentSize(progressW, progressH);
        this.m_Transform_ExpSlider.setPosition(
            new Vec3(
                this.expSliderSize.x * -0.5 + progressW * 0.5,
                0,
                0
            )
        );
    }

    private toggleChange(toggle: Toggle): void {
        if (!toggle.isChecked) {
            return;
        }

        const tr = toggle.node;
        const name = tr.name;
        const index = parseInt(name.substring(name.length - 1));
        this.curIndex = index;

        const icon = tr.getChildByName("icon")?.getComponent(Sprite)!;
        this.img.spriteFrame = icon.spriteFrame;

        this.refreshState();
    }

    private setToggle(index: number): void {
        const targetToggle = this.skins[index].getComponent(Toggle);
        if (targetToggle) {
            targetToggle.isChecked = true;
        } else {
            error(`Failed to set isChecked for skin[${index}]: Toggle component is missing`);
        }
    }

    private async loadImage(urlPath: string, node: Sprite | null) {
        let image = await oops.res.loadAsync<ImageAsset>("UILover", urlPath);
        if (image && node != null) {
            const texture = new Texture2D();
            texture.image = image;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            node.spriteFrame = spriteFrame;
        }
    }
}