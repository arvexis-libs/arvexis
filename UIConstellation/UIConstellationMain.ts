import { _decorator, Component, Node,Button } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { UIConstellationMainItem } from './UIConstellationMainItem';
import { Config } from '../../../../extensions/oops-plugin-framework/assets/module/config/Config';
import ConfigManager from '../manager/Config/ConfigManager';
import { TrStarGalaxy } from '../schema/schema';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { GameEvent } from '../common/config/GameEvent';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { TipsNoticeUtil } from '../gameplay/Utility/TipsNoticeUtil';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Input } from 'cc';
import { EventTouch } from 'cc';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { GuideManager } from '../UIGuide/GuideManager';
const { ccclass, property } = _decorator;

@ccclass('UIConstellationMain')
export class UIConstellationMain extends CCComp {

    @property(Sprite)
    spBg: Sprite = null!;
    @property([UIConstellationMainItem])
    itemArr: UIConstellationMainItem[] = [];
    @property(Button)
    ArrBtnGuide: Button[] = []!;
    @property(Node)
    ArrNodeGuideTakeUp: Node[] = []!;//
    @property(Node)
    rootNode: Node = null!;


    // id
    private _selectRoleId: number = 0;

    reset(): void {
        
    }

    /**
     * 
     * @param args  roleId starLevel
     * @returns  
     */
    // onAdded(args: any) {
    //     if(args == null || args.roleId == null) {
    //         return true;
    //     }

    //     this._selectRoleId = args.roleId;
    //     this._targetRoleStarLevel = -1;
    //     if(args.starLevel) {
    //         this._targetRoleStarLevel = args.starLevel;
    //     }
        
    //     return true;
    // }

    protected onLoad(): void {
        UIMusicManager.inst.playUIMusic(UIID.UIConstellationMain, 1003);
        // this.rootNode.active = false;
    }

    protected onEnable(): void {        
        oops.message.on(GameEvent.ConstellationStarUp, this._updateTags, this);
        oops.message.on(GameEvent.ConstellationLevelUp, this._updateTags, this);
    }

    protected onDisable(): void {        
        oops.message.off(GameEvent.ConstellationStarUp, this._updateTags, this);
        oops.message.off(GameEvent.ConstellationLevelUp, this._updateTags, this);
    }

    start() {
        // if(!GameData.PlayerData.ConstellationData.IsFirstUnlock) {
        //     oops.gui.openAsync(UIID.UIConstellationNew);
        // }
        SdkManager.inst.event("constellation_in", {userid: PlayerSystem.Instance.CurPlayId, constellation_in: 1});
        // this.rootNode.active = false;
        // oops.gui.open(UIID.UIConstellationNew);
        
        this._selectRoleId = PlayerSystem.Instance.CurPlayId;;
        this._updateTags();
        // this.rootNode.active = true;
        this.ShowGuide();
    }

    ShowGuide()
    {
        GuideManager.Instance.TryShowGuide(2021, this.ArrBtnGuide, ()=>{}, () => {}, ()=>{},[],this.ArrNodeGuideTakeUp);
    }

    protected onTouch() {        
        for (let i = 0; i < this.itemArr.length; i++) {
            const element = this.itemArr[i];
            element.onTouchStart();            
        }
    }

    /**
     * 
     */
    private _updateTags() {        
        const list = ConfigManager.tables.TbStarGalaxy.getDataList();
        for (let i = 0; i < list.length; i++) {
            const cfg = list[i];
            if(cfg.PosId < this.itemArr.length) {
                const element = this.itemArr[cfg.PosId];
                const isUnlock = PlayerSystem.Instance.PlayerIsUnlock(cfg.Id);
                if(isUnlock) {
                    element.node.active = true;
                    element.onRefresh(this._selectRoleId, cfg, this._onTagCallback.bind(this));
                }
                else{
                    element.node.active = false;
                }
            }
            else {
                console.error("id: %s, error, no find uiPosId", cfg.PosId);
            }
        }
    }

    private _onTagCallback(roleId: number) {
        if(roleId == this._selectRoleId) {
            return;
        }
        this._selectRoleId = roleId;
        this.onTouch();
        this._updateTags();
    }

    onClickBack(){
        oops.gui.remove(UIID.UIConstellationMain);
    }

    onClickGo() {
        GuideManager.Instance.FinishGuide();
        if(this._selectRoleId == 0) {
            TipsNoticeUtil.PlayNotice("");
            return;
        }
        oops.gui.openAsync(UIID.UIConstellation, {roleId: this._selectRoleId});
    }
}


