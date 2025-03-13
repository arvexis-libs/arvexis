import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { ConstellationTool } from './ConstellationTool';
import ConfigManager from '../manager/Config/ConfigManager';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import { changeSpriteImage } from '../common/UIExTool';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIConstellationUnlockTips')
export class UIConstellationUnlockTips extends CCComp {



    @property(Node)
    heartNode: Node = null!;
    @property(Sprite)
    spBg: Sprite = null!;
    @property(Sprite)
    labUnlockAddIcon: Sprite = null!;
    @property(Label)
    labUnlock: Label = null!;
    @property(Label)
    labUnlockInfoHeartAdd: Label = null!;
    @property(UITransform)
    bgTransform: UITransform = null!;
    @property(Label)
    labName: Label = null!;

    private _initBgWidth: number = 0;
    private _initLabUnlockWidth: number = 0;
    private _bgRectTransform: UITransform = null!;
    private readonly _heartWidth = 180;
    
    reset(): void {
    }
    protected onLoad(): void {
        this._bgRectTransform = this.labUnlock.node.uiTransform;
        this._initLabUnlockWidth = this._bgRectTransform.contentSize.width;        
        this._initBgWidth = this.bgTransform.contentSize.width;
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


    private async _updateInfo() {
        this.node.active = false;
        let state = ConstellationTool.GetStarConditionState(this._roleId, this._starId);
        const cfg = ConfigManager.tables.TbStarSingle.get(this._starId);
        if(cfg == undefined) {
            return;
        }
        await changeSpriteImage(this.spBg, state == ConditionState.Unlock ? "Sprites/ui_yinv_mzs_tips_jiugong_2" : "Sprites/ui_yinv_mzs_tips_jiugong_2_1", "UIConstellation");
        
        this.labName.string = cfg.Name;
        const rate = cfg.UnlockRewardRate.toFixed(2);
        let desc = "";
        if(state == ConditionState.Unlock) {
            desc = " + " + rate;
        }
        else{
            let plotName = "";
            if(cfg.UnlockPlotId > 0) {
                const plotCfg = ConfigManager.tables.TbPlot.get(cfg.UnlockPlotId);
                if(plotCfg) {
                    plotName = plotCfg.ElementName;
                }
            }
            desc = cfg.UnlockPlotId > 0 ? (""+plotName+"") : "";
        }
        // console.log("state:%s,UnlockPlotId:%s",state,cfg.UnlockPlotId);
        const showHeart = state != ConditionState.Unlock && cfg.UnlockRewardRate > 0;
        this.heartNode.active = showHeart;
        this.labUnlock.string = desc;
        this.labUnlockInfoHeartAdd.string = "+" + rate;
        

        this.labUnlock.updateRenderData(true); // 
        const textWidth = this.labUnlock.node.uiTransform.contentSize.width;
        const dt = textWidth - this._initLabUnlockWidth - (showHeart ? 0 : this._heartWidth);
        // console.log("dt:%s,textWidth:%s,_initLabUnlockWidth:%s,_initBgWidth:%s",dt,textWidth, this._initLabUnlockWidth,this._initBgWidth);
        if (dt > 0) {
            this.bgTransform.setContentSize(this._initBgWidth + dt, this.bgTransform.height);
        } else {
            this.bgTransform.setContentSize(this._initBgWidth, this.bgTransform.height);
        }
        const tmpSp = this.spBg.getComponent(Sprite);
        if(tmpSp) {
            tmpSp.type = Sprite.Type.SLICED;
            tmpSp.sizeMode = Sprite.SizeMode.CUSTOM;
        }
        this.node.active = true;
    }
    
    onClick() {
        oops.gui.remove(UIID.UIConstellationUnlockTips);
    }
}


