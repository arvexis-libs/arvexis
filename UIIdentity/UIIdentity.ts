import { Label, instantiate, SpriteFrame} from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from "db://oops-framework/module/common/CCComp";
import ConfigManager from "../manager/Config/ConfigManager";
import{TrIdentity} from '../schema/schema';
import { HeroineDataManager } from '../UIMain/HeroineDataManager';
import { oops } from 'db://oops-framework/core/Oops';
import { Utility } from '../gameplay/Utility/Utility';
import { IdentityCard } from '../UIIdentity/IdentityCard';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('UIIdentity')
export class UIIdentity extends CCComp {

    @property(Label) TxtCurLevel:Label=null!;//
    @property(Label) TxtNextLevel:Label=null!;//
    @property(Label) TxtSubliming: Label = null!;//
    @property(Label) TxtSublimingEnableLv: Label = null!;//
    @property(Label) TxtLevelUpNeed: Label = null!;//
    @property(Sprite) SpriteLevelUpNeed: Sprite = null!;//

    @property(Node) ArrPropAdd: Node[] = [];//
    @property(Node) RedPoint: Node = null!;//
    @property(Node) Card: Node = null!;
    @property(Node) CardContainer: Node = null!;

    private _arrTrIndentity: TrIdentity[] = null!;
    protected onLoad(): void {
        this._arrTrIndentity = ConfigManager.tables.TbIdentity.getDataList();
    }

    start() {
        this.InitCard();
        this.setCurLevel(11);
    }

    InitCard()
    {
        HeroineDataManager.Instance.GetDicIdentity().forEach((value, key) => {
            if (key != 0) {
                let trIdentity = ConfigManager.tables.TbIdentity.get(key)!;
                let clone = instantiate(this.Card);
                clone.parent = this.CardContainer;
                clone.active = true;
                clone.getComponent(IdentityCard)!.trIndentity = trIdentity;
            }
        })
    }

    setCurLevel(curLevel: number)
    {
        this.TxtCurLevel.string = curLevel.toString();
    }

    setNextLevel(nextLevel: number)
    {
        this.TxtNextLevel.string = nextLevel.toString();
    }
    setSubliming(Subliming: number)
    {
        this.TxtSubliming.string = Subliming.toString();
    }
    setLevelUpNeed(levelUpNeed: number)
    {
        this.TxtLevelUpNeed.string = levelUpNeed.toString();
    }
    setRedPoint(isShow: boolean)
    {
        this.RedPoint.active = isShow;
    }

    OnClose_Click() {
        oops.gui.remove(UIID.UIIdentity);
    }

    update(deltaTime: number) {
        
    }

    reset() {

    }
}

