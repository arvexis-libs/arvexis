import { Sprite, tween } from 'cc';
import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { UIConfigData, UIID } from '../common/config/GameUIConfig';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import ConfigManager from '../manager/Config/ConfigManager';
import { SpriteFrame } from 'cc';
import { Utility } from '../gameplay/Utility/Utility';
import { Label } from 'cc';
import { forEach } from 'jszip';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { Slider } from 'cc';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { GuideManager } from '../UIGuide/GuideManager';
import { GameHelper } from '../gameplay/GameTool/GameHelper';
import { FunctionOpenSystem } from "db://assets/script/game/gameplay/Manager/FunctionOpenSystem";
import { UIHome } from '../UIHome/UIHome';
import { GameDot } from '../gameplay/Manager/GameDot';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { GameEvent } from '../common/config/GameEvent';
import { Animation } from 'cc';
import { TapSystem } from '../gameplay/Manager/TapSystem';
import { TaskSystem } from '../gameplay/Manager/TaskSystem';
import { UIMusicManager } from '../gameplay/Manager/UIMusicManager';
const { ccclass, property } = _decorator;

@ccclass('UIStoryReward')
export class UIStoryReward extends CCComp {

    @property({ type: Sprite })
    private icon: Sprite = null!;
    @property({ type: Node })
    private closeBtn: Node = null!;
    @property({ type: Label })
    private name1: Label = null!;
    @property({ type: Label })
    private name2: Label = null!;
    @property({ type: Node })
    private item1: Node = null!;
    @property({ type: Node })
    private item2: Node = null!;

    @property(Label)
    HeroName: Label = null!;
    @property(Label)
    HeroLv: Label = null!;
    @property(Slider)
    SliderExp: Slider = null!;
    @property(Label)
    HeroNum: Label = null!;
    @property(Sprite)
    bar: Sprite = null!;
    @property(Label)
    rewardLabs: Label[] = [];

    @property({ type: Node })
    private Root: Node = null!;
    @property({ type: Animation })
    private RootAnimation: Animation = null!;
    @property({ type: Node })
    private Title: Node = null!;

    @property({ type: Node })
    private lvup: Node = null!;
    @property(Label)
    private lvDes1: Label = null!;
    @property(Label)
    private lvDes2: Label = null!;

    @property({ type: Node })
    private Effect_Trail: Node = null!;
    

    private curAwardType: number[] = [];
    private curAwardValue: number[] = [];
    private showHeart: boolean = false;
    private addHeartNum: number = 0;
    private rewardNum_1: number = 0;
    private rewardNum_3: number = 0;
    private rewardNum_2: number = 0;
    private oldExp : number = 0;
    private toFill : number = 0;
    private playing: boolean = false;

    reset(): void {

    }
    protected onLoad(): void {
        UIMusicManager.inst.playUIMusic(UIID.UIStoryReward, 1032);
        this.closeBtn.on(Button.EventType.CLICK, this.onClose, this);
        this.refresh();

        this.playing = true;
        this.scheduleOnce(() => {
            this.playing = false;
        }, 3);

        let t1 = 2;
        let t2 = 1;
        let t3 = 1;
        let t4 = 16/60;
        this.Title.active = true;
        Utility.PlayAudioOnId(2050);
        // 1.1
        this.scheduleOnce(() => {
            // 2.2
            Utility.PlayAudioOnId(2049);
            this.Title.active = false;
            this.Root.active = true;
            this.RootAnimation.play();
            this.scheduleOnce(() => {
                let firstType = this.curAwardType[0];
                let roleId = GameData.getRoleIdByCurrency(firstType);
                if (GameData.GetGuideStep() >= 2020) {
                    oops.gui.openAsync(UIID.UIConstellationNotice, { roleId: roleId });
                }
            }, t2 + t3);

            // 
            this.Effect_Trail.active = false;
            let firstType = this.curAwardType[0];
            let roleId = GameData.getRoleIdByCurrency(firstType);
            let player = PlayerSystem.Instance.GetPlayerData(roleId);
            let maxExp = PlayerSystem.Instance.GetCurExp(roleId) >= PlayerSystem.Instance.getNeedExpByRole(roleId, player.level);
            if (!maxExp) {
                this.Effect_Trail.active = true;
                tween(this.bar).to(t3,{fillRange : this.toFill}).start();
                tween(this.SliderExp).to(t3,{progress : this.toFill}).start();
            }
            else {
                this.SliderExp.progress = this.toFill;
                this.bar.fillRange = this.toFill;
            }

            this.scheduleOnce(() => {
                let curLv = player.level;
                const lvup = TaskSystem.Instance.CheckCompleteAllTask();
                PlayerSystem.Instance.TryLevelUp();
                let newLv = player.level;

                this.lvDes1.string = '+' + this.addHeartNum;
                this.lvDes1.node.active = true;

                this.scheduleOnce(() => {
                    if (curLv < newLv) {
                        // 
                        this.lvup.active = true;
                        this.lvDes1.string = '';
                        this.lvDes1.node.active = true;
                    }
                    else {
                        if (!lvup && maxExp) { 
                            this.lvDes1.node.active = false;
                            // 
                            this.lvDes2.node.active = true;
                            if(roleId != PlayerSystem.Instance.CurPlayId){
                                this.lvDes2.string = "";
                            }
                            else{
                                this.lvDes2.string = "";
                            }
                        }
                        else { 
                        }
                    }
                }, t4);
            }, t3);

            if (this.curAwardType.length > 0) {
                this.item1.active = true;
                this.item1.getComponent(Animation)?.play();
            }

            if (this.curAwardType.length > 1) {
                this.scheduleOnce(() => {
                    this.item2.active = true;
                    this.item2.getComponent(Animation)?.play();
                }, 0.2);
            }
        }, t1);

        StorySystem.Instance.hideMask();
    }

    onAdded(data: any) {
        this.curAwardType = data.awardType;
        this.curAwardValue = data.awardValue;
        
        // 
        for (let i = 0; i < this.curAwardType.length; i++) {
            const type = this.curAwardType[i];
            const value =  this.curAwardValue[i];

            let roleId = GameData.getRoleIdByCurrency(type);
            let player = PlayerSystem.Instance.GetPlayerData(roleId);
            //
            this.oldExp = player.exp;
            GameData.updateCurrency(type, value);

            if (Math.floor(type / 10000000) === 2) {
                this.showHeart = true;
                this.addHeartNum += value;

                this.rewardNum_1 = value;//
                //this.rewardNum_3 = GameData.getLevelBaseBouns(roleId);//
                let mRate = GameData.GetConstellationHeartAddByRoleId(roleId);//
                this.rewardNum_2 = Math.round((this.addHeartNum + this.rewardNum_3) * mRate) //
                this.addHeartNum += this.rewardNum_2;

                SdkManager.inst.event("sense_get_map", {userid: roleId, sense_get_map: Math.ceil(value),sense_get_map_where:0});
            }
        }

     
        return true;
    }

    start() {

    }


    private onClose(): void {
        if (this.playing) {
            return;
        }

        try {
            oops.gui.remove(UIID.UIConstellationNotice)
        } catch (error) {
        }

        oops.gui.remove(UIID.UIStoryReward)
        oops.gui.openWait();
        FunctionOpenSystem.Instance.CheckCondition();
        FunctionOpenSystem.Instance.ShowOpenFunction(()=>
        {
            if (GameData.GetGuideStep() == 1050) {

                //1050
                //GameHelper.TransformLayer("HeiPingZhuanChang", 0.5, () => {
                    oops.gui.remove(UIID.UIBigCityMap);
                    oops.gui.get(UIID.UIHome).getComponent(UIHome)?.ShowGuide();
                //});
            }
        });
        
        StorySystem.Instance.isInStoryReward = false;
    }


    private async refresh() {
        
        let firstType = this.curAwardType[0];
        let roleId = GameData.getRoleIdByCurrency(firstType);
        let player = PlayerSystem.Instance.GetPlayerData(roleId);
        const needExp = PlayerSystem.Instance.getNeedExpByRole(roleId, player.level);

        const cfg = ConfigManager.tables.TbPlayer.get(roleId);
        let hasItem = false;
        for (let i = 0; i < this.curAwardType.length; i++) {
            const type = this.curAwardType[i];
            const value = this.curAwardValue[i];

            if (type == cfg?.ItemId) {
                hasItem = true;
                this.refreshItem(this.item1, type, value, "");
                this.refreshItem(this.item2, type, GameData.getLevelBaseBouns(roleId) * value, "");
            }
        }
        if (!hasItem) {
            console.error('');
        }

        if (cfg) {
            let spF = await Utility.loadImage("Sprites/" + cfg.settlepicture, "UIStoryReward");
            if (spF) {
                this.icon.spriteFrame = spF
            }

            this.name1.string = cfg.Name;
            this.name2.string = cfg.NickName;
        }
        else
        {
            return;
        }
        // 
        if  (this.showHeart && player) {
            this.HeroName.string = cfg.Name;
            this.HeroLv.string = player.level.toString();
            this.HeroNum.string = "+" + this.addHeartNum.toString();
            this.rewardLabs[0].string = "+" + this.rewardNum_1.toString();
            this.rewardLabs[1].string = "+" + this.rewardNum_2.toString();
            //this.rewardLabs[2].string = "+" + this.rewardNum_3.toString();
            
            //todo

            const curExp = PlayerSystem.Instance.GetCurExp(roleId) > needExp ? needExp : PlayerSystem.Instance.GetCurExp(roleId);
            this.toFill = curExp/needExp;
            if (this.toFill > this.oldExp/needExp) {
                this.bar.fillRange = this.oldExp/needExp;
            }
        }
    }

    private async refreshItem(go: Node, type: number, value: number, nameStr: string): Promise<void> {
        value = Math.round(value);
        const name = go.getChildByName("name")!.getComponent(Label)!;
        const num = go.getChildByName("num")!.getComponent(Label)!;
        const icon = go.getChildByName("icon")!.getComponent(Sprite)!;

        const cfg = ConfigManager.tables.TbItem.get(type)!;
        name.string = nameStr;
        num.string = `+${Utility.FormatBigNumber(value)}`;
        let spF = await Utility.loadImage(cfg.Icon, "CommonRes");
        if (spF) {
            icon.spriteFrame = spF
        }
        // go.active = true;

        go.on(Node.EventType.TOUCH_END,()=>
        {
            Utility.OpenItemTips(type, go);
        });
    }
}





