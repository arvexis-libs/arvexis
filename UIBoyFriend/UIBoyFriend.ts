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
import { HeadBFItem } from "./HeadBFItem";
import { UIMainVideoComp } from "../UIMainVideo/UIMainVideoComp";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../common/config/GameUIConfig";
const { ccclass, property } = _decorator;


@ccclass('UIBoyFriend')
export class UIBoyFriend extends CCComp {

    //#region  
    // 
    @property(Node)
    nodeRoot: Node = null!;
    @property(Label)
    labName: Label = null!;
    @property(Label)
    labLevel: Label = null!;
    @property(Label)
    labIntro: Label = null!;
    @property(Prefab)
    itemBFHeadPrefab: Prefab = null!;
    @property(ScrollView)
    headBFScrollView: ScrollView = null!;
    @property(Node)
    headBFScrollViewContent: Node = null!;
    @property(Node)
    nodeOpenBottomBtn: Node = null!;
    @property(Node)
    nodeHeadBottom: Node = null!;
    @property(Node)
    nodeRightBtnBottomGroup: Node = null!;
    @property(Node)
    nodeHandTap: Node = null!;
    @property(Node)
    nodeLastBoy: Node = null!;
    @property(Node)
    nodeNextBoy: Node = null!;

    private _bfListCache: HeadBFItem[] = [];
    private _selectBFHeadIdx: number = -1;
    private readonly _noSlideOnScrollCount: number = 4;
    private _curHeadBottomIsOpen: boolean = false;
    private _handTapInitPosY: number = 0;
    private _rightBtnBottomGroupInitPosY: number = 0;
    private readonly _handTapMoveHeight: number = 230;
    private _isInitBottom: boolean = false;
    private _currentPlayVideoId: number = -1;


    //#endregion

    onAdded(args: any) {
        
        return true;
    }

    onLoad() {
        
        if(sys.platform == sys.Platform.DESKTOP_BROWSER) {
            let player1 = ConfigManager.tables.TbPlayer.get(1);
            let player2 = ConfigManager.tables.TbPlayer.get(2);

            const player1InitXinWu = ConfigManager.tables.TbConst.get("InitTokenNum1")?.Int || 0;
            const player2InitXinWu = ConfigManager.tables.TbConst.get("InitTokenNum2")?.Int || 0;
            GameData.updateCurrency(player1?.ItemId!, player1InitXinWu);
            GameData.updateCurrency(player2?.ItemId!, player2InitXinWu);
        }
    }

    async start() {
        this._onRefresh();

        UIMainVideoComp.getInstance().playUrl(PlayerSystem.Instance.HomeVideoId, true);
    }

    private _initBottomPos() {
        if(this._isInitBottom) {
            return;
        }
        this._isInitBottom = true;
        this._handTapInitPosY = this.nodeHandTap.getPosition().y;
        this._rightBtnBottomGroupInitPosY = this.nodeRightBtnBottomGroup.getPosition().y;
    }

    _onRefresh() {
        this._onUpdateInfo();
    }

    reset() {
    }


    protected update(dt: number): void {

    }

    onDestroy() {
        // this.off(GameEvent.ShowPhone);
        // this.off(GameEvent.RefreshHomeView);
        // this.off(GameEvent.OnWealthChanged);
        // this.off(GameEvent.OnSkinChange);
        // this.off(GameEvent.OnShowHomeTip);
        // this.off(GameEvent.OnGuideShow);
        // this.off(GameEvent.PlayerLevelChange);
        // this.off(GameEvent.TaskListRefresh);
        // this.off(GameEvent.OnlineClock);
        // this.off(GameEvent.OnCloseLvup);
        // this.off(GameEvent.LayerRemove);
        // this.off(GameEvent.MAIN_VIDEO_END);
        // this.off(GameEvent.OnPlayHomeVideo);
        // this.off(GameEvent.RoleSelectItemClick);
        // this.off(GameEvent.OnItemValueChanged);
        // this.off(GameEvent.ConstellationStarUp);
        // this.off(GameEvent.ConstellationLevelUp);
        // this.off(GameEvent.UIStoryLineRefresh);
        // this.off(GameEvent.UIStoryKilledEvent);
        // this.off(GameEvent.UIStoryCompleteEvent);
        // this.off(GameEvent.OnReturnUIHome);
    }

    
    
    //#region 
    // 
    private _onUpdateInfo() {
        const playerId = PlayerSystem.Instance.CurPlayId;

        const cfg = ConfigManager.tables.TbBoyFriend.get(playerId);
        if(cfg == undefined || cfg == null) {
            return;
        }

        this.labName.string = cfg.Name;
        this.labIntro.string = cfg.BriefIntro;
        this.labLevel.string = `Lv${PlayerSystem.Instance.CurLv}`;

        this._onUpdateBottomHeadList();
        this._changeHeadBottomState();
    }

    private _boyFriendPlayVideo(id: number) {
        PlayerSystem.Instance.PlayVideo(id, this._videoPlayEnd.bind(this));
    }

    private _videoPlayEnd() {
        UIMainVideoComp.getInstance().playUrl(PlayerSystem.Instance.HomeVideoId, true);
    }

    // 
    private _onUpdateBottomHeadList() {
        let totolX = 0;
        const bfList = ConfigManager.tables.TbBoyFriend.getDataList();
        const count = bfList.length;
        this.nodeLastBoy.active = this._curHeadBottomIsOpen && this._selectBFHeadIdx > 0;
        this.nodeNextBoy.active = this._curHeadBottomIsOpen && (this._selectBFHeadIdx+1) < count;
        if(!this._curHeadBottomIsOpen && this._selectBFHeadIdx > 0) {
            return;
        }
        for (let i = 0; i < count; i++) {
            const trBoyFriend = bfList[i];
            let item: HeadBFItem = null!;
            if(i < this._bfListCache.length) {
                item = this._bfListCache[i];
            }
            else{
                const node = instantiate(this.itemBFHeadPrefab);
                node.active = true;
                item = node.getComponent(HeadBFItem)!;
                this.headBFScrollViewContent.addChild(node);
                this._bfListCache.push(item);
            }
            item.node.setPosition(v3(totolX, 0));
            totolX += item.node.size.width + 40;
            
            this._onUpdateBoyFriendItemCell(item, i, trBoyFriend.Id);
        }
        
        this.headBFScrollView.vertical = false;
        this.headBFScrollView.horizontal = this._bfListCache.length > this._noSlideOnScrollCount;
        this.headBFScrollViewContent.uiTransform.setContentSize(totolX, this.headBFScrollViewContent.uiTransform.height);
    }

    private _onUpdateBoyFriendItemCell(item: HeadBFItem, index:number, id: number) {
        if(item == null) {
            return;
        }

        if(this._selectBFHeadIdx == -1) {
            this._selectBFHeadIdx = index;
        }
        // item.node.active = true;
        item.onInit(index, id, index == this._selectBFHeadIdx, this._onBoyFriendItemClickBack.bind(this));
    }

    private _onBoyFriendItemClickBack(index: number) {
        if(this._selectBFHeadIdx == index) {
            return;
        }

        this._selectBFHeadIdx = index;

        this._onUpdateBottomHeadList();
    }

    // 
    private _changeHeadBottomState() {
        this.nodeHeadBottom.active = this._curHeadBottomIsOpen;
        this.nodeOpenBottomBtn.active = !this._curHeadBottomIsOpen;

        const moveY = this._curHeadBottomIsOpen ? this._handTapMoveHeight : 0;
        this.nodeHandTap.setPosition(v3(this.nodeHandTap.position.x, this._handTapInitPosY + moveY));
        this.nodeRightBtnBottomGroup.setPosition(v3(this.nodeRightBtnBottomGroup.position.x, this._rightBtnBottomGroupInitPosY + moveY));

        this._onUpdateBottomHeadList();
    }

    // 
    public onClickHeadBottomOpen(){
        if(this._curHeadBottomIsOpen)
            return;
        this._initBottomPos();
        this._curHeadBottomIsOpen = true;
        this._changeHeadBottomState();
    }

    // 
    public onClickHeadBottomClose(){
        if(!this._curHeadBottomIsOpen)
            return;
        this._initBottomPos();
        this._curHeadBottomIsOpen = false;
        this._changeHeadBottomState();
    }

    // 
    public onClickLastBoy() {
        if(this._selectBFHeadIdx <= 0) {
            return;
        }
        this._selectBFHeadIdx--;
        this._onUpdateBottomHeadList();
    }

    // 
    public onClickNextBoy() {
        const list = ConfigManager.tables.TbBoyFriend.getDataList();
        if(this._selectBFHeadIdx >= list.length) {
            return;
        }
        this._selectBFHeadIdx++;
        this._onUpdateBottomHeadList();
    }

    // 
    public onClickBtnInfo() {
        const bfList = ConfigManager.tables.TbBoyFriend.getDataList();
        if(this._selectBFHeadIdx < 0 || this._selectBFHeadIdx >= bfList.length) {
            console.error(",index:%s", this._selectBFHeadIdx);
            return;
        }
        const cfg = bfList[this._selectBFHeadIdx];

        oops.gui.openAsync(UIID.UIBoyFriendInfo, {Id: cfg.Id});
    }

    // 
    public onClickBtnFashion() {

    }

    // 
    public onClickBtnGift() {

    }

    // 
    public onClickOurStory() {

    }

    // 
    public onClickTheStoryWithHim() {

    }

    //#endregion
}

