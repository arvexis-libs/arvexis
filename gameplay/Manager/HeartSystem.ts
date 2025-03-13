import { _decorator, Component, Node } from 'cc';
import ConfigManager from '../../manager/Config/ConfigManager';
const { ccclass, property } = _decorator;
import { PlayerSystem } from "./PlayerSystem";
import { GameData } from '../GameDataModel/GameData';
import { FunctionOpenSystem } from './FunctionOpenSystem';

@ccclass('HeartSystem')
export class HeartSystem {
    private static instance:HeartSystem;

    public static get Instance():HeartSystem
    {
        return this.instance || (this.instance=new HeartSystem);
    }

    private constructor() {}

    //
    public GetClickedInterval():number
    {
        let value=ConfigManager.tables.TbConst.get("ClickDelayTime")!.Int;
       value= value*0.001;

       //console.error(":"+value);
       return value;
    }

    //

    public GetHeartValue(tid:number): number
    {
        let num=0;
        let actionCfgId = HeartSystem.Instance.getCurActionCfgId(tid);

        let cfg= ConfigManager.tables.TbInteraction.get(actionCfgId);
        if(cfg!=null)
            num=cfg.Exp;
           return num;

    }

    public GetCostValue(tid:number):number
    {
        let num=0;
        let actionCfgId = HeartSystem.Instance.getCurActionCfgId(tid);

        let cfg= ConfigManager.tables.TbInteraction.get(actionCfgId);
        if(cfg!=null)
            num=cfg.Cost;
           return num;
    }

    //
    public IsInterUnlocked(tid:number):[boolean,number,string]
    {
        
        let playerLv=PlayerSystem.Instance.CurLv;  //
        let cId = this.getCurActionCfgId(tid);

        let cfg= ConfigManager.tables.TbInteraction.get(cId);
        if(cfg!=null){
            let openCfg = ConfigManager.tables.TbOpenFunction.get(cfg.Openfunction);
            let unlock = FunctionOpenSystem.Instance.IsOpen(openCfg?.OpenFunctionType!) || cfg.Openfunction == 0;
            return [unlock,cfg.UnlockLv,cfg.Name];
        }

          return [false,1,""];
    }

    /**
     * idid id  id*10000 + id *1000 + id
     * @param actionId id
     */
    public getCurActionCfgId(actionId:number):number{
        let roleId = PlayerSystem.Instance.CurPlayId;
        let skinId = PlayerSystem.Instance.CurSkin;
        return roleId * 10000 + skinId * 1000 + actionId;
    }

    //

    public GetMaskLvForPlayer(tid:number):string
    {

        let cfg= ConfigManager.tables.TbPlayer.get(tid);
        if(cfg!=null)
           return cfg.LvMask;

          return "";
    }
}


