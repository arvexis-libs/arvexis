import { _decorator, Component, Node } from 'cc';
import { RegisterClass, SerializeClass, SerializeData } from '../../../modules/base/SerializeClass';
import ConfigManager from '../../manager/Config/ConfigManager';
import { ConditionMgr } from '../Manager/ConditionMgr';
import { oops } from 'db://oops-framework/core/Oops';
import { GameEvent } from '../../common/config/GameEvent';
const { ccclass, property } = _decorator;

@RegisterClass('BoyFriend')
export class BoyFriend extends SerializeClass {
    __className: string = "BoyFriend";
    @SerializeData()
    public Id: number = 1;
    @SerializeData()
    public Level: number = 1;
    @SerializeData()
    public Exp: number = 0;
    @SerializeData()
    public MasterId: number = 0;
    

    private _isUnlock: boolean = false;
    private _nextLevelUpNeedTotalExp: number = 0;

    public onInit(playerId: number,id: number) {
        this.MasterId = playerId;
        this.Id = id;
        this.Level = 1;
        this.Exp = 0;
        this._isUnlock = false;
        this._updateData();
    }

    get NextLvTotalExp() {
        if(this._nextLevelUpNeedTotalExp <= 0) {
            this._updateData();
        }

        return this._nextLevelUpNeedTotalExp;
    }

    public IsUnlock() {
        if(this._isUnlock) {
            return true;
        }
        const cfg = ConfigManager.tables.TbBoyFriend.get(this.Id);
        if(cfg == null || cfg == undefined) {
            return false;
        }

        this._isUnlock = ConditionMgr.inst.checkBoyFriendCondition(cfg.Unlock);
        return this._isUnlock;
    }

    public LevelUp() {
        const id = this.Id * 1000 + this.Level + 1;
        const lvCfg = ConfigManager.tables.TbBoyFriendLevel.get(id);
        // 
        if(lvCfg == undefined) {

            return;
        }
    
        this.Id = lvCfg.Id;
        this.Level += 1;
        this._updateData();
        oops.message.dispatchEvent(GameEvent.BoyFriendLevelUp, this.Id);
    }

    private _updateData() {
        let nextLvTotalExp = 0;
        for (let lv = 1; lv <= this.Level; lv++){
            const tmpId = this.Id * 1000 + lv;
            const tmpCfg = ConfigManager.tables.TbBoyFriendLevel.get(tmpId);            
            if(tmpCfg == undefined || nextLvTotalExp > this.Exp) {
                break;
            }
            nextLvTotalExp += tmpCfg.Exp;
        }
        this._nextLevelUpNeedTotalExp = nextLvTotalExp;
    }

    public AddExp(value: number) {
        const lastExp = this.Exp;
        this.Exp += value;
        oops.message.dispatchEvent(GameEvent.BoyFriendExpChange, this.Exp - lastExp)
        if(this.Exp >= this._nextLevelUpNeedTotalExp) {
            this.LevelUp();
        }
    }
}
