import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from 'db://oops-framework/module/common/CCComp';
import ConfigManager from '../manager/Config/ConfigManager';
import { SpriteFrame } from 'cc';
import { GameEvent } from '../common/config/GameEvent';
import { RichText } from 'cc';
import { ConditionAndOr, ConditionMgr } from '../gameplay/Manager/ConditionMgr';
import { Vec2 } from 'cc';
import { Vec3 } from 'cc';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { oops } from 'db://oops-framework/core/Oops';
import { TipsNoticeUtil } from '../gameplay/Utility/TipsNoticeUtil';
const { ccclass, property } = _decorator;

@ccclass('UIRoleSelectItem')
export class UIRoleSelectItem extends CCComp {

    @property(Sprite)
    headIcon:Sprite = null!;

    @property(Sprite)
    headBoarder:Sprite = null!;
    @property(Node)
    head:Node = null!;
    @property(Label)
    roleName:Label = null!;

    @property(Label)
    roleDesc:Label = null!;

    @property(RichText)
    roleDesc2:RichText = null!;
    @property(RichText)
    roleDesc3:RichText = null!;

    @property(Node)
    selectFlag:Node = null!;

    @property(Node)
    bgFlagLeft:Node = null!;

    @property(Node)
    bgFlagRight:Node = null!;
    @property(Node)
    miwuNode1:Node = null!;
    @property(Node)
    miwuNode2:Node = null!;
    @property(Node)
    miwuNode3:Node = null!;


    mRoleId:number = 0;
    mIndex:number = 0;

    mHeadLeftPosition:Vec3 = new Vec3(-329, 0, 0);
    mHeadRightPosition:Vec3 = new Vec3(313.577, 0, 0);

    reset(): void {
        
    }

    public setRoleId(roleId:number, index:number){
        this.mRoleId = roleId;
        this.mIndex = index;
        this.refreshRoleInfo();
    }

    refreshRoleInfo(){

        this.showBasePosition();
        let roleInfo = ConfigManager.tables.TbPlayer.get(this.mRoleId);
        let isUnlockRole = true;
        let condition = roleInfo?.Unlock;
        if(condition && condition?.length > 0){
            isUnlockRole = ConditionMgr.inst.checkAllConditions(condition, ConditionAndOr.And);
        }
        if(!isUnlockRole){
            this.showLockRole();
        }
        else{
            this.showUnlockRole();
        }
    }

    showBasePosition(){
        if(this.mIndex % 2 == 0){
            this.bgFlagLeft.active = false;
            this.bgFlagRight.active = true;
            this.headBoarder.node.setPosition(this.mHeadLeftPosition);
            this.head.setPosition(this.mHeadLeftPosition);
        }
        else {
            this.bgFlagLeft.active = true;
            this.bgFlagRight.active = false;
            this.headBoarder.node.setPosition(this.mHeadRightPosition);
            this.head.setPosition(this.mHeadRightPosition);
        }
    }

    showUnlockRole(){
        let roleInfo = ConfigManager.tables.TbPlayer.get(this.mRoleId);
        let mapAvatorIcon = roleInfo?.FuncIconPath;
        //this.setSprite(this.headIcon, "Head/" + mapAvatorIcon + "/spriteFrame", "CommonRes");

        oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/" + mapAvatorIcon + "/spriteFrame").then((sp)=>{
            if(this.isValid){
                this.headIcon.spriteFrame = sp;
            }
        });

        this.headBoarder.grayscale = false;

        this.roleName.string = roleInfo?.Name || "";

        this.roleDesc.string = roleInfo?.Name || "";

        if(this.mRoleId == PlayerSystem.Instance.CurPlayId){
            this.selectFlag.active = true;
        }
        else{
            this.selectFlag.active = false;
        }

        if(roleInfo?.Information1Show && !ConditionMgr.inst.checkCondition(roleInfo.Information1Show)){
            this.miwuNode1.active = true;
            this.roleDesc.string = "";
        }
        else{
            this.roleDesc.string = roleInfo?.Information1Text || "";
            this.miwuNode1.active = false;
        }

        if(roleInfo?.Information2Show && !ConditionMgr.inst.checkCondition(roleInfo.Information2Show)){
            this.miwuNode2.active = true;
            this.roleDesc2.string = "";
        }
        else{
            this.roleDesc2.string = roleInfo?.Information2Text || "";
            this.miwuNode2.active = false;
        }

        if(roleInfo?.Information3Show && !ConditionMgr.inst.checkCondition(roleInfo.Information3Show)){
            this.miwuNode3.active = true;
            this.roleDesc3.string = "";
        }
        else{
            this.roleDesc3.string = roleInfo?.Information3Text || "";
            this.miwuNode3.active = false;
        }
    }
    showLockRole(){
        this.headBoarder.grayscale = true;
        //this.setSprite(this.headIcon, "Head/common_touxiang_icon_hui/spriteFrame", "CommonRes");
        oops.res.loadAsync<SpriteFrame>("CommonRes", "Head/common_touxiang_icon_hui/spriteFrame").then((sp)=>{
            if(this.isValid){
                this.headIcon.spriteFrame = sp;
            }
        });

        this.roleDesc.string = "";
        this.roleDesc2.string = "";
        this.roleDesc3.string = "";
        this.selectFlag.active = false;
        this.miwuNode1.active = true;
        this.miwuNode2.active = true;
        this.miwuNode3.active = true;
        this.roleName.string = "???";
    }

    onClickItem(){
        if (!PlayerSystem.Instance.PlayerIsUnlock(this.mRoleId)) {
            TipsNoticeUtil.PlayNotice("");
            return;
        }
        this.dispatchEvent(GameEvent.RoleSelectItemClick, this.mRoleId);
    }
}


