import {
    Node, EventTouch, _decorator, Component, Label, Button, SpriteFrame, Vec3, Vec2, tween, Tween, UIOpacity,
    CCInteger, CCString, CCBoolean, CCFloat, log, error, input, NodePool, instantiate, Prefab, UITransform, director, EventHandle
} from "cc";

import { CCComp } from "db://oops-framework/module/common/CCComp";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { PlayerSystem } from "db://assets/script/game/gameplay/Manager/PlayerSystem";
import ConfigManager from '../manager/Config/ConfigManager';
import { sys, Event } from 'cc';
import { v3 } from "cc";
import { ScrollView } from "cc";
import { Sprite } from "cc";
import { BFInfoItem } from "./BFInfoItem";
import { TrBoyFriend } from "../schema/schema";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../common/config/GameUIConfig";
import { ProgressBar } from "cc";
import { BoyFriend } from "../gameplay/GameDataModel/BoyFriend";
import { PianoData } from '../gameplay/GameDataModel/MiniGameData';
import { GameEvent } from "../common/config/GameEvent";
import { UIBoyFriendSendGiftItem } from "./UIBoyFriendSendGiftItem";
const { ccclass, property } = _decorator;


@ccclass('UIBoyFriendSendGift')
export class UIBoyFriendSendGift extends CCComp {

    //#region  
    @property(Sprite)
    spIcon: Sprite = null!;
    @property(Node)
    nodeNewOurStory: Node = null!;
    @property(ProgressBar)
    progressBarFavor: ProgressBar = null!;    
    @property(Label)
    labLevel: Label = null!;
    @property(Label)
    labName: Label = null!;
    @property(Label)
    labFavorDt: Label = null!;
    @property(Label)
    labProgressFavor: Label = null!;
    @property(Label)
    labSendGiftCount: Label = null!;
    @property(Node)
    nodeNextBoy: Node = null!;
    @property(Label)
    labNextBoyName: Label = null!;
    @property(Node)
    nodeLastBoy: Node = null!;
    @property(Label)
    labLastBoyName: Label = null!;
    @property(Prefab)
    prefabItem: Prefab = null!;
    @property(ScrollView)
    scrollViewItems: ScrollView = null!;
    @property(Node)
    nodeScrollViewContent: Node = null!;
    @property(Button)
    btnClear: Button = null!;
    @property(Button)
    btnReduce: Button = null!;
    @property(Button)
    btnAdd: Button = null!;
    


    private _currentBoyId: number = -1;
    private _bfListCache: UIBoyFriendSendGiftItem[] = [];
    private _selectShopId: number = 0;
    // 
    private _currentInputNum: number = 0; 
    // 
    private _currentMaxNum: number = 0;

    //#endregion
    // args {Id:Id}
    onAdded(args: any) {
        this._currentBoyId = args.Id;
        return true;
    }

    protected onEnable(): void {
        oops.message.on(GameEvent.BoyFriendExpChange, this._sendGiftMessage, this);
    }
    protected onDisable(): void {
        oops.message.off(GameEvent.BoyFriendExpChange, this._sendGiftMessage, this);
    }

    start() {
        this._onRefresh();

    }


    _onRefresh() {
        this._onUpdateInfo();
    }

    reset() {
    }


    onDestroy() {
        
    }

    private _sendGiftMessage(event: any, exp: number) {
        this._onUpdateInfo();
        this._updateFavor();

        this.labFavorDt.string = `+${exp}`;
        // 
    }

    private _onUpdateInfo() {

        const list = ConfigManager.tables.TbShopGift.getDataList();
        const count = list.length; // 
        let totalX: number = 0;
        for (let i = 0; i < count; i++) {
            const trShopGift = list[i];
            let item: UIBoyFriendSendGiftItem = null!;
            if(i < this._bfListCache.length) {
                item = this._bfListCache[i];
            }
            else{
                const node = instantiate(this.prefabItem);
                node.active = true;
                item = node.getComponent(UIBoyFriendSendGiftItem)!;
                this.nodeScrollViewContent.addChild(node);
                this._bfListCache.push(item);
            }
            item.node.setPosition(v3(totalX, 0));
            totalX += item.node.size.width + 40;
            
            if(this._selectShopId == 0) {

            }
            item.onInit(this._currentBoyId, trShopGift.Id, this._selectShopId == trShopGift.Id, this._onItemClickBack.bind(this));
        }
        
        this.scrollViewItems.vertical = false;
        this.scrollViewItems.horizontal = totalX > this.scrollViewItems.node.size.width;
        this.nodeScrollViewContent.uiTransform.setContentSize(totalX, this.nodeScrollViewContent.uiTransform.height);
    }
    
    private _onItemClickBack(id: number) {
        if(this._selectShopId == id) {
            return;
        }
        this._selectShopId = id;
        this._onUpdateInfo();
    }

    // 
    private _updateFavor() {
        const cfg = ConfigManager.tables.TbBoyFriend.get(this._currentBoyId)

        if(cfg == null) {
            return;
        }
        const data = PlayerSystem.Instance.GetBoyFriendById(this._currentBoyId);

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
    private _updateBottomGift() {
        this.labSendGiftCount.string = this._currentInputNum.toString();
    }

    private _updateBoyArrow() {
        const bfList = ConfigManager.tables.TbBoyFriend.getDataList();
        let index = 0;

        let lastName = "";
        let nextName = "";
        for (let i = 0; i < bfList.length; i++) {
            const element = bfList[i];
            if(element.Id === this._currentBoyId) {
                index = i;
                lastName = i > 0 ? bfList[i-1].Name : "";
                nextName = i < (bfList.length - 1) ? bfList[i+1].Name : "";
                break;
            }
        }

        this.nodeNextBoy.active = index < (bfList.length-1);
        this.nodeLastBoy.active = index > 0;
        this.labLastBoyName.string = lastName;
        this.labNextBoyName.string = nextName;
    }

    private _resetGiftSelect() {
        this._currentInputNum = 1;
        // this._selectShopId = 0;

    }
    
    
    //#region 
    public onClickLastBoy() {

    }

    public onClickNextBoy() {
        
    }

    public onClickClearGift() {
        if(this._currentInputNum <= 1) {
            console.log("");
            return;
        }
        this._currentInputNum = 1;
        this._updateBottomGift();
    }
    public onClickReduce() {
        const num = this._currentInputNum - 1;
        if(num < 1) {
            console.log("");
            return;
        }
        this._currentInputNum = num;

        this._updateBottomGift();
    }

    public onClickAdd() {
        const num = this._currentInputNum + 1;
        if(num > this._currentMaxNum) {
            console.log("");
            return;
        }
        this._currentInputNum = num;

        this._updateBottomGift();
    }

    public onClickAll() {
        if(this._currentInputNum === this._currentMaxNum) {
            console.log("");
            return;
        }
        this._currentInputNum = this._currentMaxNum;

        this._updateBottomGift();
    }
    // 
    private onClickSendGift() {
        const shopGiftCfg = ConfigManager.tables.TbShopGift.get(this._selectShopId);
        if(shopGiftCfg == undefined) {
            console.error(",id:%s", this._selectShopId);
            return;
        }
        
        const itemCfg = ConfigManager.tables.TbItem.get(shopGiftCfg.ItemId);
        if(itemCfg == undefined) {
            console.error(",id:%s", shopGiftCfg.ItemId);
            return;
        }
        if(PlayerSystem.Instance.GetItemCount(shopGiftCfg.ItemId) == 0) {
            console.log("0");
            return;
        }
        
        const bfCfg = ConfigManager.tables.TbBoyFriend.get(this._currentBoyId);
        if(bfCfg == undefined){
            return;
        }
        const isHasFavor = bfCfg.FavoriteItem.findIndex((v) => v === shopGiftCfg.ItemId) != -1;
        const isHasHit = !isHasFavor && bfCfg.ConfuseItem.findIndex((v) => v === shopGiftCfg.ItemId) != -1;
        let percent = 1;
        if(isHasFavor) {
            percent = bfCfg.FavoriteItemNum / 100;
        }
        else if(isHasHit) {
            percent = bfCfg.ConfuseItemNum / 100;
        }
        
        PlayerSystem.Instance.UpdateItemCount(shopGiftCfg.ItemId, -1 * this._currentInputNum);
        const exp = parseInt(itemCfg.Param) * this._currentInputNum * percent;
        PlayerSystem.Instance.AddBoyFriendExp(this._currentBoyId, exp);
    }
    // 
    public onClickClose() {
        oops.gui.remove(UIID.UIBoyFriendInfo);
    }

    // 
    public onClickOurStory() {
        
    }

    // 
    public onClickGetGift() {
        oops.gui.remove(UIID.UIBoyFriendInfo);
    }

    //#endregion
}