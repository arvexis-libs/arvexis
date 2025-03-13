import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { instantiate } from 'cc';
import { Prefab } from 'cc';
import { UIConstellationItem } from './UIConstellationItem';
import { RichText } from 'cc';
import { Button } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { ConstellationTool } from './ConstellationTool';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import { changeSpriteImage } from '../common/UIExTool';
import { Utility } from '../gameplay/Utility/Utility';
import { GameEvent } from '../common/config/GameEvent';
import { Game } from 'cc';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { Animation } from 'cc';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { GuideManager } from '../UIGuide/GuideManager';
const { ccclass, property } = _decorator;
enum UnlockState {
    None = 0,
    NoEnoughItem,
    CanUnlock,
    UnlockedNoUse,
    Unlocked,
}

@ccclass('UIConstellation')
export class UIConstellation extends CCComp {

    @property(Sprite)
    spBg: Sprite = null!;
    @property(Label)
    labTotalStarCount: Label = null!;
    @property(Label)
    labHeart: Label = null!;
    @property(Node)
    itemNodeParent: Node = null!;

    @property(Sprite)
    spItemIcon: Sprite = null!;
    @property(Label)
    labItemCount: Label = null!;
    @property(Sprite)
    topSpIcon: Sprite = null!;
    @property(Label)
    topLabCount: Label = null!;
    @property(Label)
    topLabCostCount: Label = null!;
    @property(Animation)
    animCount: Animation = null!;
    @property(Button)
    topBtnAdd: Button = null!;

    //#region 
    @property(Label)
    labName: Label = null!;
    @property(Label)
    labPlotName: Label = null!;
    @property(Label)
    labUnlockTips: Label = null!;
    @property(Node)
    bottomAddNode: Node = null!;
    @property(Label)
    labAddHeart: Label = null!;
    @property(Sprite)
    spAddHeart: Sprite = null!;
    
    @property(Node)
    btnSeeStoryNode: Node = null!;
    @property(Sprite)
    spBtnCanNotSee: Sprite = null!;
    @property(Node)
    unlockTagNode: Node = null!;
    @property(Node)
    unlockTipsNode: Node = null!;
    @property(RichText)
    richTextCostItemText: RichText = null!;
    @property(Sprite)
    spCostItemIcon: Sprite = null!;
    @property(Animation)
    animBottom: Animation = null!;

    //#endregion 

    private _roleId: number = 0;
    private _itemCell: UIConstellationItem | null = null;
    private _isCreatingItem: boolean = false;
    // id
    private _isJustStarUp: boolean = false;
    private _selectStarId: number = 0;
    private __onClickStarBackBind: Function = null!;

    reset(): void {
        
    }

    /**
     * 
     * @param args  roleId 
     * starId
     * @returns 
     */
    onAdded(args: any) {        
        let targetStarId = -1;
        if(args.starId) {
            targetStarId = args.starId;
        }
        this._roleId = 0;
        if(args.roleId) {
            this._roleId = args.roleId;
        }
        if(this._roleId == 0 && targetStarId > 0) {
            const cfg = ConfigManager.tables.TbStarSingle.get(targetStarId);
            if(cfg) {
                this._roleId = cfg.RoleId;
            }
        }

        return true;
    }

    protected onLoad(): void {
        this.__onClickStarBackBind = this._onClickStarBack.bind(this);
    }

    protected onEnable(): void {
        oops.message.on(GameEvent.OnItemValueChanged, this._itemChange, this);
        oops.message.on(GameEvent.ConstellationStarUp, this._starUp, this);
        oops.message.on(GameEvent.ConstellationLevelUp, this._levelUp, this);
    }

    protected onDisable(): void {
        oops.message.off(GameEvent.OnItemValueChanged, this._itemChange, this);
        oops.message.off(GameEvent.ConstellationStarUp, this._starUp, this);
        oops.message.off(GameEvent.ConstellationLevelUp, this._levelUp, this);        
    }

    start() {
        if(this._itemCell) {
            this._itemCell.destroy();
            this._itemCell = null;
        }
        this.topLabCostCount.node.active = false;
        this._isCreatingItem = false;
        this.animBottom.node.active = false;
        this._updateAll();
        this.ShowGuide();
        /*
        const playerCfg = ConfigManager.tables.TbPlayer.get(this._roleId);
        if(playerCfg == undefined) {
            return;
        }
        GameData.updateCurrency(playerCfg.ItemId,20000);
        */
    }
        ShowGuide()
        {
            GuideManager.Instance.TryShowGuide(2022, [this.spBtnCanNotSee.getComponent(Button)!], ()=>{}, () => {},()=>{},[],[this.spBtnCanNotSee.node!]);
        }

    private _updateAll() {
        this._updateTopInfo();
        this._updateStars();
    }

    /**
     * 
     */
    private _itemChange() {
        this._updateTopInfo();
    }

    /**
     * 
     * @param event 
     * @param roleId 
     */
    private _levelUp(event: string, roleId: number) {
        if(this._itemCell) {
            this._itemCell.destroy();
            this._itemCell = null;
        }
        const stageData = GameData.GetConstellationDataByRoleId(this._roleId);
        if(stageData) {
            this._selectStarId = stageData.NextStarId();
        }
        this._updateAll();

        oops.gui.open(UIID.UIConstellationLevelUp);
    }

    /**
     * 
     * @param event 
     * @param roleId 
     * @param starId 
     * @returns 
     */
    private _starUp(event: string, roleId: number, starId: number) {
        if(roleId != this._roleId) {
            return;
        }
        console.log("_starUp _isJustStarUp:%s, roleId:%s, starId:%s",this._isJustStarUp, roleId, starId);

        this._isJustStarUp = true;
        const stageData = GameData.GetConstellationDataByRoleId(this._roleId);
        if(stageData) {
            this._selectStarId = stageData.NextStarId();
            if(this._selectStarId == 0) {
                this._selectStarId = stageData?.StarData.Id;
            }
        }        
        
        this._updateAll();
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg == undefined) {
            return;
        }

        oops.gui.open(UIID.UIConstellationStarUp, cfg.Name);
    }

    private _starUpOnCostItem(beforeCount: number) {
        this.topLabCostCount.node.active = true;
        this.topLabCostCount.string = Utility.FormatBigNumber(beforeCount);
        this.animCount.play();
    }

    /**
     * 
     * @returns 
     */
    private _updateTopInfo() {
        const data = GameData.GetConstellationDataByRoleId(this._roleId);
        if(data == undefined) {
            console.error("no find data:" + this._roleId);
            return;
        }

        this.labTotalStarCount.string = ":" + GameData.GetConstellationUnlockTotalStarByRoleId(this._roleId) + "/" + data.TotalStarCount;//data.Level + "/" + ConfigManager.tables.TbConst.get("ConstellationMaxLevel")?.Int || "0";
        this.labHeart.string = ":" +  (data.HeartAddRate * 100).toFixed(0) + "%";
        //data.HeartAddRate.toFixed(2);//GameData.GetConstellationUnlockTotalStarByRoleId(this._roleId) + "/" + data.TotalStarCount;

        const playerCfg = ConfigManager.tables.TbPlayer.get(this._roleId);
        if(playerCfg == undefined) {
            return;
        }
        const itemCfg = ConfigManager.tables.TbItem.get(playerCfg.ItemId);
        if(itemCfg == undefined) {
            return;
        }
        changeSpriteImage(this.topSpIcon, itemCfg.Icon, itemCfg.BundleName);
        this.topLabCount.string = Utility.FormatBigNumber(GameData.getCurrency(playerCfg.ItemId)); 
    }

    /**
     * 
     */
    private async _updateStars() {        
        const stageData = GameData.GetConstellationDataByRoleId(this._roleId);
        if(stageData == undefined) {
            return;
        }
        console.log("_updateStars_isJustStarUp:%s ",this._isJustStarUp);   
        let nextId = 0;
        if(this._isJustStarUp) {
            nextId = stageData.StarData.Id;
            this._isJustStarUp = false;
        }
        if(this._selectStarId == 0) {
            this._selectStarId = stageData.NextStarId();
        }

        if(this._itemCell) {
            this._itemCell.onInit(this._roleId, this.__onClickStarBackBind, this._selectStarId, nextId);
            this._updateDialogTips();
            return;
        }

        const cfg = stageData.Cfg();
        if(cfg == null) {
            return;
        }
        console.log(`cfg.Prefab:${cfg.Prefab},roleID:${this._roleId}`);
        if(this._itemCell == null && this._isCreatingItem == false) {
            this._isCreatingItem = true;
            console.log("create new Prefab:%s",cfg.Prefab);
            const res = await oops.res.loadAsync("UIConstellation", cfg.Prefab, Prefab);
            if (res) {
                const node = instantiate(res);
                this.itemNodeParent.addChild(node);
                this._itemCell = node.getComponent(UIConstellationItem);
            }
            else {
                console.error(`${cfg.Prefab}`);
            }
            this._isCreatingItem = false;
            // return;
        }
        if(this._itemCell) {
            this._itemCell.onInit(this._roleId, this.__onClickStarBackBind, this._selectStarId, nextId);
            this._updateDialogTips();
        }
    }

    /**
     * 
     * @returns 
     */
    private _updateDialogTips() {
        let state = ConstellationTool.GetStarConditionState(this._roleId, this._selectStarId);
        const cfg = ConfigManager.tables.TbStarSingle.get(this._selectStarId);
        if(cfg == undefined) {
            return;
        }

        this.spBtnCanNotSee.grayscale = state != ConditionState.WillUnlock;
        this.spBtnCanNotSee.node.active = state != ConditionState.Unlock;
        this.btnSeeStoryNode.active = state == ConditionState.Unlock && cfg.UnlockPlotId > 0;
        this.unlockTagNode.active = state == ConditionState.Unlock && cfg.UnlockPlotId == 0;
        this.animBottom.node.active = true;
        this.animBottom.play();

        this.labName.string = cfg.Name;
        let descUnlockLevel = "";
        if(cfg.UnlockRoleLevel > 0) {
            const lv = cfg.UnlockRoleLevel;
            descUnlockLevel = "LV." + lv + "";
        }
        // this.richUnlockDesc1.string = desc1;
        this.labUnlockTips.string = descUnlockLevel;
        this.unlockTipsNode.active = PlayerSystem.Instance.CurLv < cfg.UnlockRoleLevel && state != ConditionState.WillUnlock && state != ConditionState.Unlock;

        
        let itemId = 0;
        let itemCount = 0;
        for (const iterator of cfg.UnlockCondition) {
            itemId = iterator[0];
            itemCount = iterator[1];
            break;
        }
        
        const itemCfg = itemId > 0 ? ConfigManager.tables.TbItem.get(itemId) : null;
        if(itemCfg) {
            changeSpriteImage(this.spCostItemIcon, itemCfg.Icon, "CommonRes");
        }
        const hasCount = GameData.getCurrency(itemId);
        const countText = Utility.FormatBigNumber(itemCount);
        const showCostText = hasCount >= itemCount ? ("<color=#686867>" +countText+ "</color>") : ("<color=#FF0000>" +countText+ "</color>");
        this.richTextCostItemText.string = showCostText;
        
        if(cfg.UnlockPlotId > 0) {
            let desc = "";
            const plotCfg = ConfigManager.tables.TbPlot.get(cfg.UnlockPlotId);
            if(plotCfg) {
                desc = "" + plotCfg.ElementName + "";
            }

            this.labPlotName.string = desc;
        }
        else {
            this.labAddHeart.string = "+" + (cfg.UnlockRewardRate * 100).toFixed(0) + "%";
        }
        this.labPlotName.node.active = cfg.UnlockPlotId > 0;
        this.bottomAddNode.active = cfg.UnlockPlotId == 0;        
    }


    /**
     * 
     * @param starId 
     */
    private _onClickStarBack(starId: number) {
        if(this._selectStarId == starId) {
            return;
        }
        this._selectStarId = starId;
        this._updateStars();
        // this._updateUnlockTips();
        // const data = GameData.GetConstellationDataByRoleId(this._roleId);
        // if(data == undefined) {
        //     return;
        // }

        // let state = ConstellationTool.GetStarConditionState(this._roleId, starId);
        // const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        // if(cfg == undefined) {
        //     return;
        // }
        
        //   
        // if((state != ConditionState.None && cfg.UnlockPlotId > 0) || state == ConditionState.WillUnlock || state == ConditionState.CanNotUnlock) {
        //     oops.gui.openAsync(UIID.UIConstellationUnlockDialog, {roleId: this._roleId, starId: starId});
        // }
        // else{ //  
        //     oops.gui.openAsync(UIID.UIConstellationUnlockTips, {roleId: this._roleId, starId: starId});
        // }
    }

    public onClickItemAdd() {

    }

    /**
     * 
     */
    public onClickClose() {
        oops.gui.remove(UIID.UIConstellation);
    }

    public onClickGoStar() {
        
    }

    onClickSeeStory() {
        let state = ConstellationTool.GetStarConditionState(this._roleId, this._selectStarId);
        if(state != ConditionState.Unlock) {
            return;
        }
        const cfg = ConfigManager.tables.TbStarSingle.get(this._selectStarId);
        if(cfg == undefined) {
            return;
        }
        if(cfg.UnlockPlotId > 0) {
            StorySystem.Instance.Play(cfg.UnlockPlotId);
        }
    }

    onClickCanNot() {
        GuideManager.Instance.FinishGuide();
        let result = ConstellationTool.GetStarConditionStateAndTips(this._roleId, this._selectStarId);
        if(result.state == ConditionState.Unlock) {

            return;
        }
        if(result.desc != "" && (result.state == ConditionState.CanNotUnlock || result.state == ConditionState.None)) {
            let audio = ConfigManager.tables.TbAudio.get(2016)!;
            oops.audio.playEffect(audio?.Resource, "Audios");
            oops.gui.openAsync(UIID.UIConstellationTips, result.desc);
            // oops.gui.open(UIID.UIGetItem);
            // return;
        }
        const cfg = ConfigManager.tables.TbStarSingle.get(this._selectStarId);
        if(cfg == undefined) {
            return;
        }
        let isCan = true;
        for (const iterator of cfg.UnlockCondition) {
            if(!GameData.currencyIsEnough(iterator[0], iterator[1])) {
                isCan = false;
                break;
            }
        }
        if(!isCan) {
            let audio = ConfigManager.tables.TbAudio.get(2016)!;
            oops.audio.playEffect(audio?.Resource, "Audios");
            oops.gui.open(UIID.UIGetItem, [UIID.UIConstellation, UIID.UIConstellationMain]);
        }

        if(result.state != ConditionState.WillUnlock) {
            return;
        }
        let changeCount = 0;
        for (const iterator of cfg.UnlockCondition) {
            changeCount = -1*iterator[1];
            GameData.updateCurrency(iterator[0], changeCount);
        }

        let audio = ConfigManager.tables.TbAudio.get(2002)!;
        oops.audio.playEffect(audio?.Resource, "Audios");

        GameData.SetConstellationStarUp(this._roleId);
        this._starUpOnCostItem(changeCount);

            // oops.gui.remove(UIID.UIConstellationUnlockDialog);
    }

}


