import { _decorator, Component, Node, Button } from 'cc';
import { GameManager } from 'db://oops-framework/core/game/GameManager';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { ItemEnum } from '../gameplay/GameDataModel/GameEnum';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ConditionMgr } from '../gameplay/Manager/ConditionMgr';
import ConfigManager from "../manager/Config/ConfigManager";
import { ConditionAndOr } from '../gameplay/Manager/ConditionMgr';
import { HeroineDataManager } from './HeroineDataManager';
import { TrMagicBoxRandom } from '../schema/schema';
import { StorySystem } from '../gameplay/Manager/StorySystem';
const { ccclass, property } = _decorator;

export enum MagicType {
    ShowText,
    Effect,
    Story,
}

@ccclass('MagicBox')
export class MagicBox {
    private nodeRoot: Node = null!;
    private Tip_0: Node = null!;
    private Tip_1: Node = null!;
    private Tip_2: Node = null!;

    private _listMagicBox:TrMagicBoxRandom[] = [];
    public Init(node: Node) {
        this._listMagicBox = ConfigManager.tables.TbMagicBoxRandom.getDataList();
        this.nodeRoot = node;
        this.nodeRoot.getComponent(Button)!.enabled = true;
        //let btn = node.getComponent(Button)!;
        node.on(Button.EventType.CLICK, this.BtnMagicBoxTips_Click, this);
        this.Tip_0 = node.getChildByName("Tip_0")!;
        this.Tip_1 = node.getChildByName("Tip_1")!;
        this.Tip_2 = node.getChildByName("Tip_2")!;
        this.PopMagicEvent();
    }

    private PopMagicEvent() 
    {
        let result = this.canClick();
        if (!result) {
            return;
        }

        if (!this.IsKeyEnough()) {
            oops.gui.openAsync(UIID.UIConstellationTips, "");
            return;
        }

        let magicBox = this.getSpecialMagicBox();
        if (magicBox!=null) {
            this.showResult(magicBox);
            return;
        }

        let randMagicBox = this.getInTimeMagicBox();
        if (randMagicBox) {
            this.showResult(randMagicBox);
        }

        // let s = this.getRand();
        // console.log("s", s);
        // if (s <= this._arrRandom[0]) {
        //     //
        //     this.Tip_0.active = true;
        // }
        // else if (s <= this._arrRandom[1]) {
        //     //
        //     this.Tip_1.active = true;
        // }
        // else if (s <= this._arrRandom[2]) {
        //     //
        //     this.Tip_2.active = true;
        // }
    }

    BtnMagicBoxTips_Click() {
        this.Tip_0.active = false;
        this.Tip_1.active = false;
        this.Tip_2.active = false;
        this.nodeRoot.getComponent(Button)!.enabled = false;
    }

    private canClick()//
    {
        return true;
    }

    private IsKeyEnough() {
        var keyCount = GameData.getCurrency(ItemEnum.Key);
        return keyCount > 0;
    }
    private getSpecialMagicBox()//ID
    {
        for (let i = 0; i < this._listMagicBox.length; i++) {
            let magicBox = this._listMagicBox[i]
            let result = ConditionMgr.inst.checkAllConditions(magicBox!.ConditionId, magicBox!.ConditionType);
            if (result) {
                let isUsed = HeroineDataManager.Instance.IsMagicBoxUsed(magicBox.Id)
                if (!isUsed) {
                    return magicBox;
                }
            }
        }

        return null;
    }

    private getInTimeMagicBox()//
    {
        let sumWeight = 0;
        let listResult = [];
        let nowTimeType = 1//
        for (let i = 0; i < this._listMagicBox.length; i++) {
            const element = this._listMagicBox[i];
            if (element.TriggerTime == nowTimeType && element.Weight != -1) {
                listResult.push(element);
                sumWeight+=element.Weight;
            }
        }

        //20   30    60\\ 49
        let rand = this.getRand(0, sumWeight);
        for (let i = 0; i < listResult.length; i++) {
            const element = listResult[i];
            rand -= element.Weight;
            if (rand <= 0) {
                return element;
            }
        }

        console.error("");
        return null;
    }

    private getRand(min: number, max: number) {
        let mi = Math.ceil(min);
        let ma = Math.floor(max);
        return Math.floor(Math.random() * (ma - mi + 1)) + mi;
    }

    private showResult(magicBox: TrMagicBoxRandom) {
        switch (magicBox.MagicBoxType) {
            case 1:
                //
                this.Tip_0.active = true;
                oops.gui.openAsync(UIID.UIConstellationTips, "+");
                break;
            case 2:
                //
                this.Tip_1.active = true;
                let uiid: UIID = magicBox.UIId;
                oops.gui.openAsync(uiid);
                break;
            case 3:
                //
                this.Tip_2.active = true;
                StorySystem.Instance.Play(magicBox.StoryId)
                break;
            default:
                break;
        }

        GameData.updateCurrency(ItemEnum.Key, -1);
    }
}


