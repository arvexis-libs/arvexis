import { _decorator, Component, Node } from 'cc';
import { ConditionState } from '../gameplay/GameDataModel/ConstellationData';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import ConfigManager from '../manager/Config/ConfigManager';
const { ccclass, property } = _decorator;

/**
 * 
 * 0 
 * 1 
 */
export enum StarType {
    Normal = 0,
    Star = 1,
}

@ccclass('ConstellationTool')
export class ConstellationTool {    

    public static IsHasRed(roleId: number = 0) {
        let id = roleId;
        if(id == 0) {
            id = PlayerSystem.Instance.CurPlayId;
        }
        const data = GameData.GetConstellationDataByRoleId(id);
        if(data == undefined) {
            return {flag: false, starId: 0};
        }

        const nextId = data.NextStarId();

        return {flag: data.IsNextStarCanUnlock(nextId), starId: nextId};
    }

    /**
     *     +     +
     * @param unlockCondition 
     * @returns 
    */
    public static GetStarConditionState(roleId: number, starId: number) : number{
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg ==  null) {
            return ConditionState.None;
        }

        const data = GameData.GetConstellationDataByRoleId(roleId);
        if(data == undefined) {
            return ConditionState.None;
        }
        if(data.StarData.Level >=  cfg.Level) {
            return ConditionState.Unlock;
        }
        const nextLv = data.StarData.Level + 1;
        // 
        if(cfg.Level > nextLv) {
            return ConditionState.None;
        }
        // 
        for (const iterator of cfg.UnlockCondition) {
            
            const count = GameData.getCurrency(iterator[0]);
            if(count < iterator[1]) {
                return ConditionState.CanNotUnlock;
            }
        }
        // const playerCfg = ConfigManager.tables.TbPlayer.get(roleId);
        // if(playerCfg == null) {
        //     return ConditionState.None;
        // }
        const player = PlayerSystem.Instance.GetPlayerDataById(roleId); 
        if(player == null) {
            return ConditionState.None;
        }
        // id * 1000
        const lv = cfg.UnlockRoleLevel;
        if(player.level < lv) {
            return ConditionState.CanNotUnlock;
        }

        return ConditionState.WillUnlock;
    }
    /**
     *     +     +
     * @param unlockCondition 
     * @returns 
    */
    public static GetStarConditionStateAndTips(roleId: number, starId: number) {
        const result = {
            state: ConditionState.None,
            desc: ""
        };
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg ==  null) {
            return result;
        }

        const data = GameData.GetConstellationDataByRoleId(roleId);
        if(data == undefined) {
            return result;
        }
        if(data.StarData.Level >=  cfg.Level) {
            result.state = ConditionState.Unlock;
            result.desc = "";
            return result;
        }
        const nextLv = data.StarData.Level + 1;
        // 
        if(cfg.Level > nextLv) {
            result.state = ConditionState.None;
            result.desc = "";
            return result;
        }
        // 
        for (const iterator of cfg.UnlockCondition) {
            
            const count = GameData.getCurrency(iterator[0]);
            if(count < iterator[1]) {
                result.desc = "";
                result.state = ConditionState.CanNotUnlock;
                return result;
            }
        }
        // const playerCfg = ConfigManager.tables.TbPlayer.get(roleId);
        // if(playerCfg == null) {
        //     return ConditionState.None;
        // }
        const player = PlayerSystem.Instance.GetPlayerDataById(roleId); 
        if(player == null) {
            return result;
        }
        // id * 1000
        const lv = cfg.UnlockRoleLevel;
        if(player.level < lv) {
            const playerCfg = ConfigManager.tables.TbPlayer.get(roleId);
            let pName = ""
            if(playerCfg) {
                pName = playerCfg.Name;
            }
            result.state = ConditionState.CanNotUnlock;
            result.desc = `${pName}LV.${lv}`;
            return result;
        }
        result.state = ConditionState.WillUnlock;
        result.desc = "";
        return result;
    }
    /**
     * 
     * @returns 
    */
    public static GetStarLevelIsSatisfy(roleId: number, starId: number) : boolean{
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg ==  null) {
            return false;
        }

        const data = GameData.GetConstellationDataByRoleId(roleId);
        if(data == undefined) {
            return false;
        }
        if(data.StarData.Level >=  cfg.Level) {
            return false;
        }
        const nextLv = data.StarData.Level + 1;
        // 
        if(cfg.Level > nextLv) {
            return false;
        }
        
        const player = PlayerSystem.Instance.GetPlayerDataById(roleId); 
        if(player == null) {
            return false;
        }
        // id * 1000
        const lv = cfg.UnlockRoleLevel;
        if(player.level < lv) {
            return false;
        }

        return true;
    }
     /**
     * 
     * @returns 
    */
    public static GetStarCostIsSatisfy(roleId: number, starId: number) : boolean{
        const cfg = ConfigManager.tables.TbStarSingle.get(starId);
        if(cfg ==  null) {
            return false;
        }

        const data = GameData.GetConstellationDataByRoleId(roleId);
        if(data == undefined) {
            return false;
        }
        // 
        for (const iterator of cfg.UnlockCondition) {                
            const count = GameData.getCurrency(iterator[0]);
            if(count < iterator[1]) {
                return false;
            }
        }
        

        return true;
    }
}


