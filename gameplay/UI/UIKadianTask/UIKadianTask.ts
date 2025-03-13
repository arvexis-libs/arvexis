import { Button, Color } from "cc";
import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { PlayerSystem } from "../../Manager/PlayerSystem";
import { Node } from "cc";
import { GameData } from "../../GameDataModel/GameData";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { TaskType } from "../../GameDataModel/TaskType";
import { Utility } from "../../Utility/Utility";
import { ADEnum } from "../../Manager/GameDot";
import { GameEvent } from "../../../common/config/GameEvent";
import { ProgressBar } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../../../common/config/GameUIConfig";
import { TrTaskAway } from "../../../schema/schema";
import { Animation } from "cc";
import { SpriteFrame } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class UIKadianTask  extends GameComponent {
    @property(Button)
    startButton: Button = null!;

    @property(Button)
    closeBtn: Button = null!;

    @property(Node)
    defaultShow: Node = null!;

    @property(Node)
    buyShow: Node = null!;

    @property(Label)
    defaultButtonLabel: Label = null!;

    @property(Node)
    defaultItem1: Node = null!;
    @property(Node)
    defaultItem2: Node = null!;

    @property(Sprite)
    defaultItemIcon1: Sprite = null!;
    @property(Sprite)
    defaultItemIcon2: Sprite = null!;
    @property(Label)
    defaultItemCnt1: Label = null!;
    @property(Label)
    defaultItemCnt2: Label = null!;

    @property(Sprite)
    defaultCenterIcon: Sprite = null!;

    @property(Label)
    leftTime: Label = null!;    //
    @property(Button)
    ADButton: Button = null!;
    @property(Button)
    costButtom: Button = null!;

    @property(Node)
    costItemParent: Node = null!;

    @property(Sprite)
    costItemIcon: Sprite = null!;
    @property(Label)
    costItemCnt: Label = null!;

    @property(Label)
    costSpeedTime:Label = null!;
    @property(Label)
    adSpeedTime:Label = null!;

    @property(ProgressBar)
    proValue: ProgressBar = null!;

    @property(Array(Node))
    roleAniNode: Node[] = [];
   
    private cfg_TaskAway: TrTaskAway = null!;
    private timer: number = 0;
    private readonly adenum: ADEnum=ADEnum.Shop_adv;


    public mTaskObj:Node=null!;
    onLoad() {
        this.mTaskObj = this.startButton.node;
    }

    onEnable() {
        this.timer = 0;
        this.getCurCfg();
        //this.refreshIcon(GameData.GetIconPathByADEnum(this.adenum));

        if (!this.cfg_TaskAway) {
            this.onClickClose();
            return;
        }

        const isDone = PlayerSystem.Instance.CurTaskAwayTimeStamp === 0;

        if (!PlayerSystem.Instance.IsStartAwayTask || isDone) {
            this.showDefaultUI();
        } else {
            this.showBuyUI();
        }
        this.on(GameEvent.OnTaskAwayDone,this.OnTaskAwayDone,this);
    }

    update(dt: number) {
        if (!PlayerSystem.Instance.IsStartAwayTask) return;
        if (PlayerSystem.Instance.CurTaskAwayTimeStamp <= 0)
        {
            return;
        }


        const time = PlayerSystem.Instance.CurTaskAwayTimeStamp;
        if (time <= 0) return;

        this.timer += dt;
        if (this.timer >= 1) {
            this.timer = 0;
            this.refreshTime();
        }
    }

    onDisable() 
    {
        this.off(GameEvent.OnTaskAwayDone);
    }
    private OnTaskAwayDone()
    {
        this.showDefaultUI();

        this.scheduleOnce(()=>{
          oops.gui.openAsync(UIID.UIConstellationNotice, {roleId:PlayerSystem.Instance.CurPlayId});
        },1);
    }

    private getCurCfg() {
        const taskCfg = PlayerSystem.Instance.GetTbTask();
        if (!taskCfg) return;
        for (let i = 0; i < taskCfg.EventId.length; i++) {
            const events = taskCfg.EventId[i].split('|');
            for (let j = 0; j < events.length; j++) {
                if (parseInt(events[j]) === TaskType.KaDian) {
                    this.cfg_TaskAway = ConfigManager.tables.TbTaskAway.get(parseInt(taskCfg.EventParam[i].split('|')[j]))!;
                    return;
                }
            }
        }
                
    }

    private showDefaultUI() {

        this.defaultShow.active = true;
        this.buyShow.active = false;
        const isDone = PlayerSystem.Instance.CurTaskAwayTimeStamp === 0;
        if(!PlayerSystem.Instance.IsStartAwayTask){
            this.showWaitStart();
        }
        else{
            this.showWaitClaim();
        }
    }

    /**
     * 
     */
    private showWaitStart(){
        let costType = this.cfg_TaskAway.Type; 
        let costNum = this.cfg_TaskAway.Piece;

        this.defaultButtonLabel.string = "";
        this.defaultItem1.active = this.cfg_TaskAway.Piece > 0;
        this.defaultItem2.active = false;
        let itemConfig = ConfigManager.tables.TbItem.get(costType)!;
        //this.setSprite(this.defaultItemIcon1, itemConfig.Icon + "/spriteFrame", "CommonRes");
        oops.res.loadAsync<SpriteFrame>("CommonRes", itemConfig.Icon + "/spriteFrame").then((sp)=>{
            if(this.isValid){
                this.defaultItemIcon1.spriteFrame = sp;
            }
        });
        this.defaultItemCnt1.string = costNum.toString();
        if(this.cfg_TaskAway.ImageStart != ""){
            //this.setSprite(this.defaultCenterIcon, this.cfg_TaskAway.ImageStart + "/spriteFrame", "UIKaDianTask");
            oops.res.loadAsync<SpriteFrame>("UIKaDianTask", this.cfg_TaskAway.ImageStart + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.defaultCenterIcon.spriteFrame = sp;
                }
            });
        }
    }

    private showWaitClaim(){

        if(this.cfg_TaskAway.ImageEnd != ""){
            //this.setSprite(this.defaultCenterIcon, this.cfg_TaskAway.ImageEnd + "/spriteFrame", "UIKaDianTask");
            oops.res.loadAsync<SpriteFrame>("UIKaDianTask", this.cfg_TaskAway.ImageEnd + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.defaultCenterIcon.spriteFrame = sp;
                }
            });
        }

        if(this.cfg_TaskAway.RewardType.length > 0){
            this.defaultButtonLabel.string = ""; 
        }
        else{
            this.defaultButtonLabel.string = "";
        }
        let rewardCnt = this.cfg_TaskAway.RewardType.length;
        rewardCnt = rewardCnt > 2 ? 2 : rewardCnt;
        if(rewardCnt == 0){
            this.defaultItem2.active = false;
            this.defaultItem1.active = false;
        }
        else if(rewardCnt == 1){
            this.defaultItem2.active = false;
            this.defaultItem1.active = true;

            let itemConfig = ConfigManager.tables.TbItem.get(this.cfg_TaskAway.RewardType[0])!;
            //this.setSprite(this.defaultItemIcon1, "Sprites/" + itemConfig.Icon + "/spriteFrame", "CommonRes");

            oops.res.loadAsync<SpriteFrame>("CommonRes", itemConfig.Icon + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.defaultItemIcon1.spriteFrame = sp;
                }
            });

            this.defaultItemCnt1.string = this.cfg_TaskAway.RewardNum[0].toString();
        }
        else if(rewardCnt == 2){
            this.defaultItem2.active = true;
            this.defaultItem1.active = true;

            let itemConfig = ConfigManager.tables.TbItem.get(this.cfg_TaskAway.RewardType[0])!;
            //this.setSprite(this.defaultItemIcon1, "Sprites/" + itemConfig.Icon + "/spriteFrame", "CommonRes");
            oops.res.loadAsync<SpriteFrame>("CommonRes", itemConfig.Icon + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.defaultItemIcon1.spriteFrame = sp;
                }
            });

            this.defaultItemCnt1.string = this.cfg_TaskAway.RewardNum[0].toString();

            itemConfig = ConfigManager.tables.TbItem.get(this.cfg_TaskAway.RewardType[1])!;
            //this.setSprite(this.defaultItemIcon2, "Sprites/" + itemConfig.Icon + "/spriteFrame", "CommonRes");
            oops.res.loadAsync<SpriteFrame>("CommonRes", itemConfig.Icon + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.defaultItemIcon2.spriteFrame = sp;
                }
            });
            this.defaultItemCnt2.string = this.cfg_TaskAway.RewardNum[1].toString();
        }   

    }

    private showBuyUI() {

        this.defaultShow.active = false;
        this.buyShow.active = true;
        let aniNode = null;
        for(let i = 0; i < this.roleAniNode.length; i++){
            this.roleAniNode[i].active = false;
            if(i + 1 == PlayerSystem.Instance.CurPlayId){
                this.roleAniNode[i].active = true;
                aniNode = this.roleAniNode[i];
            }
        }
        if(aniNode){
            let anim = aniNode.getComponentInChildren(Animation) as Animation;
            anim.play();
        }
        //this.setSignAnim();
        this.refreshSpeedButtons();    
        this.refreshTime();

        if (PlayerSystem.Instance.CurTaskAwayTimeStamp <= 0) {
            this.proValue.progress = 1;
        }
    }

    private refreshSpeedButtons() {

        if(this.cfg_TaskAway.ConsumeType == 0){
            this.costButtom.node.active = false;
            this.costItemParent.active = false;
        }
        else{
            this.costButtom.node.active = true;
            this.costItemParent.active = true;

            let itemConfig = ConfigManager.tables.TbItem.get(this.cfg_TaskAway.ConsumeType)!;
            
            oops.res.loadAsync<SpriteFrame>("CommonRes", itemConfig.Icon + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.costItemIcon.spriteFrame = sp;
                }
            });

            this.costItemCnt.string = this.cfg_TaskAway.ConsumeNum.toString();
            var cost = GameData.getCurrency(this.cfg_TaskAway.ConsumeType)
            this.costItemCnt.color = cost < this.cfg_TaskAway.ConsumeNum ? Color.RED : new Color(103,84,59,255);
    
            this.costSpeedTime.string = `${this.cfg_TaskAway.ConsumeTime}`;
        }

        if(this.cfg_TaskAway.ADTime == 0){
            this.ADButton.node.active = false;

        }
        else{
            this.ADButton.node.active = true;
            this.adSpeedTime.string = `${this.cfg_TaskAway.ADTime}`;
        }
   
    }

    private setSignAnim() {
        //const addScale = this.cfg_TaskAway.Time * 30;
        //this.signAnim.speed = 1 / addScale;
        //const remindTime = PlayerSystem.Instance.CurTaskAwayTimeStamp - Date.now() / 1000;
        //const curPos = Math.max(0, 1 - (remindTime / (this.cfg_TaskAway.Time * 60)));
        // this.signAnim.play('TaskAwayMoveAnim');
        // this.signAnim.setCurrentTime(curPos * this.signAnim.getClips()[0].duration);
    }

    private refreshTime() {
        let remindTime = PlayerSystem.Instance.CurTaskAwayTimeStamp - Date.now() / 1000;
        remindTime = Math.max(0, remindTime);

        const timeStr = this.getTimeFormatHHMMSS(Math.floor(remindTime));
        this.leftTime.string = timeStr;

        this.proValue.progress = Math.max(0, 1 - (remindTime / (this.cfg_TaskAway.Time * 60)));
    }

    private getTimeFormatHHMMSS(seconds: number): string {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    private onClickStart() {

        if(!PlayerSystem.Instance.IsStartAwayTask){
            this.startKaDian();
        }
        else{
            this.claimReward();
        }
    }

    private startKaDian(){
        if (PlayerSystem.Instance.IsStartAwayTask) return;

        // GameData.updateCurrency(this.cfg_TaskAway.Type, 10000000);

        let leftCurrency = GameData.getCurrency(this.cfg_TaskAway.Type);
        if(leftCurrency < this.cfg_TaskAway.Piece){
            oops.gui.toast("");
            return;
        }
        else{
            GameData.updateCurrency(this.cfg_TaskAway.Type, -this.cfg_TaskAway.Piece);
        }

        PlayerSystem.Instance.IsStartAwayTask = true;
        PlayerSystem.Instance.CurTaskAwayTimeStamp = Date.now() / 1000 + this.cfg_TaskAway.Time * 60;
        this.showBuyUI();
    }

    private claimReward(){
        if (PlayerSystem.Instance.CurTaskAwayTimeStamp !== 0) return;

        PlayerSystem.Instance.CurTaskAwayTimeStamp = -1;

        //
        if(this.cfg_TaskAway.RewardType.length > 0){
            GameData.updateCurrencys(this.cfg_TaskAway.RewardType, this.cfg_TaskAway.RewardNum);
        }

        this.onClickClose();
        PlayerSystem.Instance.TryLevelUp();
        oops.message.dispatchEvent(GameEvent.RefreshHomeView);
    }

    private onClickAD() {
        
        if (PlayerSystem.Instance.CurTaskAwayTimeStamp > 0) {
            PlayerSystem.Instance.CurTaskAwayTimeStamp -= this.cfg_TaskAway.ADTime * 60; // 30 * 60
        }
        this.refreshTime();
    }

    private onClickCost() {


        if (PlayerSystem.Instance.CurTaskAwayTimeStamp > 0) {

            let leftCurrency = GameData.getCurrency(this.cfg_TaskAway.ConsumeType);
            if(leftCurrency < this.cfg_TaskAway.ConsumeNum){
                oops.gui.open(UIID.UIGetItem);
                oops.gui.toast("");
                return;
            }
            else{
                GameData.updateCurrency(this.cfg_TaskAway.ConsumeType, -this.cfg_TaskAway.ConsumeNum);
            }


            PlayerSystem.Instance.CurTaskAwayTimeStamp -= this.cfg_TaskAway.ConsumeTime * 60;
        }
        this.refreshTime();
    }

    private onClickClose() {
        oops.gui.remove(UIID.UIKadianTask);
    }
}

