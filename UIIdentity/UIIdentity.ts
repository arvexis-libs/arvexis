import { Label, instantiate, SpriteFrame} from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from "db://oops-framework/module/common/CCComp";
import ConfigManager from "../manager/Config/ConfigManager";
import{TrIdentity, TrIdentityLevel} from '../schema/schema';
import { HeroineDataManager } from '../UIMain/HeroineDataManager';
import { oops } from 'db://oops-framework/core/Oops';
import { Utility } from '../gameplay/Utility/Utility';
import { IdentityCard } from '../UIIdentity/IdentityCard';
import { UIID } from '../common/config/GameUIConfig';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { ItemEnum, SublimingType } from '../gameplay/GameDataModel/GameEnum';
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
    private _curTrIdentity:TrIdentity = null!;
    private _curTrIdentityLevel: TrIdentityLevel = null!;
    private _curIdentityCard: IdentityCard = null!;
    private _dicIdentityCard: Map<number, IdentityCard> = new Map();//
    private _listLastProp: number[] = [0, 0, 0, 0, 0];//
    protected onLoad(): void {
        this._arrTrIndentity = ConfigManager.tables.TbIdentity.getDataList();
    }

    start() {
        this.InitAllCard();
        this.changeIdentityCard()
    }

    InitAllCard()
    {
        HeroineDataManager.Instance.GetDicIdentity().forEach((value, key) => {
            if (key != 0) {
                let trIdentity = ConfigManager.tables.TbIdentity.get(key)!;
                let clone = instantiate(this.Card);
                clone.parent = this.CardContainer;
                clone.active = true;
                clone.name = key.toString();
                let identityCard = clone.getComponent(IdentityCard)!;
                identityCard.trIndentity = trIdentity;
                this._dicIdentityCard.set(key, identityCard);
            }
        })

    }

    changeIdentityCard()
    {
        if (!this._curIdentityCard) {
            let firstKey:number = this._dicIdentityCard.keys().next().value!;
            this._curIdentityCard = this._dicIdentityCard.get(firstKey)!;
            this._curTrIdentity = ConfigManager.tables.TbIdentity.get(firstKey)!;;
        }
        else{
            
        }
        this._curIdentityCard.node.setSiblingIndex(this.CardContainer.children.length - 1); // 
        let curCardLevel = HeroineDataManager.Instance.GetIdentityLevelById(this._curTrIdentity.Id);
        this._curTrIdentityLevel = HeroineDataManager.Instance.GetTrIdentityLevelByIdAndlevel(this._curTrIdentity.Id, curCardLevel)!
        this.refreshCurCard();
    }

    refreshCurCard()
    {
        this.setCurLevel();
        this.setNextLevel();
        this.setProp();
        this.setSubliming();
        this.setTxtSublimingEnableLv();
        this.setLevelUpNeed();
        this.setRedPoint();
        this._curIdentityCard.Refresh();
    }

    setCurLevel()
    {
        let dic = HeroineDataManager.Instance.GetDicIdentity()!
        this.TxtCurLevel.string = dic.get(this._curTrIdentity.Id)!.toString();
    }

    setNextLevel()
    {
        let curCardLevel = HeroineDataManager.Instance.GetIdentityLevelById(this._curTrIdentity.Id);
        let next = HeroineDataManager.Instance.GetNextTrIdentityLevelById(this._curTrIdentity.Id, curCardLevel)!
        if (next) {
            this.TxtNextLevel.node.active = true;
            this.TxtNextLevel.string = next.Level.toString();
        }
        else {
            this.TxtNextLevel.node.active = false;
        }
    }

    setProp()
    {
        let curCardLevel = HeroineDataManager.Instance.GetIdentityLevelById(this._curTrIdentity.Id);
        let arr = HeroineDataManager.Instance.GetArrProp(this._curTrIdentity.Id ,curCardLevel)!;
        for (let i = 0; i < this.ArrPropAdd.length; i++) {
            const element = this.ArrPropAdd[i];
            let iconSprite:Sprite = element.getChildByName("Icon")?.getComponent(Sprite)!;
            let IconName = HeroineDataManager.Instance.GetPropIcon(i+1);
            oops.res.loadAsync<SpriteFrame>("CommonRes",`${IconName}/spriteFrame`).then((sp)=>{
                iconSprite.spriteFrame = sp;
            });
            let value = element.getChildByName("Value")?.getComponent(Label)!
            this._listLastProp[i] = arr[i] - Number(value.string);
            value.string = arr[i].toString();
        }

        this.showPropAdd();
    }

    showPropAdd()
    {
        for (let i = 0; i < this.ArrPropAdd.length; i++) {
            const element = this.ArrPropAdd[i];
            let valueAdd:Label = element.getChildByName("ValueAdd")?.getComponent(Label)!;
            valueAdd.node.active = true;
            valueAdd.string = `+${this._listLastProp[i]}`;
        }

        oops.timer.scheduleOnce(() => {
            if (this.ArrPropAdd) {
                for (let i = 0; i < this.ArrPropAdd.length; i++) {
                    const element = this.ArrPropAdd[i];
                    let valueAdd:Label = element.getChildByName("ValueAdd")?.getComponent(Label)!;
                    valueAdd.node.active = false;
                }
            }
        }, 1);
    }
    setSubliming()
    {
        let arr = this._curTrIdentity.TxtSubliming
        let sublimingType = Number(arr[0]);
        let desc = arr[1];
        let value = arr[2];
        switch(sublimingType)
        {
            case SublimingType.AllProp:
                this.TxtSubliming.string = `${desc}${value} `;
                break;
            case SublimingType.MagicReward:
                this.TxtSubliming.string = `${desc}${value} `;
                break;
            case SublimingType.SingleProp:
                let tr = ConfigManager.tables.TbHeroinePropType.get(this._curTrIdentity.SublimingPropID)!
                this.TxtSubliming.string = `${desc.replace("{0}", tr?.Name)}${value} `;
                break;
        }

    }
    setTxtSublimingEnableLv()
    {
        this.TxtSublimingEnableLv.string = `${this._curTrIdentity.SublimingLevel}`;
        
    }
    setLevelUpNeed()
    {
        let currencyType = this._curTrIdentityLevel.NeedCurrency[0]
        const itemCfg = ConfigManager.tables.TbItem.get(currencyType);
        oops.res.loadAsync<SpriteFrame>("CommonRes", `${itemCfg?.Icon}/spriteFrame`).then((sp) => {
            this.SpriteLevelUpNeed.spriteFrame = sp
        });
        
        let curHas = GameData.getCurrency(currencyType);
        this.TxtLevelUpNeed.string = `${curHas}/${this._curTrIdentityLevel.NeedCurrency[1]}` ;
    }
    setRedPoint()
    {
        this.RedPoint.active = this.checkCanLevelUp();
    }

    OnClose_Click() {
        oops.gui.remove(UIID.UIIdentity);
    }

    OnBtnLevelUp_Click()

    {
        if (this.checkCanLevelUp()) {
            HeroineDataManager.Instance.IdentityLevelup(this._curTrIdentityLevel.IdentityId);
            this.refreshCurCard();
        }
        else
        {
            oops.gui.openAsync(UIID.UIConstellationTips, "");
        }
    }

    OnBtnGo_Click()
    {
        oops.gui.open(UIID.UIBoyFriend);
        oops.gui.remove(UIID.UIIdentity);
        
    }

    OnBtnChange_Click()
    {
        this.changeIdentityCard();
    }

    checkCanLevelUp()
    {
        let currencyType = this._curTrIdentityLevel.NeedCurrency[0]
        let curCount = GameData.getCurrency(currencyType);
        return curCount >= this._curTrIdentityLevel.NeedCurrency[1]
    }

    update(deltaTime: number) {
        
    }

    reset() {

    }
}

