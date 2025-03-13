import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Sprite } from 'cc';
import { Label } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { changeSpriteImage } from '../common/UIExTool';
import { TrStarStage } from '../schema/schema';
import { ItemEnum } from '../gameplay/GameDataModel/GameEnum';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { ConstellationTool } from './ConstellationTool';
import { Button } from 'cc';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import * as path from 'path';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { UIConstellationItemCellEffect } from './UIConstellationItemCellEffect';
import { Vec3 } from 'cc';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;


@ccclass('UIConstellationItem')
export class UIConstellationItem extends Component {

    @property(Sprite)
    spBottom: Sprite = null!;
    @property(Sprite)
    spLine: Sprite = null!;
    @property(Node)
    lineGroup: Node = null!;
    @property(Node)
    starGroup: Node = null!;
    @property(Sprite)
    spGirl: Sprite = null!;
    @property(Node)
    selectStarNode: Node = null!;

    // 0  1 
    private _lastIsUnlockState: number = 0;
    private _roleId: number = 0;

    private _clickBack: Function = null!;
    private _cellEffectNodeName: Map<number, UIConstellationItemCellEffect> = new Map();

    /**
     * 
     * @param roleId 
     * @param cb 
     * @param selectStarId id
     * @param bombStarId bombid
     * @returns 
     */
    public onInit(roleId: number, cb: Function, selectStarId: number, bombStarId: number = 0) {
        this._roleId = roleId;
        this._clickBack = cb;
        // const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        // if(cfg == undefined) {
        //     return;
        // }

        const cellData = GameData.GetConstellationDataByRoleId(this._roleId);
        if(cellData == undefined) {
            return;
        }

        const stageCfg = cellData.Cfg();
        if(stageCfg == null) {
            return;
        }
        
        changeSpriteImage(this.spBottom, stageCfg.BaseMap, "UIConstellation");

        this._updateStars(stageCfg.StarIds, selectStarId, bombStarId);
        this._updateLines(stageCfg.StarIds);
    }

    /**
     * 
     * @param starIds 
     */
    private _updateLines(starIds : number[]){
        for (let i = 0; i < this.lineGroup.children.length; i++) {
            const node = this.lineGroup.children[i];
            const sp = node.getComponent(Sprite);
            if(sp) {
                this._updateLineCell(sp, starIds[i], i < (starIds.length - 1) ? starIds[i+1] : 0);
            }
        }
    }

    /**
     * 
     * @param sp 
     * @param starId 
     * @param nextStarId 
     * @returns 
     */
    private _updateLineCell(sp: Sprite, starId: number, nextStarId: number) {
        if(sp == null){
            return;
        }
        
        const isUnlock = GameData.GetConstellationStarIsUnlockByRoleIdAndLevel(this._roleId, starId);
        const isNextUnlock = nextStarId != 0 ? GameData.GetConstellationStarIsUnlockByRoleIdAndLevel(this._roleId, nextStarId) : false;
        let state: number = isUnlock ? ConditionState.Unlock : ConditionState.None;
        if(isUnlock && !isNextUnlock) {
            const nextCfg = ConfigManager.tables.TbStarSingle.get(nextStarId);
            if(nextCfg) {
                state = ConstellationTool.GetStarConditionState(this._roleId, nextStarId);  //this._checkIsSafityUnlock(nextCfg.UnlockCondition);
            }
        }


        let path = "";
        if(state == ConditionState.Unlock) {
            path = "Sprites/ui_yinv_mzs_zjm_xingpan_2_1";
        }
        else if(state == ConditionState.WillUnlock) {
            path = "Sprites/ui_yinv_mzs_zjm_xingpan_2_2";
        }
        
        sp.node.active = path.length > 0 && state != ConditionState.None;
        changeSpriteImage(sp, path, "UIConstellation");
    }

    /**
     * 
     * @param starIds 
     * @returns 
     */
    private async _updateStars(starIds : number[], selectStarId: number, bombStarId: number = 0) {
        if(starIds.length == 0) {
            return;
        }
        this.selectStarNode.active = selectStarId != 0;
        for (let i = 0; i < this.starGroup.children.length; i++) {
            const node = this.starGroup.children[i];
            const sp = node.getComponent(Sprite);
            if(sp) {
                this._updateStarCell(sp, starIds[i], i);
                if(selectStarId == starIds[i]) {
                    const v = sp.node.getWorldPosition();
                    v.y = v.y +  this.selectStarNode.uiTransform.height * 0.5;//sp.node.uiTransform.height * 0.5 +
                    this.selectStarNode.setWorldPosition(v);
                }
            }
            const btn = node.getComponent(Button);
            if(btn) {
                btn.node.off(Button.EventType.CLICK);
                // const btnLastStarId = i > 0 ? starIds[i-1] : 0;
                const btnStarId = starIds[i];
                btn.node.on(Button.EventType.CLICK, ()=>{
                    this.onClick(btnStarId);
                }, this);
            }
            
        }

        for (let i = 0; i < this.starGroup.children.length; i++) {
            let eff = this._cellEffectNodeName.get(i);
            if(eff == undefined) {
                const parent = this.starGroup.children[i];
                const res = await oops.res.loadAsync("UIConstellation", "Prefab/Effect_item", Prefab);
                if (res && parent) {
                    const node = instantiate(res);
                    parent.addChild(node);
                    const eff1 = node.getComponent(UIConstellationItemCellEffect);
                    if(eff1) {
                        eff = eff1;
                        this._cellEffectNodeName.set(i, eff1);
                    }                   
                }
                else {
                    console.error(`Effect_item`);
                }
            }
            if(eff) {
                const state =  ConstellationTool.GetStarConditionState(this._roleId, starIds[i]);
                const cfg = ConfigManager.tables.TbStarSingle.get(starIds[i]);
                if(cfg) {
                    eff.onInit(cfg.Type, state, bombStarId == starIds[i]);
                }
            }
        }
    }

    private async _updateStarCell(sp: Sprite, starId: number, idx: number, isJustStarUp: boolean = false) {
        if(sp == null){
            return;
        }
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg == undefined) {
            return;
        }
        const isUnlock = GameData.GetConstellationStarIsUnlockByRoleIdAndLevel(this._roleId, starId);
        let state: number = ConditionState.Unlock;
        if(!isUnlock) {
            state =  ConstellationTool.GetStarConditionState(this._roleId, starId);
        }
        let path = "";
        if(state == ConditionState.Unlock) {
            path = cfg.UnlockImage;
        }
        else if(state == ConditionState.WillUnlock) {
            path = cfg.CanUnlockImage;
        }
        else {
            path = cfg.LockImage;
        }

        const eff = this._cellEffectNodeName.get(idx);
        if(eff) {
            eff.onInit(cfg.Type, state, isJustStarUp);
        }

        // console.log("change sp %s", path);
        await changeSpriteImage(sp, path, "UIConstellation");
        sp.sizeMode = Sprite.SizeMode.RAW;
    }

    onClick(starId: number) {
        if(starId == 0) {
            return;
        }
        // const isUnlock = lastStarId > 0 ? GameData.GetConstellationStarIsUnlockByRoleIdAndLevel(this._roleId, lastStarId) : true;
        // if(!isUnlock) {
        //     oops.gui.open(UIID.UIConstellationTips, "");
        //     return;
        // }
        const result = ConstellationTool.GetStarConditionStateAndTips(this._roleId, starId);
        if( (result.state == ConditionState.CanNotUnlock || result.state ==ConditionState.None) && result.desc != "") {
            oops.gui.open(UIID.UIConstellationTips, result.desc);
            // return;
        }
        this._clickBack(starId);
    }
}


