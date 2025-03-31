import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director, EventHandle
} from "cc";

import { CCComp } from "db://oops-framework/module/common/CCComp";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import ConfigManager from '../manager/Config/ConfigManager';
import { sys } from "cc";
import { v3 } from "cc";
import { ScrollView } from "cc";
import { Sprite } from "cc";
import { BFInfoItem } from "./BFInfoItem";
import { TrBoyFriend } from "../schema/schema";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../common/config/GameUIConfig";
import { ProgressBar } from "cc";
import { BoyFriend } from "../gameplay/GameDataModel/BoyFriend";
const { ccclass, property } = _decorator;

enum BFIntroUnlockType {
    BFFavor = 1,// 
    StroyLineNum = 2, // 

}

@ccclass('UIBoyFriendInfo')
export class UIBoyFriendInfo extends CCComp {

    //#region  
    @property(Sprite)
    spIcon: Sprite = null!;
    @property([BFInfoItem])
    bFInfoItemArr: BFInfoItem[] = [];
    
    @property([Label])
    labIntroArr: Label[] = [];
    @property([Node])
    nodeIntroMWArr: Node[] = [];

    @property(ProgressBar)
    progressBarFavor: ProgressBar = null!;
    @property(Label)
    labProgressFavor: Label = null!;
    @property(Label)
    labLevel: Label = null!;
    


    private _currentBoyId: number = -1;

    //#endregion
    // args {Id:Id}
    onAdded(args: any) {
        this._currentBoyId = args.Id;
        return true;
    }

    onLoad() {
        
    }

    start() {
        this._onRefresh();

    }


    _onRefresh() {
        this._onUpdateInfo();
    }

    reset() {
    }


    protected update(dt: number): void {

    }

    onDestroy() {
        
    }

    private _onUpdateInfo() {
        const cfg = ConfigManager.tables.TbBoyFriend.get(this._currentBoyId);
        if(cfg == null || cfg == undefined) {
            console.error(",,Id:%s", this._currentBoyId);
            return;
        }
        const bfData = PlayerSystem.Instance.GetBoyFriendById(this._currentBoyId);
        if(bfData == null) {
            return false;
        }

        this._updateBaseInfo(cfg);
        this._updateFavor(cfg, bfData);
        this._updateIntro(cfg, bfData);
    }
    // 
    private _updateBaseInfo(cfg: TrBoyFriend) {
        if(cfg == null) {
            return;
        }
        let title: string = "";
        let desc: string = "";
        for (let i = 0; i < this.bFInfoItemArr.length; i++) {
            const element = this.bFInfoItemArr[i];            
            if(i == 0) {
                title = "";
                desc = `${cfg.Age}`;
            }
            else if(i == 1) {
                title = "";
                desc = `${cfg.Height}`;
            }
            else if(i == 2) {
                title = "";
                desc = cfg.Character;
            }
            else if(i == 3) {
                title = "";
                desc = cfg.Favorite;
            }
            else {
                title = "";
                desc = cfg.Hate;
            }
            element.onInit(title, desc);            
        }

    }
    // 
    private _updateFavor(cfg: TrBoyFriend, data: BoyFriend) {
        if(cfg == null) {
            return;
        }
        const id = this._currentBoyId * 1000 + data.Level;
        const lvCfg = ConfigManager.tables.TbBoyFriendLevel.get(id);
        if(lvCfg == undefined) {
            console.error(",id:%s,lv:%s", this._currentBoyId, data.Level);
            return;
        }

        const lastLvTotalExp = data.NextLvTotalExp;
        const dtExp = Math.max(data.Exp - lastLvTotalExp, 0);
        this.progressBarFavor.progress = dtExp / lvCfg.Exp;
        this.labProgressFavor.string = `${dtExp}/${lvCfg.Exp}`;
        this.labLevel.string = `Lv${data.Level}`;
    }

    // 
    private _updateIntro(cfg: TrBoyFriend, data: BoyFriend) {
        if(cfg == null) {
            return;
        }
        
        const unlockList: number[] = Array.from(cfg.IntroUnlock.keys()).sort((a, b) => a - b);
        for (let i = 0; i < this.labIntroArr.length; i++) {
            const element = this.labIntroArr[i];
            const mwNode = this.nodeIntroMWArr[i];
            if(i < cfg.Intro.length) {
                element.node.active = true;
                const key = unlockList[i];
                const isUnlock = this._isIntroUnlock(key, cfg.IntroUnlock.get(key), data);
                element.string = isUnlock ? cfg.Intro[i] : "";
                mwNode.active = !isUnlock;
            }
            else {
                element.node.active = false;
            }            
        }
    }

    // 
    private _isIntroUnlock(unlockType: number, value: number | undefined, data: BoyFriend) : boolean {
        if(value == undefined) {
            return false;
        }
        
        switch (unlockType) {
            case BFIntroUnlockType.BFFavor:
                return data.Level >= value;
            case BFIntroUnlockType.StroyLineNum:
                return false;
        }
        return true;
    }

    
    
    //#region 
    // 
    public onClickBtnGift() {

    }

    // 
    public onClickOurStory() {

    }

    public onClickBg() {
        oops.gui.remove(UIID.UIBoyFriendInfo);
    }

    //#endregion
}