import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
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
import { Sprite } from "cc";
import ConfigManager from "../manager/Config/ConfigManager";
import { ImageAsset } from "cc";
import { Texture2D } from "cc";
import { GameHelper } from "../gameplay/GameTool/GameHelper";
import { Slider } from "cc";
import { ProgressBar } from "cc";
import { GameManager } from "db://oops-framework/core/game/GameManager";
import { find } from "cc";
import { RichText } from "cc";
import { Animation } from "cc";
import { Size } from "cc";
import { view } from "cc";
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";

const { ccclass, property } = _decorator;

/**  */
@ccclass('UILevelUp')
@ecs.register('UILevelUp', false)
export class UILevelUp extends CCComp {

    @property(Sprite)
    img: Sprite = null!;
    @property(Sprite)
    imgMask: Sprite = null!;

    // 
    @property(Button)
    closeBtn: Button = null!;

    // 
    @property(Label)
    txtCurLv: Label = null!;
    @property(Label)
    txtLeftLv: Label = null!;
    @property(Label)
    txtRightLv: Label = null!;
    @property(Label)
    txtToLv: Label = null!;

    @property(Node)
    panel: Node = null!;
    @property(Node)
    xiaoyuEffect: Node = null!;
    @property(Node)
    Node1: Node = null!;
    @property(Node)
    Node2: Node = null!;
    @property(Node)
    Node3: Node = null!;

    @property(Node)
    UnlockImg: Node = null!;
    @property(Node)
    LockImg: Node = null!;

    @property(RichText)
    txtDes: RichText = null!;

    //
    @property(Node) giftRoot: Node = null!;
    @property(Label) giftLv_1: Label = null!;
    @property(Label) giftLv_2: Label = null!;
    @property(Slider) giftSlider: Slider = null!;
    @property(ProgressBar) giftProg: ProgressBar = null!;
    @property(Label) giftProgLab: Label = null!;

    private leftLv: number = 0;
    private rightLv: number = 0;
    private lastLv: number = 0;
    private expSliderSize: Vec2 = new Vec2();
    private playing: boolean = false;
    private giftIds: number[] = [];
    private giftNums: number[] = [];
    private adenum: ADEnum = ADEnum.Lvup_adv;
    private isClick: boolean = false;
    private curKeyNode: number = 0;

    private mUpdateTween: Tween | null = null;

    onAdded(_isClick: boolean) {

        if (_isClick === true) {
            this.isClick = true;
            this.playing = false;
        }
        else {
            this.isClick = false;
            this.playing = true;
        }
    }

    /**  */
    start() {
        if (this.isClick) {
            UIMusicManager.inst.playUIMusic(UIID.UILevelUp, 1031);
        }
        this.closeBtn.node.on(Button.EventType.CLICK, this.onClickClose, this);

        // AudioManager.PlaySound("ExpLvUp");
        this.lastLv = Math.max(1, PlayerSystem.Instance.CurLv - 1);
        if (this.isClick) {
            this.lastLv = PlayerSystem.Instance.CurLv;
        }

        this.Refresh();

        this.RefLvMask(() => {
            if (this.curKeyNode == 0) {
                //return;
                this.curKeyNode = 1; // 
            }
            const cfg = ConfigManager.tables.TbKeyNode.get(this.curKeyNode);
            if (cfg != null) {
                const imgPath = ConfigManager.tables.TbAtlas.get(cfg?.ImagePath);
                if (imgPath != null) {
                    //this.loadImage(`Sprites/${imgPath.Path}`, this.img);
                    //this.setSprite(this.img, imgPath.Path + "/spriteFrame", "Sprites");
                    this.loadAsync<SpriteFrame>("UITalkView", imgPath.Path + "/spriteFrame",).then((sp) => {
                        if (this.isValid) {
                            this.img.spriteFrame = sp;
                        }
                    });
                }
            }
        });

        // 
        const screenW = oops.gui.root.w;
        const screenH = oops.gui.root.h;
        // let DesignResolution = view.getDesignResolutionSize().height / view.getDesignResolutionSize().width;
        // let imageY = screenH;//window.innerHeight;
        // console.error("imageY", window.innerHeight);
        // console.error("view", view.getVisibleSize().height);
        // console.error("screenH", screenH);

        // let imageX = DesignResolution * imageY;
        // this.imgMask.node.size = new Size(imageX, imageY);

        let atio = screenH / screenW;
        let scale = Math.abs(atio - 16/9) + 1;
        this.imgMask.node.scale = new Vec3(scale, scale, scale);
    }

    /**  ecs.Entity.remove(UIMakeMoneyRootViewComp)  */
    reset() {
    }

    onDestroy() {
        this.playing = false;

        if (this.mUpdateTween) {
            this.mUpdateTween.stop();
            this.mUpdateTween = null;
        }
        // super.onDestroy();
    }

    private onClickClose(): void {
        if (this.playing) {
            this.playing = false;
            if (this.mUpdateTween) {
                this.mUpdateTween.stop();
                this.mUpdateTween = null;
            }
            return;
        }
        oops.gui.remove(UIID.UILevelUp)

        if (!this.isClick) {
            oops.message.dispatchEvent(GameEvent.OnCloseLvup);
        }

        FunctionOpenSystem.Instance.ShowOpenFunction(()=>
        {
            oops.gui.openWait();
        });

    }

    private updateMaskValue(value: number) {
        this.scheduleOnce(() => {
            //0.25~0.78
            value = this.maskMapToRange(value);
            this.imgMask.material?.setProperty("fadeStart", value);
        }, 0.1);
    }
    /**
     *  [0, 1]  [0.25, 0.78]
     * @param value 0 ~ 1
     * @returns 0.25 ~ 0.78
     */
    maskMapToRange(value: number): number {
        if (value < 0 || value > 1) {
            throw new Error(" [0, 1] ");
        }
        if (value == 1 || value == 0) return value;
        return 0.25 + value * (0.78 - 0.25);
    }

    private Refresh(): void {
        this.CalcLv();
        this.txtDes.string = `${this.rightLv}<color=#F5E39C></color>`;
        
        this.giftSlider.enabled = false;
        let rightMaxLv = ConfigManager.tables.TbConst.get("RoleMaxLevel")?.Int || 999;
        if (this.rightLv == rightMaxLv) {
            // 
            if (this.curKeyNode == 0) {
                let cfg = PlayerSystem.Instance.GetTbTask(this.leftLv);

                this.curKeyNode = cfg.KeyNode;

                this.txtCurLv.string = `${Math.floor(1 * 100)}`;
                this.updateMaskValue(1 - 1);
                this.playing = false;

                this.giftLv_1.string = `Lv.${this.leftLv}`;
                this.giftLv_2.string = `Lv.${this.rightLv}`;

                // this.giftSlider.progress = 1;
                // this.giftProg.progress = 1;
                // this.giftProgLab.string = `${100}%`;
                // this.giftProg.progress = 1;
                this.giftRoot.active = false;
                this.Node2.active = false;
                this.panel.active = true;
                return;
            }
        }

        let v = (PlayerSystem.Instance.CurLv - this.leftLv) / (this.rightLv - this.leftLv);
        v = Math.min(1, v);
        if (v >= 1) {
        this.txtDes.string = `<color=#F5E39C></color>`;
        }
        this.txtCurLv.string = `${Math.floor(v * 100)}`;
        this.txtToLv.string = `${PlayerSystem.Instance.CurLv}`;
        this.txtLeftLv.string = `Lv.${PlayerSystem.Instance.CurLv - 1}`;
        this.txtRightLv.string = `Lv.${PlayerSystem.Instance.CurLv}`;
        if (this.playing) {
            // this.Node1.active = true;
            // this.Node2.active = false;
        }
        else {
            // this.Node1.active = false;
            // this.Node2.active = true;
        }

        if (this.lastLv + 1 != this.rightLv) {
            this.UnlockImg.active = false;
            this.LockImg.active = true;
        }
        else {
            this.UnlockImg.active = true;
            this.LockImg.active = false;
        }

        // this.RefreshGift();
        this.updateMaskValue(1 - v);
        
        let startV = (PlayerSystem.Instance.CurLv - 1 - this.leftLv) / (this.rightLv - this.leftLv);

        if (this.playing) {
            this.txtCurLv.string = `${Math.floor(startV * 100)}`;
            this.updateMaskValue(1 - startV);
        }
        
        // ● 
        // ○ 1
        // ○ 1
        // ○ 2

        // this.isClick = false;
        let t0 = 4.53;
        let t1 = 2;
        let t2 = 0;
        let t3 = 0.5;
        if (this.isClick) { 
            this.panel.active = true;
            t1 = 0;
            t0 = 0;
            // Utility.PlayAudioOnId(2054);
        }
        else { 
            this.xiaoyuEffect.active = true;
            Utility.PlayAudioOnId(2055);
            this.Node1.getComponent(Animation)?.play();
            this.scheduleOnce(()=>{
                this.xiaoyuEffect.getComponent(Animation)?.play();
                this.scheduleOnce(()=>{
                    this.xiaoyuEffect.active = false;
                    this.panel.active = true;
                }, t0);
            }, t1);


            let at1 = t1 + 2.4;
            let at2 = t1 + t0 - 1.2;

            this.scheduleOnce(()=>{
                Utility.PlayAudioOnId(2053);
            }, at1);

            this.scheduleOnce(()=>{
                Utility.PlayAudioOnId(2054);
            }, at2);
        }
        
        this.scheduleOnce(()=>{
            
        // 
        // GameHelper.TransformLayer("XuanJueAni", 0.5, () => {
        //     if(!this.isValid){
        //         return;
        //     }
            startV = Math.min(1, startV);
            startV = Math.max(0, startV);
            if (this.isClick === false && this.curKeyNode > 0 && v == 0 && this.playing) {
                v = 1;
            }
            // &
            if (this.playing) {
                this.txtCurLv.string = `${Math.floor(startV * 100)}`;
                this.updateMaskValue(1 - startV);

                const targetV = v;

                if (this.mUpdateTween) {
                    this.mUpdateTween.stop();
                    this.mUpdateTween = null;
                }

                this.mUpdateTween = tween({ value: startV })
                    .to(t3, { value: targetV }, {
                        onUpdate: (target?: { value: number; }, ratio?: number) => {
                            if (!this.playing) {
                                console.error("tween is not playing");
                                return;
                            }

                            if (!target) return; // Ensure target is defined
                            this.txtCurLv.string = `${Math.floor(target.value * 100)}`;
                            this.updateMaskValue(1 - target.value);
                        },
                        onComplete: () => {
                            this.playing = false;
                            this.txtCurLv.string = `${Math.floor(v * 100)}`;

                            this.updateMaskValue(1 - v);
                        }
                    })
                    .start();
            }
        }, t1 + t0);
    }

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
            }
            this.rightLv = trCfg.Id;
        }
        this.curKeyNode = trCfg.KeyNode;

        if (PlayerSystem.Instance.CurPlayId > 1) {
            this.rightLv -= PlayerSystem.Instance.CurPlayId * 1000;
        }
    }

    private RefreshGift(): void {
        let curCfg = PlayerSystem.Instance.GetTbTask();
        let tmpID = curCfg!.Id;
        let lastCfg = null;
        while (lastCfg == null) {
            let cfg = ConfigManager.tables.TbTask.get(tmpID);
            if (cfg == null) {
                if (PlayerSystem.Instance.CurPlayId > 1) {
                    lastCfg = ConfigManager.tables.TbTask.get(PlayerSystem.Instance.CurPlayId * 1000 + 1);
                }
                else {
                    lastCfg = ConfigManager.tables.TbTask.get(1);
                }
                break;
            }
            else {
                if (cfg.GiftGroup.length > 0) {
                    lastCfg = cfg;
                    break;
                }
            }
            tmpID--;
        }
        tmpID = curCfg.Id;
        let nextCfg = null;
        while (nextCfg == null) {
            tmpID++;
            let cfg = ConfigManager.tables.TbTask.get(tmpID);
            if (cfg == null) {
                nextCfg = null;
                break;
            }
            else {
                if (cfg.GiftGroup.length > 0) {
                    nextCfg = cfg;
                    break;
                }
            }
        }

        if (nextCfg == null) {
            this.giftRoot.active = false;
            return;
        }
        else {
            this.giftRoot.active = true;
        }

        let totalLv = nextCfg.Id - lastCfg!.Id;
        this.giftLv_1.string = `Lv.${lastCfg!.Id % 1000}`;
        this.giftLv_2.string = `Lv.${nextCfg!.Id % 1000}`;

        this.giftSlider.progress = (curCfg.Id - lastCfg!.Id) / totalLv;
        this.giftProg.progress = (curCfg.Id - lastCfg!.Id) / totalLv;
        this.giftProgLab.string = `${Math.floor((curCfg.Id - lastCfg!.Id) / totalLv * 100)}%`;
        this.giftSlider.enabled = false;
    }

    private Shuffle(list: number[]): number[] {
        const shuffledList = [...list];
        for (let i = shuffledList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
        }
        return shuffledList;
    }


    private async loadImage(urlPath: string, node: Sprite | null) {
        let image = await oops.res.loadAsync<ImageAsset>("UILevelUp", urlPath);
        if (image && node != null) {
            const texture = new Texture2D();
            texture.image = image;

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            node.spriteFrame = spriteFrame;
        }
    }

    private RefLvMask(callback: () => void) {
        //
        var cfg = ConfigManager.tables.TbPlayer.get(PlayerSystem.Instance.CurPlayId);
        if (cfg == null)
            return;

        const imgPath = ConfigManager.tables.TbAtlas.get(cfg?.LvMask)?.Path;
        console.log("mask " + imgPath);
        oops.res.loadAsync<SpriteFrame>("UILevelUp", imgPath + "/spriteFrame").then((sp) => {
            if (this.isValid) {
                this.imgMask.spriteFrame = sp;
                callback();
            }
        });
    }
}

