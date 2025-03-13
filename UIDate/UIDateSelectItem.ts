import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import { GameEvent } from '../common/config/GameEvent';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Config } from 'db://oops-framework/module/config/Config';
import ConfigManager from '../manager/Config/ConfigManager';
import { ConditionAndOr, ConditionMgr } from '../gameplay/Manager/ConditionMgr';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIDateSelectItem')
export class UIDateSelectItem extends CCComp {

    @property(Sprite)
    headIcon:Sprite = null!;

    @property(Label)
    roleName:Label = null!;
    @property(Label)
    roleLevel:Label = null!;

    @property(Label)
    roleDateUnlock:Label = null!;


    mRoleId:number = 0;
    mIsUnlockRole:boolean = false;
    start() {

    }

    reset(): void {
        
    }

    showItem(roleId:number){
        this.mRoleId = roleId;

        let roleInfo = ConfigManager.tables.TbPlayer.get(this.mRoleId);
        let isUnlockRole = true;
        let condition = roleInfo?.Unlock;
        if(condition && condition?.length > 0){
            isUnlockRole = ConditionMgr.inst.checkAllConditions(condition, ConditionAndOr.And);
        }
        if(!isUnlockRole){
            this.mIsUnlockRole = false;
            this.showLockRole();
        }
        else{
            this.mIsUnlockRole = true;
            this.showUnlockRole();
        }
    }

    showLockRole(){
  
        oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/common_touxiang_icon_hui/spriteFrame").then((sp)=>{
            if(this.isValid){
                this.headIcon.spriteFrame = sp;
            }
        });

        this.roleName.string = "???"
        this.roleLevel.string = `???`;
        this.roleDateUnlock.string = `???`;
    }

    showUnlockRole(){
        const roleCfg = ConfigManager.tables.TbPlayer.get(this.mRoleId);
        if(roleCfg){
            //this.setSprite(this.headIcon, "Sprites/" + roleCfg.MapIconPath + "/spriteFrame", "CommonRes");

            oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/" + roleCfg.FuncIconPath + "/spriteFrame").then((sp)=>{
                if(this.isValid){
                    this.headIcon.spriteFrame = sp;
                }
            });

            this.roleName.string = roleCfg.Name;
            const player = PlayerSystem.Instance.GetPlayerDataById(this.mRoleId);
            if(player){
                this.roleLevel.string = ` LV ${player.level}`;
            }
            let unlockCnt = PlayerSystem.Instance.getUnlockDateCountByRoleId(this.mRoleId);
            let totalCnt = PlayerSystem.Instance.getDateCountByRoleId(this.mRoleId);
            this.roleDateUnlock.string = ` ${unlockCnt}/${totalCnt}`;
        }
    }

    onClickItem(){
        if(!this.mIsUnlockRole)
        {
            oops.gui.toast("");
            return;
        }

        this.dispatchEvent(GameEvent.UIDateSwitchRoleEvent, this.mRoleId);
        oops.gui.remove(UIID.UIDateSelect);
    }
}


