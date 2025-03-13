import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { sp } from 'cc';
import { TrStarGalaxy } from '../schema/schema';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { GameData } from '../gameplay/GameDataModel/GameData';
import ConfigManager from '../manager/Config/ConfigManager';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { ConstellationCellData } from '../gameplay/GameDataModel/ConstellationData';
const { ccclass, property } = _decorator;

enum ConstellationSpineState {
    None,
    First,
    Idle,
    Normal,
    Click
}

@ccclass('UIConstellationMainItem')
export class UIConstellationMainItem extends Component {


    @property(Label)
    labName: Label = null!;
    @property(Label)
    labItemCount: Label = null!;
    @property(Node)
    redNode: Node = null!;
    @property(sp.Skeleton)
    spine: sp.Skeleton = null!;
    @property(Node)
    selectNode: Node = null!;
    @property(Node)
    markNode: Node = null!;
    @property(Node)
    selectEffectNode1: Node = null!;
    @property(Node)
    selectEffectNode2: Node = null!;

    

    private _clickAction: string = "";
    private _defaultAction: string = "";
    private _normalActionArr: string[] = [];
    private _roleId: number = 0;
    private _touchCd = 5;
    private _spineState: ConstellationSpineState = ConstellationSpineState.None;
    private _onClickCallback: Function |  null = null;
    private _isInit: boolean = false;


    protected onLoad(): void {
        this.spine.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
            const animationName = trackEntry.animation ? trackEntry.animation.name : "null";
            
            // 
            this.onAnimationComplete(animationName);
        });
        
    }

    public onInit(cfg: TrStarGalaxy, roleData: ConstellationCellData) {
        if(this._isInit || roleData == null) {
            return;
        }

        this._clickAction = cfg.ClickAction;
        this._defaultAction = cfg.DefaultlAction;
        this._normalActionArr = cfg.NormalAction;
        this._roleId = cfg.Id;

        // const roleData = GameData.GetConstellationDataByRoleId(this._roleId);
        // if(roleData == null) {
        //     return;
        // }
        // this.labHeartAdd.string = roleData.HeartAddRate.toFixed(2);

        if(roleData.IsFirstShow) {
            roleData.IsFirstShow = false;
            this._spineState = ConstellationSpineState.First;
            this.spine.setAnimation(0, cfg.FirstAction, false);
        }
        else{
            this._spineState = ConstellationSpineState.Idle;
            this.spine.setAnimation(0, this._defaultAction, true);
        }


        const playerCfg = ConfigManager.tables.TbPlayer.get(this._roleId);
        if(playerCfg == undefined) {
            return;
        }
        this.labName.string = playerCfg.Name;
        this._isInit = true;
    }

    public onRefresh(selectRoleId: number, cfg: TrStarGalaxy, onCallback: Function) {
        const roleData = GameData.GetConstellationDataByRoleId(cfg.Id);
        if(roleData == null) {
            return;
        }
        this.onInit(cfg, roleData);
        const isSelected = selectRoleId == this._roleId;
        this.selectNode.active = isSelected;
        this.selectEffectNode1.active = isSelected;
        this.selectEffectNode2.active = isSelected;
        this.labItemCount.string = roleData.StarUnlockTotalCount.toString();
        this.markNode.active = this._roleId == PlayerSystem.Instance.CurPlayId;
        this.redNode.active = roleData.IsNextStarCanUnlock();
        this._onClickCallback = onCallback;
        
    }

    protected update(dt: number): void {
        if(this._spineState != ConstellationSpineState.Idle){
            return;
        }
        this._touchCd -= dt;
        if(this._touchCd < 0) {
            this._touchCd = 5;
            // 
            if (this._normalActionArr.length == 0) {
                return;
            }

            this._spineState = ConstellationSpineState.Normal;
            // 0-1
            const randomIndex = Math.floor(Math.random() * this._normalActionArr.length);            
            this.spine.setAnimation(0, this._normalActionArr[randomIndex], false);
        }
    }

    public onTouchStart() {
        if(!this.node.active) {
            return;
        }
        this._touchCd = 5;
    }

    // 
    private onAnimationComplete(animationName: string) {
        if(animationName == "null") {
            return;
        }
        if(this._spineState == ConstellationSpineState.First || this._spineState == ConstellationSpineState.Normal) {
            this._spineState = ConstellationSpineState.Idle;
            this.spine.setAnimation(0, this._defaultAction, true);
        }
        
        
        // if(this._clickRoleFlag) {
        //     this._clickRoleFlag = false;
        //     oops.gui.openAsync(UIID.UIConstellation, {roleId: this._roleId});
        //     // return;
        // }
        // if(animationName == this._defaultAction) {
        //     // 
        //     if (this._normalActionArr.length == 0) {
        //         return;
        //     }

        //     // 0-1
        //     const randomIndex = Math.floor(Math.random() * this._normalActionArr.length);            
        //     this.spine.setAnimation(0, this._normalActionArr[randomIndex], false);
        // }
        // else {//if(animationName == this._clickAction) {
        //     this.spine.setAnimation(0, this._defaultAction, false);
        // }
    }

    public onClick(){
        if(this._roleId == 0) {
            return;
        }
        let audio =ConfigManager.tables.TbAudio.get(2001)!;
            oops.audio.playEffect(audio?.Resource, "Audios");
        // this.clear();
        // oops.gui.openAsync(UIID.UIConstellation, {roleId: this._roleId});

        if(this._onClickCallback) {
            this._onClickCallback(this._roleId);
        }
    }

    public onClickRole(){
        if(this._roleId == 0) {
            return;
        }
        this._spineState = ConstellationSpineState.Click;   
        this.spine.setAnimation(0, this._clickAction, false);
    }
}


