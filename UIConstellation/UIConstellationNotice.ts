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
import { GameData } from '../gameplay/GameDataModel/GameData';
import { GameEvent } from '../common/config/GameEvent';
import { ProgressBar } from 'cc';
import { RichText } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIConstellationNotice')
export class UIConstellationNotice extends CCComp {

    @property(Sprite)
    spIcon: Sprite = null!;
    @property(ProgressBar)
    progressBar: ProgressBar = null!;
    
    @property(Node)
    unlockBtnNode: Node = null!;
    @property(Label)
    labName: Label = null!;
    @property(RichText)
    labCountProgress: RichText = null!;
    @property(Node)
    tipsNode: Node = null!;
    @property(Sprite)
    spTipsIcon: Sprite = null!;
    @property(Label)
    labLv:Label = null!;
    @property(Node)
    trailNode: Node = null!;
    @property(Node)
    frontNode: Node = null!;

    private _roleId: number = 0;
    private _isShow = false;
    private _laterCallCloseCallback: Function = null!;
    reset(): void {
    }

    protected onLoad(): void {        
        this._laterCallCloseCallback = this._laterCallClose.bind(this);
    }
    /**
     * 
     * @param args  
     * roleId 
     * @returns 
     */
    onAdded(args: any) {        
        this._roleId = 0;
        if(args.roleId) {
            this._roleId = args.roleId;
        }
        
        return true;
    }

    start() {
        this._isShow = true;
        this._updateInfo();
    }

    protected onEnable(): void {
        
        oops.message.on(GameEvent.ConstellationNotice, this._updateInfo, this);
    }
    protected onDisable(): void {
        
        oops.message.off(GameEvent.ConstellationNotice, this._updateInfo, this);
    }

    protected onDestroy(): void {
        this._isShow = false;
    }


    private async _updateInfo() {
        // const cfg = ConfigManager.tables.TbStarSingle.get(this._roleId);
        // if(cfg == undefined) {
        //     this._laterCallClose();
        //     return;
        // }

        const data = GameData.GetConstellationDataByRoleId(this._roleId);
        if(data == undefined) {
            return;
        }

        const nextId = data.NextStarId();
        if(nextId == 0) {
            console.error("nextId: %s, del UIConstellationNotice",nextId);
            this._laterCallClose();
            return;
        }
        const cfg = ConfigManager.tables.TbStarSingle.get(nextId);
        if(cfg == undefined) {
            this._laterCallClose();
            return;
        }

        // const state = ConstellationTool.GetStarConditionState(this._roleId, nextId);

        let itemId = 0;
        let itemCount = 0;

        for (const iterator of cfg.UnlockCondition) {
            itemId = iterator[0];
            itemCount = iterator[1];
            break;
        }
        
        const itemCfg = ConfigManager.tables.TbItem.get(itemId);
        if(itemCfg) {
            changeSpriteImage(this.spIcon, itemCfg.Icon, itemCfg.BundleName);
        }

        const hasCount = GameData.getCurrency(itemId);
        const costIsCan = hasCount >= itemCount;
        const progress = itemCount > 0 ? hasCount / itemCount : 0;
        this.labCountProgress.string =(!costIsCan ? ("<color=#F04E61>"+ hasCount + "</color>") : hasCount)  + "/" + itemCount;
        this.progressBar.node.active = costIsCan;
        this.progressBar.progress = progress;
        const barWidth = this.progressBar.node.size.width;
        const newX = (barWidth * progress) - (barWidth / 2);
        this.trailNode.setPosition(newX+5, this.trailNode.position.y);
        this.trailNode.active = progress < 1;
        this.frontNode.active = progress >= 1;

        const lvIsCan = ConstellationTool.GetStarLevelIsSatisfy(this._roleId, nextId);

        this.unlockBtnNode.active = lvIsCan && costIsCan;
        this.tipsNode.active = !lvIsCan;
        
        this.labLv.string = "LV." + cfg.UnlockRoleLevel;
        this.labName.string = cfg.Name;
        this.unschedule(this._laterCallCloseCallback);
        // 1
        this.scheduleOnce(this._laterCallCloseCallback, 3);
    }
    
    private _laterCallClose() {
        oops.gui.remove(UIID.UIConstellationNotice);
    }

    onClick() {

        const data = GameData.GetConstellationDataByRoleId(this._roleId);
        if(data == undefined) {
            return;
        }

        const nextId = data.NextStarId();
        if(nextId == 0) {
            console.error("nextId: %s, del UIConstellationNotice",nextId);
            this._laterCallClose();
            return;
        }
        const cfg = ConfigManager.tables.TbStarSingle.get(nextId);
        if(cfg == undefined) {
            this._laterCallClose();
            return;
        }

        oops.gui.openAsync(UIID.UIConstellation, {starId: nextId});

        oops.gui.remove(UIID.UIConstellationNotice);
    }
}


