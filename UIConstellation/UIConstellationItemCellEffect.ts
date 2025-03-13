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
import { ConstellationTool, StarType } from './ConstellationTool';
import { Button } from 'cc';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import * as path from 'path';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('UIConstellationItemCellEffect')
export class UIConstellationItemCellEffect extends Component {

    @property(Node)
    buleNode: Node = null!;
    @property(Node)
    buleStarNode: Node = null!;
    @property(Node)
    yellowNode: Node = null!;
    @property(Node)
    yellowStarNode: Node = null!;
    @property(Node)
    bombNode: Node = null!;

    private _laterCallCallback: Function = null!;
    private _state: ConditionState = ConditionState.None;
    private _starType: number = 0;

    protected onLoad(): void {        
        this._laterCallCallback = this._laterCall.bind(this);
    }
    
    public onInit(starType: number, state: ConditionState, isFirstUnlock: boolean = false) {
        this._state = state;
        this._starType = starType;

        this.buleNode.active = !isFirstUnlock && starType == StarType.Normal && state == ConditionState.Unlock;
        this.buleStarNode.active = !isFirstUnlock && starType == StarType.Star && state == ConditionState.Unlock;
        this.yellowNode.active = !isFirstUnlock && starType == StarType.Normal && state == ConditionState.WillUnlock;
        this.yellowStarNode.active = !isFirstUnlock && starType == StarType.Star && state == ConditionState.WillUnlock;

        this.bombNode.active = isFirstUnlock && state == ConditionState.Unlock;

        console.log("starType:%s,state:%s, isFirstUnlock:%s",starType,state,isFirstUnlock);
        this.unschedule(this._laterCallCallback);
        // 1
        if(isFirstUnlock && state == ConditionState.Unlock) {
            this.scheduleOnce(this._laterCallCallback, 2);
        }
    }

    protected onDestroy(): void {
        this.unschedule(this._laterCallCallback);
    }

    private _laterCall() {
        this.onInit(this._starType, this._state);
    }
}


