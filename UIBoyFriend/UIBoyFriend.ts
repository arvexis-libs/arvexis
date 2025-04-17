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
import { Animation } from "cc";
import { Sprite } from "cc";
import { HeartSystem } from "../gameplay/Manager/HeartSystem";
import { color } from "cc";
import { UINotification } from "../common/UINotification/UINotification";
import { Notification } from "../common/UINotification/Notification";
import { TipsNoticeUtil } from "../gameplay/Utility/TipsNoticeUtil";
import { TrBoyFriend, TrInteraction } from "../schema/schema";
import { Utility } from "../gameplay/Utility/Utility";
import { GameEvent } from "../common/config/GameEvent";
import { devNull } from "os";
import { tips } from "../common/prompt/TipsManager";
const { ccclass, property } = _decorator;


@ccclass('UIBoyFriend')
export class UIBoyFriend extends CCComp {

    //#region  
    // 
    // @property(Node)
    // nodeRoot: Node = null!;
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
    @property(Label)
    labLastBoyName: Label = null!;
    @property(Node)
    nodeNextBoy: Node = null!;
    @property(Label)
    labNextBoyName: Label = null!;
    // @property(Node)
    // storyBtn: Node = null!;

    // 
    @property(Button)
    btnOpenTap: Button = null!;
    @property(Node)
    nodeTapChangeView: Node = null!;    
    @property(Sprite)
    spBtnInters: Sprite[] = [];
    @property(Animation)
    animationTapChangeView: Animation | null = null;
    @property(Label)
    labInteractionIn: Label = null!;
    @property(Sprite)
    spInteractionIn: Sprite = null!;
    @property(Label)
    labInteractionOut: Label = null!;
    @property(Sprite)
    spInteractionOut: Sprite = null!;
    // end
    @property(Node)
    nodeTipsTap: Node = null!;

    private _bfListCache: HeadBFItem[] = [];
    private _selectBFHeadIdx: number = -1;
    private readonly _noSlideOnScrollCount: number = 4;
    private _curHeadBottomIsOpen: boolean = false;
    private _handTapInitPosY: number = 0;
    private _rightBtnBottomGroupInitPosY: number = 0;
    private readonly _handTapMoveHeight: number = 230;
    private _isInitBottom: boolean = false;
    //
    private _playingActionVideoId: number = 0;
    // 
    private _tipsTapTimeCd = 6;
    private readonly _tipsTapTimeTotal = 5;
    private _isChangingBoy: boolean = false; // 
    private _changBoyCd: number = 0.2; // s



    //#endregion

    onAdded(args: any) {
        
        return true;
    }

    onLoad() {
        
        // if(sys.platform == sys.Platform.DESKTOP_BROWSER) {
        //     let player1 = ConfigManager.tables.TbPlayer.get(1);
        //     let player2 = ConfigManager.tables.TbPlayer.get(2);

        //     const player1InitXinWu = ConfigManager.tables.TbConst.get("InitTokenNum1")?.Int || 0;
        //     const player2InitXinWu = ConfigManager.tables.TbConst.get("InitTokenNum2")?.Int || 0;
        //     GameData.updateCurrency(player1?.ItemId!, player1InitXinWu);
        //     GameData.updateCurrency(player2?.ItemId!, player2InitXinWu);
        // }

        // this.storyBtn.on('click', this.onClickTheStoryWithHim, this);
    }

    protected onEnable(): void {
        this.on(GameEvent.MAIN_VIDEO_END, this.onHandler, this);
        this.on(GameEvent.BoyFriendExpChange, this.onHandler, this);
        this.on(GameEvent.BoyFriendSendGift, this.onHandler, this);

        
    }

    protected onDisable(): void {
        this.off(GameEvent.MAIN_VIDEO_END);
        this.off(GameEvent.BoyFriendExpChange);
        this.off(GameEvent.BoyFriendSendGift);
    }

    async start() {
        this._onRefresh();
        this._boyChangedReplayVideo();
    }

    reset() {
        this._tipsTapTimeCd = this._tipsTapTimeTotal;
        this._bfListCache.length = 0;
        this._selectBFHeadIdx = -1;
        this._curHeadBottomIsOpen = false;
        this._playingActionVideoId = 0;
        this._isChangingBoy = false;
    }

    private _initBottomPos() {
        if(this._isInitBottom) {
            return;
        }
        this._isInitBottom = true;
        this._handTapInitPosY = this.nodeHandTap.getPosition().y;
        this._rightBtnBottomGroupInitPosY = this.nodeRightBtnBottomGroup.getPosition().y;
    }


    protected update(dt: number): void {
        // 
        if(this._playingActionVideoId == 0){
            this._tipsTapTimeCd -= dt;
            if (this._tipsTapTimeCd < 0) {
                this.nodeTipsTap.active = true;
                this._tipsTapTimeCd = this._tipsTapTimeTotal;
            }
        }

             
        if(this._isChangingBoy ){//&& UIMainVideoComp.getInstance().IsMainVideoPlaying) {
            this._changBoyCd -= dt;   
            if(this._changBoyCd < 0) {
                this._isChangingBoy = false;
            }
        }
    }

    onDestroy() {
        
    }

    private onHandler(event: string, args: any): void {
        switch (event) {
            case GameEvent.MAIN_VIDEO_END:
                this._playIdleVideo();
                break;
            case GameEvent.BoyFriendExpChange:
                this._onUpdateInfo();
                break;
            case GameEvent.BoyFriendSendGift:
                this._receiveGiftCheckVideo(args.Id);
                break;
        }
    }
    
    
    //#region 

    _onRefresh() {        
        this.btnOpenTap.node.active = true;
        this.nodeTapChangeView.active = false;
        this._tipsTapTimeCd = this._tipsTapTimeTotal;

        this._onUpdateBottomHeadList();
        this._onUpdateInfo();
        this._changeHeadBottomState();
        this._updateInteractionUI();
    }

    // 
    private _onUpdateInfo() {
        const cfg = this.curBoyCfg;
        if(cfg == undefined) {
            return;
        }

        const bfData = PlayerSystem.Instance.GetBoyFriendById(cfg.Id);

        this.labName.string = cfg.Name;
        this.labIntro.string = cfg.BriefIntro;
        this.labLevel.string = `LV.${bfData.Level}`;
    }

    private _playIdleVideo() {
        this._playingActionVideoId = 0;
        this._boyChangedReplayVideo();
    }

    // 
    private _receiveGiftCheckVideo(itemId: number) {
        const cfg = this.curBoyCfg;
        if(cfg == undefined) {
            return;
        }
        const isHasFavor = cfg.FavoriteItem.findIndex((v) => v === itemId) != -1;
        if(isHasFavor) {
            this._playingActionVideoId = cfg.FavoriteItemVideo;
            this._boyChangedReplayVideo(this._playingActionVideoId);
            return;
        }
        const isHasHit = cfg.ConfuseItem.findIndex((v) => v === itemId) != -1;
        if(isHasHit) {
            this._playingActionVideoId = cfg.ConfuseItemVideo;
            this._boyChangedReplayVideo(this._playingActionVideoId);
        }
    }

    private get curBoyCfg() {
        const bfList = ConfigManager.tables.TbBoyFriend.getDataList();
        if(this._selectBFHeadIdx < 0 || this._selectBFHeadIdx >= bfList.length) {
            return;
        }
        const cfg = bfList[this._selectBFHeadIdx];        
        return cfg;
    }

    private _boyChangedReplayVideo(videoId: number = -1) {
        let id = videoId;
        if(id < 0) {
            const cfg = this.curBoyCfg;
            if(cfg == undefined) {
                return;
            }
            id = cfg.VideoId;
            // PlayerSystem.Instance.ChangeCurBoyFrined(cfg.Id);
        }
        
        this._isChangingBoy = true;
        this._changBoyCd = 0.5;
        UIMainVideoComp.getInstance().playUrl(id, true);
    }

    // 
    private _onUpdateBottomHeadList() {
        let totolX = 0;
        const bfList = ConfigManager.tables.TbBoyFriend.getDataList();
        const count = bfList.length;
        this.nodeLastBoy.active = this._curHeadBottomIsOpen && this._selectBFHeadIdx > 0;
        this.nodeNextBoy.active = this._curHeadBottomIsOpen && (this._selectBFHeadIdx+1) < count;

        this.labLastBoyName.string = this._selectBFHeadIdx > 0 ? bfList[this._selectBFHeadIdx-1].Name : "";
        this.labNextBoyName.string = (this._selectBFHeadIdx+1) < count ? bfList[this._selectBFHeadIdx+1].Name : "";

        if(!this._curHeadBottomIsOpen && this._selectBFHeadIdx > 0) {
            return;
        }

        if(this._bfListCache.length > 0) {
            for (let i = 0; i < this._bfListCache.length; i++) {
                const trBoyFriend = bfList[i];
                this._onUpdateBoyFriendItemCell(this._bfListCache[i], i, trBoyFriend.Id);
            }
        }
        else {
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
                totolX += item.node.size.width + 20;
                
                this._onUpdateBoyFriendItemCell(item, i, trBoyFriend.Id);
            }
            this.headBFScrollView.vertical = false;
            this.headBFScrollView.horizontal = this._bfListCache.length > this._noSlideOnScrollCount;
            this.headBFScrollViewContent.uiTransform.setContentSize(totolX, this.headBFScrollViewContent.uiTransform.height);
        }
    }

    private _onUpdateBoyFriendItemCell(item: HeadBFItem, index:number, id: number) {
        if(item == null) {
            return;
        }

        if(this._selectBFHeadIdx < 0) {
            this._selectBFHeadIdx = index;
        }
        // item.node.active = true;
        item.onInit(index, id, index == this._selectBFHeadIdx, this._onBoyFriendItemClickBack.bind(this));
    }

    private _onBoyFriendItemClickBack(index: number) {
        if(this._selectBFHeadIdx == index || this._isChangingBoy) {
            return;
        }

        this._selectBFHeadIdx = index;

        this._onRefresh();
        this._boyChangedReplayVideo();
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
    //#region 
    // 
    private _updateInteractionUI() {
        this._updateBtnInters();
        let actionId = PlayerSystem.Instance.GetInteractionType();
        let actionCfgId = HeartSystem.Instance.getCurActionCfgId(actionId);
        let data: TrInteraction = ConfigManager.tables.TbInteraction.get(actionCfgId)!;
        this.labInteractionIn.string = this.labInteractionOut.string = data.Name;
        this._updateInteractionIcon(data.Icon);
    }

    private async _updateInteractionIcon(url: string) {
        let spF = await Utility.loadImage(url, "UIBoyFriend");
        if (spF) {
            this.spInteractionIn.spriteFrame = this.spInteractionOut.spriteFrame = spF;
            this.spInteractionIn.sizeMode = this.spInteractionOut.sizeMode = Sprite.SizeMode.RAW; // 
        }
    }

    // 
    private _updateBtnInters() {
        for (let index = 0; index < this.spBtnInters.length; index++) {
            const element = this.spBtnInters[index];
            let [unlock, lv] = HeartSystem.Instance.IsInterUnlocked(index + 1);

            if (unlock)
                element.color = color(255, 255, 255, 255);
            else
                element.color = color(255, 255, 255, 153);


            // 
            const txtLockDes = element.node.getChildByName('txtLockDes')?.getComponent(Label);
            if (txtLockDes != null) {
                txtLockDes.node.active = !unlock;
                txtLockDes.string = `${lv}`;
            }

            let notiType = element.node.getComponent(UINotification);
            if(notiType != null)
                Notification.SetNeedRefresh(notiType.GetTypeKey());            
        }
    }
    
    private _playInterVideo() {
        let id = PlayerSystem.Instance.GetInteractionType();
        let actionCfgId = HeartSystem.Instance.getCurActionCfgId(id);//actionCfgId

        let cfg = ConfigManager.tables.TbInteraction.get(actionCfgId);
        if (cfg == null)
            return;

        let randomIndex = Math.floor(Math.random() * cfg.VideoIdList.length);
        console.log(randomIndex);
        let videoCfg = ConfigManager.tables.TbVideo.get(cfg.VideoIdList[randomIndex]);
        if (videoCfg == null)
            return;

        if (this._playingActionVideoId == videoCfg.Id && this._playingActionVideoId != 0)
            return;

        this._playingActionVideoId = videoCfg.Id;

        UIMainVideoComp.getInstance().playUrl(videoCfg.Id, false, undefined, true);
    }
    //#region 


    private onClickBack() {
        oops.gui.remove(UIID.UIBoyFriend);
        UIMainVideoComp.getInstance().stop(); // todo:  ?
        oops.gui.open(UIID.UIMain); // todo:  ? 
    }
    // 
    private onClickHeadBottomOpen(){
        if(this._curHeadBottomIsOpen)
            return;
        this._initBottomPos();
        this._curHeadBottomIsOpen = true;
        this._changeHeadBottomState();
    }

    // 
    private onClickHeadBottomClose(){
        if(!this._curHeadBottomIsOpen)
            return;
        this._initBottomPos();
        this._curHeadBottomIsOpen = false;
        this._changeHeadBottomState();
    }

    // 
    private onClickLastBoy() {
        if(this._isChangingBoy || this._selectBFHeadIdx <= 0) {
            return;
        }
        this._selectBFHeadIdx--;
        this._onRefresh();
        this._boyChangedReplayVideo();
    }

    // 
    private onClickNextBoy() {
        const list = ConfigManager.tables.TbBoyFriend.getDataList();
        if(this._isChangingBoy || this._selectBFHeadIdx >= list.length) {
            return;
        }
        this._selectBFHeadIdx++;
        this._onRefresh();
        this._boyChangedReplayVideo();
    }

    // 
    private onClickBtnInfo() {
        const bfList = ConfigManager.tables.TbBoyFriend.getDataList();
        if(this._selectBFHeadIdx < 0 || this._selectBFHeadIdx >= bfList.length) {
            console.error(",index:%s", this._selectBFHeadIdx);
            return;
        }
        const cfg = bfList[this._selectBFHeadIdx];

        oops.gui.openAsync(UIID.UIBoyFriendInfo, {Id: cfg.Id});
    }

    // 
    private onClickBtnFashion() {
        tips.confirm("", () => {
        }, "", () => {
        }, "", false);
    }

    // 
    private onClickBtnGift() {
        oops.gui.open(UIID.UIBoyFriendSendGift);
    }

    // 
    private onClickOurStory() {

    }

    // 
    private onClickTheStoryWithHim() {
        let playerid = 1;
        oops.gui.open(UIID.UILevel, playerid);
    }

    // 
    private onClickOpenTap() {
        this.btnOpenTap.node.active = false;
        this.nodeTapChangeView.active = true;
        // this.buttomBtnsParent.active = false;
        this.animationTapChangeView?.stop();
        this.animationTapChangeView?.play();
        this._updateBtnInters();
    }
    
    ///
    private onClickTapChanged(event: EventTouch, data: any) {
        let id = parseInt(data);
        //
        let [isUnlock, lv, Name] = HeartSystem.Instance.IsInterUnlocked(id);
        if (!isUnlock) {
            let audio = ConfigManager.tables.TbAudio.get(2016)!;
            oops.audio.playEffect(audio?.Resource, "Audios");
            TipsNoticeUtil.PlayNotice(Name + "");
            return;
        }

        this.btnOpenTap.node.active = true;
        this.nodeTapChangeView.active = false;
        
        PlayerSystem.Instance.SetInteractionType(id);
        this._updateInteractionUI();

        if (GameData.GetGuideStep()>=1120) {
            this._playInterVideo();
        }
    }
    // 
    private onClickInteractioClose(event: EventTouch, data: any) {
        this.btnOpenTap.node.active = true;
        this.nodeTapChangeView.active = false;
        this.animationTapChangeView?.stop();
    }

    

    //#endregion
    
}

