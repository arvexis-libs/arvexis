import { Prefab } from 'cc';
import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import ConfigManager from '../manager/Config/ConfigManager';
import { Player, PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { instantiate } from 'cc';
import { DatePhaseItem } from './DatePhaseItem';
import { GameEvent } from '../common/config/GameEvent';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { SpriteFrame } from 'cc';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
const { ccclass, property } = _decorator;

@ccclass('UIDate')
export class UIDate extends CCComp {

    @property(Prefab)
    datePhaseItemPrefab: Prefab = null!

    @property(Node)
    phaseParentNode: Node = null!

    @property(Sprite)
    rolePic: Sprite = null!
    @property(Label)
    roleName: Label = null!
    @property(Label)
    roleLevel: Label = null!

    @property(Sprite)
    roleLiHuiSprite: Sprite = null!


    mRoleId:number = 1;
    protected onLoad(): void {
        UIMusicManager.inst.playUIMusic(UIID.UIDate, 1004);

        this.mRoleId=PlayerSystem.Instance.CurPlayId;
    }

    start() {
        this.refreshShow();
    }

    update(deltaTime: number) {
        
    }

    reset(): void {
        
    }

    protected onEnable(): void {
        this.on(GameEvent.UIDateSwitchRoleEvent, this.onSwitchRole, this);
    }

    protected onDisable(): void {
        this.off(GameEvent.UIDateSwitchRoleEvent);
    }

    onAdded(args: any) {
        if(args.roleId) {
            this.mRoleId = args.roleId;
        }
    }

    onSwitchRole(event: any, roleId:number){
        if(this.mRoleId && this.mRoleId == roleId) return;

        this.mRoleId = roleId;
        this.refreshShow();
    }

    onClickBack(){
        oops.gui.remove(UIID.UIDate);
    }

    refreshShow(){
        this.phaseParentNode.removeAllChildren();
        let roleConfig = ConfigManager.tables.TbPlayer.get(this.mRoleId);
        if(roleConfig) {
            //this.setSprite(this.rolePic, "Head/" + roleConfig.FuncIconPath + "/spriteFrame", "CommonRes");
            oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/" + roleConfig.FuncIconPath + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.rolePic.spriteFrame = sp;
                }
            });

            oops.res.loadAsync<SpriteFrame>("UIStoryLine", "Sprites/Head/" + roleConfig.StoryLinePic + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.roleLiHuiSprite.spriteFrame = sp;
                }
            });

            

            this.roleName.string = roleConfig.Name;
            const player = PlayerSystem.Instance.GetPlayerDataById(this.mRoleId);
            if(player){
                this.roleLevel.string = ` LV ${player.level}`;
            }

            let dateDataList = PlayerSystem.Instance.getDateListByRoleId(this.mRoleId);
            if(dateDataList.size == 0) return;
            dateDataList.forEach((value, key) => {
                let itemNode = instantiate(this.datePhaseItemPrefab);
                let item = itemNode.getComponent(DatePhaseItem)!;
                let dateInfo = PlayerSystem.Instance.getDateInfoByDateId(value[0])!;
                item.show(key, dateInfo.DateTypeName, value);
                itemNode.parent = this.phaseParentNode;
            })
        }
        else{
            console.error("" + this.mRoleId);
        }
    }

    onClickSwitch(){
        oops.gui.openAsync(UIID.UIDateSelect);
    }
}


