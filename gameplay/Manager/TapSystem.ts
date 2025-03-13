import ConfigManager from "../../manager/Config/ConfigManager";
import { TrExp } from "../../schema/schema";
import { GameData } from "../GameDataModel/GameData";

export class TapSystem {
    private static _instance: TapSystem;

    public static get Instance(): TapSystem {
        return this._instance || (this._instance = new TapSystem());
    }

    private constructor() {}

    // 
    get TapExp(): number {
        const tapLv = GameData.PlayerData.GlobalData.TapLevel;

        if (tapLv === 1) {
            return ConfigManager.tables.TbExp.get(0)?.TapExp!;
        }

        let currentLv = tapLv - 1;
        let num = ConfigManager.tables.TbExp.get(0)?.TapExp!;
        const cId = this.GetCurTapCfgId();
        
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            let tLv = 0;
            
            if (cId > data.Id) {
                const prevData = ConfigManager.tables.TbExp.get(i-1)!;
                tLv = data.Level - prevData.Level;
                num += data.TapExp * tLv;
                currentLv -= tLv;
            } else if (cId === data.Id) {
                tLv = currentLv;
                num += data.TapExp * tLv;
            } else {
                break;
            }
        }
        
        return num;
    }

    // 
    get TapMoney(): number {
        const tapLv = GameData.PlayerData.GlobalData.TapLevel;

        if (tapLv === 1) {
            return ConfigManager.tables.TbExp.get(0)?.TapMoney!;
        }

        let currentLv = tapLv - 1;
        let num = ConfigManager.tables.TbExp.get(0)?.TapMoney!;
        const cId = this.GetCurTapCfgId();
        
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            let tLv = 0;
            
            if (cId > data.Id) {
                const prevData = ConfigManager.tables.TbExp.get(i-1)!;
                tLv = data.Level - prevData.Level;
                num += data.TapMoney * tLv;  // BigInt
                currentLv -= tLv;
            } else if (cId === data.Id) {
                tLv = currentLv;
                num += data.TapMoney * tLv;
            } else {
                break;
            }
        }
        
        return num;
    }

    // 
    get NeedMoney(): number {
        const tapLv = GameData.PlayerData.GlobalData.TapLevel;

        if (tapLv === 1) {
            return ConfigManager.tables.TbExp.get(0)?.NeedMoney!;
        }

        let currentLv = tapLv - 1;
        let num = ConfigManager.tables.TbExp.get(0)?.NeedMoney!;
        const cId = this.GetCurTapCfgId();
        
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            let tLv = 0;
            
            if (cId > data.Id) {
                const prevData = ConfigManager.tables.TbExp.get(i-1)!;
                tLv = data.Level - prevData.Level;
                num += data.NeedMoney * tLv;
                currentLv -= tLv;
            } else if (cId === data.Id) {
                tLv = currentLv;
                num += data.NeedMoney * tLv;
            } else {
                break;
            }
        }
        
        return num;
    }

    // 
    get IsMaxTapLv(): boolean {
        return GameData.PlayerData.GlobalData.TapLevel >= this.MaxTapCfgLv;
    }

    get MaxTapCfgLv(): number {
        const lastIndex = ConfigManager.tables.TbExp.getDataList().length - 1;
        return ConfigManager.tables.TbExp.get(lastIndex)?.Level!;
    }

    GetCurTapCfgId(): number {
        const tapLv = GameData.PlayerData.GlobalData.TapLevel;
        let cfgId = 0;
        
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            if (tapLv <= data.Level) {
                cfgId = data.Id;
                break;
            }
        }
        return cfgId;
    }

    GetCurTapInfo(): TrExp {
        return ConfigManager.tables.TbExp.get(this.GetCurTapCfgId())!;
    }

    // n
    GetNextExp(x: number): number {
        let tapLv = GameData.PlayerData.GlobalData.TapLevel + x - 1;
        let num = ConfigManager.tables.TbExp.get(0)?.TapExp!;
        const cId = this.GetCurTapCfgId();
        
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            let tLv = 0;
            
            if (cId > data.Id) {
                const prevData = ConfigManager.tables.TbExp.get(i-1)!;
                tLv = data.Level - prevData.Level;
                num += data.TapExp * tLv;
                tapLv -= tLv;
            } else if (cId === data.Id) {
                tLv = tapLv;
                num += data.TapExp * tLv;
            } else {
                break;
            }
        }
        return num;
    }

    // n  
    GetNextMoney(x: number): number {
        let tapLv = GameData.PlayerData.GlobalData.TapLevel + x - 1;
        let num = ConfigManager.tables.TbExp.get(0)!.TapMoney;
        const cId = this.GetCurTapCfgId();
        
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            let tLv = 0;
            
            if (cId > data.Id) {
                const prevData = ConfigManager.tables.TbExp.get(i-1)!;
                tLv = data.Level - prevData.Level;
                num += data.TapMoney * tLv;
                tapLv -= tLv;
            } else if (cId === data.Id) {
                tLv = tapLv;
                num += data.TapMoney * tLv;
            } else {
                break;
            }
        }
        return num;
    }

    // n
    GetNextSpend(x: number): number {
        let tapLv = GameData.PlayerData.GlobalData.TapLevel + x - 2; // -1 -1
        let num = ConfigManager.tables.TbExp.get(0)!.NeedMoney;
        const cId = this.GetCurTapCfgId();
        for (let i = 1; i < ConfigManager.tables.TbExp.getDataList().length; i++) {
            const data = ConfigManager.tables.TbExp.get(i)!;
            let tLv = 0;
            
            if (cId > data.Id) {
                const prevData = ConfigManager.tables.TbExp.get(i-1)!;
                tLv = data.Level - prevData.Level;
                num += data.NeedMoney * tLv;
                tapLv -= tLv;
            } else if (cId === data.Id) {
                tLv = tapLv;
                num += data.NeedMoney * tLv;
            } else {
                break;
            }
        }
        return num;
    }
}