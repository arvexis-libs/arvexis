import { oops } from "db://oops-framework/core/Oops";
import ConfigManager from "../../manager/Config/ConfigManager";
import { TrCondition } from "../../schema/schema";
import { PlayerSystem } from "./PlayerSystem";
import { GameData } from "../GameDataModel/GameData";
import { StorySystem } from "./StorySystem";
import { HeroineData } from "../GameDataModel/HeroineData";
import { HeroineDataManager } from "../../UIMain/HeroineDataManager";

export enum ConditionAndOr {
    And = 1,
    Or = 2
}

export enum ConditionType {
    RoleExpLevel = 1,
    EnterUITime = 2,        //UI
    LoginTime = 3,
    MingZuoSheLevel = 4,
    RuCan = 5,              //
    Guide = 6,
    StoryComplete = 7,      //
    EnterUITimeWithAvatorId = 8, //UI id  uiid id
    HeroineLv = 9,//
}

export class ConditionMgr {
    private static instance: ConditionMgr;
    public static get inst(): ConditionMgr {
        if (this.instance == null) {
            this.instance = new ConditionMgr();
        }
        return this.instance;
    }


    public checkAllConditions(conditions: number[], andOr: ConditionAndOr, inParam: number = -1): boolean {
        if (andOr == ConditionAndOr.And) {
            for (let i = 0; i < conditions.length; i++) {
                if (!this.checkCondition(conditions[i], inParam)) {
                    // console.error(" And checkCondition F", conditions[i]);
                    return false;
                }
                else
                {
                    // console.error(" And checkCondition T", conditions[i]);
                }
            }
            return true;
        } else {
            for (let i = 0; i < conditions.length; i++) {
                if (this.checkCondition(conditions[i], inParam)) {
                    // console.error(" or checkCondition T" , conditions[i]);
                    return true;
                }
                else    
                {
                    // console.error(" or checkCondition F" , conditions[i]);
                }
            }
            return false;
        }
    }

    public checkCondition(conditionId: number, inParam: number = -1): boolean {

        let trCondition = ConfigManager.tables.TbCondition.get(conditionId) as TrCondition;
        if (!trCondition)
            return false;

        let value = this.getValue(trCondition, inParam);
        let result = this.compare(value, trCondition?.Value1 ?? 0, trCondition?.Value2 ?? 0, trCondition?.MatchingType ?? 0);
        return result;
    }

    private compare(value1: number, value2: number, value3: number, matchingType: number): boolean {
        switch (matchingType) {
            case 1:
                return value1 == value2;
            case 2:
                return value1 > value2;
            case 3:
                return value1 < value2;
            case 4:
                return value1 >= value2;
            case 5:
                return value1 <= value2;
            case 6:
                return value1 != value2;

            //
            case 7:
                return value1 >= value2 && value1 <= value3;
            //
            case 8:
                return value1 > value2 && value1 < value3;
            //
            case 9:
                return value1 >= value2 && value1 < value3;
            //
            case 10:
                return value1 > value2 && value1 <= value3;
            default:
                console.error("" + matchingType);
                return false;
        }
    }

    /**
     * id
     * @param condition 
     */
    private getValue(condition: TrCondition, inParam: number = -1): number {

        let conditionType = condition?.ConditionType ?? 0;
        switch (conditionType) {
            case ConditionType.RoleExpLevel:
                let exp = PlayerSystem.Instance.GetPlayerDataById(condition.Param1)?.level as number;
                return exp;
            case ConditionType.EnterUITime:
                let time = GameData.PlayerData.GlobalData.EnterUICount.get(condition.Param1) ?? 0;
                return time;
            case ConditionType.LoginTime:
                let lTime = GameData.PlayerData.GlobalData.LoginCount;
                return lTime;
            case ConditionType.MingZuoSheLevel:
                let mzLevel = GameData.GetConstellationLevelByRoleId(condition.Param1) as number;
                return mzLevel;

            //id value1
            case ConditionType.RuCan:
                return inParam;
            case ConditionType.Guide:
                let result =  0;
                if (GameData.GetGuideStep()>=condition.Param1) {
                    result = 2;
                }
                else
                {
                    result = 0
                }
                return result;
            case ConditionType.StoryComplete:
                let res = StorySystem.Instance.IsLookComplete(condition.Param1) ? 2 : 0;
                return res;

            case ConditionType.EnterUITimeWithAvatorId:
                let time2 = GameData.GetOpenUICountWithAvatorId(condition.Param1, condition.Param2);
                return time2;
            case ConditionType.HeroineLv://
                let heroineLv = HeroineDataManager.Instance.getLvCur();
                return heroineLv;
            default:
                console.error("" + conditionType);
                return 0;
        }
    }
}