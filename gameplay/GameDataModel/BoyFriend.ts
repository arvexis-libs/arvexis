import { _decorator, Component, Node } from 'cc';
import { RegisterClass, SerializeClass, SerializeData } from '../../../modules/base/SerializeClass';
import ConfigManager from '../../manager/Config/ConfigManager';
import { ConditionMgr } from '../Manager/ConditionMgr';
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
    

    private _isUnlock: boolean = false;

    public onInit(id: number) {
        this.Id = id;
        this.Level = 1;
        this.Exp = 0;
        this._isUnlock = false;
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
}
