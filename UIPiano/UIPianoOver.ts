import { _decorator, Component, Node,Label, tween, Animation } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import { Sprite } from 'cc';
import { Slider } from 'cc';
import { TrRhythmGameGK } from '../schema/schema';
import { instantiate } from 'cc';
import { GameData } from "../gameplay/GameDataModel/GameData";
import { MiniGameData } from "../gameplay/GameDataModel/MiniGameData";
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { GameEvent } from '../common/config/GameEvent';
import { ItemEnum } from '../gameplay/GameDataModel/GameEnum';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { TaskSystem } from '../gameplay/Manager/TaskSystem';
import { SliderEffectCtrl } from './SliderEffectCtrl';
const { ccclass, property } = _decorator;

@ccclass('UIPianoOver')
export class UIPianoOver extends CCComp {

    @property(Sprite)
    HeadIcon:Sprite|null = null;
    @property({ type: Sprite })
    EvaIcon: Sprite | null = null;
    @property({ type: Sprite })
    EvaIconTip: Sprite | null = null;
    @property(Label)
    EvaScore:Label|null=null;
    
    @property(Label)
    HeroName:Label=null!;
    @property(Sprite)
    SliderExp:Sprite=null!;
    @property(Node)
    RewardItem:Node=null!;
    @property(Node)
    ContentReward:Node=null!;
    @property(Label)
    rewardLabs: Label[] = [];
    @property(Label)
    TopScore: Label = null!;
    @property(Label)
    HeroLevel: Label = null!;
    @property(Node)
    LevelUpTip:Node  = null!;
    @property(Node)
    Request:Node  = null!;    
    @property(Label)
    ExpAdd:Label=null!;
    @property(Node)
    Rewards:Node=null!;
    @property(Node)
    Title:Node=null!;
    @property(Node)
    Root:Node=null!;
    @property(Node)
    BtnBack:Node=null!;
    @property(Node)
    NewText:Node=null!;
    @property({ type: Animation })
    private RootAnimation: Animation = null!;

    public _tbRhythmGameGK:TrRhythmGameGK|undefined=null!;//
    
    private readonly _openAnimTime = 3.7//
    private readonly _goldLableAnimFrameCount = 33.00//""”“
    private readonly _rewardAnimFrameCount = 29.00//
    private _allScore: number=0;
    private _levelId:number=0;
    private _roleId:number=0;
    private _rewardRatio:number=0;//
    private _oldExp:number=0;
    private _arrNodeState:boolean[] = [];

    protected onLoad(): void {
        //this.setRootState(false)
        this.Root.active = false;
        this.Title.active = true;
        let t1 = 2;
        this.Title.active = true;
        // 1.1
        this.scheduleOnce(() => {
            // 2.2
            //this.setRootState(true)
            this.Root.active = true;
            this.RootAnimation.play();
            //this.Title.active = false;
        }, t1);
    }
    onAdded(data: any) {

        this._allScore = data.allScore
        this._levelId = data.levelId;
        this._roleId = data.roleId;
        this._tbRhythmGameGK = ConfigManager.tables.TbRhythmGameGK.get(this._levelId);

        
        GameData.PlayerData.GlobalData.AddStoryGamePlayCount(this._roleId);
        GameData.SetMiniGameData(this._roleId,this._levelId,this._allScore)
        
        GameData.SaveOpenUICountWithAvatorId(UIID.UIPianoOver, this._roleId);

        UIMusicManager.inst.playUIMusic(UIID.UIPianoOver, 1033);
        this.Rewards.active = false;
        this.BtnBack.active = false;
        this.ContentReward.active = false;
        this.ExpAdd.node.active = false;
        return true;
    }

    start() {
        if (this.EvaScore) {
            this.EvaScore.string = this._allScore.toString();
            this.NewText.active = this._allScore > GameData.GetPianoData_topScore(this._roleId,this._levelId)
            GameData.SetPianoData(this._roleId,this._levelId,this._allScore)
            this.TopScore.string = GameData.GetPianoData_topScore(this._roleId,this._levelId).toString();
        }
        this.SetInfo();
        this.SetEva();
        this.HeroLevel.string =PlayerSystem.Instance.GetPlayerDataById(this._roleId)!.level.toString();
    }

    reset(): void {

    }

    update(deltaTime: number) {
        
    }

    setRootState(show:boolean)
    {
        for (let i = 0; i < this.node.children.length; i++) {
            const element = this.node.children[i];
            element.active = show;
        }
    }

    async SetInfo() {
        let player = PlayerSystem.Instance.GetPlayerData(this._roleId);
        this._oldExp = player.exp;
        const needExp = PlayerSystem.Instance.getNeedExpByRole(this._roleId, player.level);
        const cfg = ConfigManager.tables.TbPlayer.get(this._roleId);
        if (cfg) {
            let spF = await Utility.loadImage("SpritesPiano/" + cfg.settlepicture, "UIPiano");
            if (this.HeadIcon && spF) {
                this.HeadIcon.spriteFrame = spF
            }
            this.HeroName.string = cfg.Name;
            let curExp = PlayerSystem.Instance.GetCurExp(this._roleId);
            this.SliderExp.fillRange = curExp /needExp;
 
        }

        this.SetReward();
    }

    SetEva()
    {
        let aduioId;
        let evaIconSpriteName:string="";
        let evaIconTipSpriteName:string="";
        let arrTotalScore = this._tbRhythmGameGK?.TotalScore!//
        let arrRewardRatio = this._tbRhythmGameGK?.RewardRatio!//
        if (this._allScore>=arrTotalScore[2]) {
            evaIconSpriteName = "music_text_wm";
            evaIconTipSpriteName="music_badge1"
            this._rewardRatio=arrRewardRatio[3]
            aduioId=2014
        }
        else if(this._allScore>=arrTotalScore[1])
        {
            evaIconSpriteName = "music_text_yx";
            evaIconTipSpriteName="music_badge2"
            this._rewardRatio=arrRewardRatio[2]
            aduioId=2014
        }
        else if(this._allScore>=arrTotalScore[0])
        {
            evaIconSpriteName = "music_text_lh";
            evaIconTipSpriteName="music_badge3"
            this._rewardRatio=arrRewardRatio[1]
            aduioId=2014
        }
        else
        {
            evaIconSpriteName = "music_text_jxjy";
            this._rewardRatio=arrRewardRatio[0]
            if (this.EvaIconTip) {
                this.EvaIconTip.node.active=false;
            }
            aduioId=2015
        }
        
        if (this.EvaIcon) {
            this.setSprite(this.EvaIcon, "Sprites/" + evaIconSpriteName + "/spriteFrame", "UIPianoOver");
        }

        if (this.EvaIconTip) {
            this.setSprite(this.EvaIconTip, "Sprites/" + evaIconTipSpriteName + "/spriteFrame", "UIPianoOver");
        }
        
        let audio =ConfigManager.tables.TbAudio.get(aduioId)!;
        oops.audio.playEffect(audio?.Resource, "Audios");
    }

    async SetReward()
    {
        if (!this._tbRhythmGameGK) {
            return;
        }

        let hasItem1 = false;
        let hasItem2 = false;
        let expRewardValue = 0;//+

        for (const iterator of this._tbRhythmGameGK.MusicalReward) {
            let rewardId = iterator[0]; // ID
            let rewardValue = iterator[1] * this._rewardRatio / 100; // 

            let roleId = GameData.getRoleIdByCurrency(rewardId);
            const playerCfg = ConfigManager.tables.TbPlayer.get(roleId);
            if(Math.floor(rewardId / 10000000) === 2)//
            {
                let rewardNum_1 = rewardValue;//
                let mRate = GameData.GetConstellationHeartAddByRoleId(roleId);//
                let mzsExpValue = Math.round(rewardNum_1 * mRate); //    
                expRewardValue = rewardNum_1 + mzsExpValue;
                this.rewardLabs[0].string = "+" + rewardNum_1.toString();
                this.rewardLabs[1].string = "+" + mzsExpValue.toString();
                hasItem1 = true;
            }
            else if(rewardId == playerCfg?.ItemId)//
            {          
                this.refreshItem(rewardId, rewardValue, "");
                this.refreshItem(rewardId, GameData.getLevelBaseBouns(roleId) * rewardValue, "");
                hasItem2 = true;
            }            
            GameData.updateCurrency(rewardId, rewardValue);
            if(rewardId > ItemEnum.ExpClass && rewardId < ItemEnum.ExpEnd){
                SdkManager.inst.event("sense_get_map", {userid: roleId, sense_get_map:Math.ceil(rewardValue),sense_get_map_where:1});
            }
        }
        
        this.ExpAdd.string = `+${expRewardValue}`
        this.setUiAnim();
        
        if (!hasItem1) {
            console.error('1');
        }
        if (!hasItem2) {
            console.error('2');
        }
    }    
    
    private async refreshItem(type: number, value: number, nameStr: string): Promise<void> { 
        value = Math.round(value);
        let cloneObj = instantiate(this.RewardItem)
        cloneObj.setParent(this.ContentReward)
     
        const cfg = ConfigManager.tables.TbItem.get(type)!;
        let spF = await Utility.loadImage(cfg.Icon, "CommonRes");
        if (spF) {
            let nodeIcon:Node = cloneObj.getChildByName("RewardIcon")!;
            let nodeIconSprite:Sprite = nodeIcon.getComponent(Sprite)!;
            nodeIconSprite.spriteFrame = spF

            let nodeVlaue:Node = cloneObj.getChildByName("RewardValue")!;
            let nodeVlaueLable:Label = nodeVlaue.getComponent(Label)!;
            nodeVlaueLable.string = value.toString();
            
            let nodeName:Node = cloneObj.getChildByName("RewardName")!;
            let nodeNameLable:Label = nodeName.getComponent(Label)!;
            nodeNameLable.string = nameStr.toString();
        }

        cloneObj.on(Node.EventType.TOUCH_END,()=>
        {
            Utility.OpenItemTips(type, cloneObj);
        });
    }
    private setUiAnim()
    {
        let player = PlayerSystem.Instance.GetPlayerData(this._roleId);
        let curLv = PlayerSystem.Instance.GetCurExp(this._roleId);

        this.scheduleOnce(()=>{
            this.Rewards.active = true;
            const needExp = PlayerSystem.Instance.getNeedExpByRole(this._roleId, player.level);
            const curExp = curLv > needExp ? needExp : curLv;
            this.ExpAdd.node.active = true;
            tween(this.SliderExp).to(1,{fillRange:curExp/needExp},{
                onComplete:()=>{
                    this.SliderExp.getComponent(SliderEffectCtrl)!.Effect_Trail.active = false;
                    if (curExp >= needExp) {
                        let canLevelUp = TaskSystem.Instance.CheckCompleteAllTask()
                        this.ExpAdd.getComponent(Animation)?.play("ExpAddAnim");
                        this.scheduleOnce(()=>{
                            let Requestlab =  this.Request.getComponent(Label)!;
                            if(this._roleId != PlayerSystem.Instance.CurPlayId){
                                //npc
                                this.LevelUpTip.active = false;
                                this.Request.active = true;
                                Requestlab.string = ""; 
                            }
                            else{
                                this.LevelUpTip.active = canLevelUp;
                                this.Request.active = !canLevelUp;
                                Requestlab.string = ""; 
                            }
                        }, 16/60);
                    }
                    else  {
                        this.LevelUpTip.active = false;
                        this.Request.active = false;
                    }

                    if (GameData.GetGuideStep() >= 2020) {
                        this.scheduleOnce(() => {
                            oops.gui.openAsync(UIID.UIConstellationNotice, { roleId: this._roleId })
                        },0.5);
                    }
                }
            }).start(); 

            this.scheduleOnce(() => {
                this.ContentReward.active = true
                for (let i = 0; i < this.ContentReward.children.length; i++) {
                    const element = this.ContentReward.children[i];
                    this.scheduleOnce(() => {
                        element.active = true;
                    }, 0.2*i);
                }
            }, (this._goldLableAnimFrameCount) / 60);
        }, this._openAnimTime);

        this.scheduleOnce(()=>{
            this.BtnBack.active = true
        }, this._openAnimTime + (this._goldLableAnimFrameCount + this._rewardAnimFrameCount) / 60);

    }

    OnBtnBack_Click()
    {
        oops.gui.remove(UIID.UIPianoOver)
        PlayerSystem.Instance.TryLevelUp();
        oops.message.dispatchEvent(GameEvent.StoryPlayOver);
    }
}


