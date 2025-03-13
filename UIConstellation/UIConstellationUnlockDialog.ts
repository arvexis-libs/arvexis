import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { ConstellationTool } from './ConstellationTool';
import ConfigManager from '../manager/Config/ConfigManager';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { Label } from 'cc';
import { RichText } from 'cc';
import { Button } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { Utility } from '../gameplay/Utility/Utility';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIConstellationUnlockDialog')
export class UIConstellationUnlockDialog extends CCComp {

    @property(Label)
    labUnlockName: Label = null!;
    @property(Label)
    labUnlockLevelDesc: Label = null!;
    @property(RichText)
    richUnlockDesc1: RichText = null!;
    @property(RichText)
    richUnlockDesc2: RichText = null!;
    @property(Node)
    unlockItemTagNode: Node = null!;
    @property(Button)
    unlockBtn: Button = null!;
    @property(Sprite)
    spUnlockBtn: Sprite = null!;
    
    private _roleId: number = 0;
    private _starId: number = 0;
    private _state: ConditionState = ConditionState.None;


    reset(): void {
    }


    

    /**
     * 
     * @param args  
     * roleId 
     * starId
     * @returns 
     */
    onAdded(args: any) {        
        this._starId = 0;
        if(args.starId) {
            this._starId = args.starId;
        }
        this._roleId = 0;
        if(args.roleId) {
            this._roleId = args.roleId;
        }

        return true;
    }

    start() {
        this._updateInfo();
    }


    private _updateInfo() {
        let state = ConstellationTool.GetStarConditionState(this._roleId, this._starId);
        const cfg = ConfigManager.tables.TbStarSingle.get(this._starId);
        if(cfg == undefined) {
            return;
        }

        this.unlockBtn.interactable = state == ConditionState.Unlock || state == ConditionState.WillUnlock;
        let plotName = "";
        if(cfg.UnlockPlotId > 0) {
            const plotCfg = ConfigManager.tables.TbPlot.get(cfg.UnlockPlotId);
            if(plotCfg) {
                plotName = plotCfg.ElementName;
            }
        }
        

        const rate = cfg.UnlockRewardRate.toFixed(2);
        let desc1 = "";
        if(state == ConditionState.Unlock) {
            desc1 = "";// + plotName;
        }
        else if(state == ConditionState.WillUnlock || state == ConditionState.CanNotUnlock) {
            let itemId = 0;
            let itemCount = 0;
            for (const iterator of cfg.UnlockCondition) {
                itemId = iterator[0];
                itemCount = iterator[1];
                break;
            }
            let itemName = "";
            const itemCfg = ConfigManager.tables.TbItem.get(itemId);
            if(itemCfg) {
                itemName = itemCfg.Name;
            }
            const hasCount = GameData.getCurrency(itemId);
            const countText = Utility.FormatBigNumber(itemCount);
            desc1 = (cfg.UnlockPlotId > 0 ? "" : "") + itemName +  (hasCount >= itemCount ? countText : ("<color=#FF0000>" +countText+ "</color>"));
        }
        else{
            desc1 = cfg.UnlockPlotId > 0 ? ("" + plotName + "") : ("+" + rate);
        }
        let desc1Level = "";
        if(cfg.UnlockRoleLevel > 0) {
            const lv = cfg.UnlockRoleLevel;
            desc1Level = "" + lv + "";
        }
        // this.richUnlockDesc1.string = desc1;
        this.labUnlockLevelDesc.string = desc1Level;
        this.labUnlockLevelDesc.node.active = state != ConditionState.WillUnlock && state != ConditionState.Unlock;
        this.labUnlockName.string = cfg.Name;

        this.richUnlockDesc1.string = desc1;
        console.log("desc1:%s,state:%s",desc1,state);
        this.unlockItemTagNode.active = state != ConditionState.Unlock && cfg.UnlockCondition.size > 0;

        let desc2 = "";
        if(cfg.UnlockPlotId > 0) {
            desc2 = "" + plotName + "";
        }
        else if(state == ConditionState.WillUnlock || state == ConditionState.CanNotUnlock) {
            desc2 = "+" + rate;
        }
        this.richUnlockDesc2.node.active = state != ConditionState.None && state != ConditionState.Unlock && desc2.length > 0;
        this.richUnlockDesc2.string = desc2;

        const isCan = state == ConditionState.WillUnlock || state == ConditionState.Unlock;
        this.unlockBtn.interactable = isCan;
        this.spUnlockBtn.grayscale = !isCan;
        this._state = state;
    }


    public onClickOk() {
        if(!(this._state == ConditionState.Unlock || this._state == ConditionState.WillUnlock)) {
            return;
        }
        const cfg = ConfigManager.tables.TbStarSingle.get(this._starId);
        if(cfg == undefined) {
            return;
        }
        if(this._state == ConditionState.Unlock && cfg.UnlockPlotId > 0) {
            StorySystem.Instance.Play(cfg.UnlockPlotId);
        }
        else if(this._state == ConditionState.WillUnlock) {
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
                return;
            }
            for (const iterator of cfg.UnlockCondition) {
                GameData.updateCurrency(iterator[0], -1*iterator[1]);
            }

            let audio = ConfigManager.tables.TbAudio.get(2002)!;
            oops.audio.playEffect(audio?.Resource, "Audios");

            GameData.SetConstellationStarUp(this._roleId);
            // oops.gui.remove(UIID.UIConstellationUnlockDialog);
        }
        oops.gui.remove(UIID.UIConstellationUnlockDialog);
    }

    onClick() {
        oops.gui.remove(UIID.UIConstellationUnlockDialog);
    }
}


