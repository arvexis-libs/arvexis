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
import { changeSpriteImage } from "../common/UIExTool";
const { ccclass, property } = _decorator;


@ccclass('UIBoyFriendSendGiftItem')
export class UIBoyFriendSendGiftItem extends Component {

    //#region  
    @property(Sprite)
    spIcon: Sprite = null!;
    @property(Label)
    labName: Label = null!;    
    @property(Label)
    labCount: Label = null!;
    
    @property(Node)
    nodeFavor: Node = null!;
    @property(Node)
    nodeSelected: Node = null!;


    private _clickCallBack: Function = null!;
    private _currentId: number = -1;
    private _currentBoyId: number = 0;

    //#endregion
    /**
     * 
     * @param id id
     * @param isSelect 
     * @param clickCallback 
     */
    public onInit(boyId: number, id: number, isSelect: boolean, clickCallback: (a:number) => void) {
       
        const shopGiftCfg = ConfigManager.tables.TbShopGift.get(id);
        if(shopGiftCfg == undefined) {
            console.error(",id:%s", id);
            return;
        }

        const itemCfg = ConfigManager.tables.TbItem.get(shopGiftCfg.ItemId);
        if(itemCfg == undefined) {
            console.error(",id:%s", shopGiftCfg.ItemId);
            return;
        }
        if(this._currentId != id) {
            changeSpriteImage(this.spIcon, itemCfg.Icon, "CommonRes");
        }
        
        this._currentBoyId = boyId;
        this._currentId = id;
        this._clickCallBack = clickCallback;

        this.nodeSelected.active = isSelect;
        const itemCount = PlayerSystem.Instance.GetItemCount(this._currentId);
        this.labCount.string = itemCount.toString();
        this.labName.string = itemCfg.Name;

        const bfCfg = ConfigManager.tables.TbBoyFriend.get(this._currentBoyId);
        if(bfCfg == undefined){
            return;
        }

        this.nodeFavor.active = bfCfg.FavoriteItem.findIndex((v) => v === shopGiftCfg.ItemId) != -1;
    }
    
    //#region 
    public onClick() {
        if(this._clickCallBack != null) {
            this._clickCallBack(this._currentId);
        }
    }

    //#endregion
}