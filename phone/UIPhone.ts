import { ScrollView } from 'cc';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { UIPhoneItem } from './UIPhoneItem';
import { List } from '../../../../extensions/oops-plugin-framework/assets/libs/collection/List';
import { GameData } from '../gameplay/GameDataModel/GameData';
import ConfigManager from '../manager/Config/ConfigManager';
import { changeLabelText, changeSpriteImage, getImagePath, getPhoneHeadIconPath } from '../common/UIExTool';
import { TimerManager } from '../../../../extensions/oops-plugin-framework/assets/core/common/timer/TimerManager';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { instantiate } from 'cc';
import { PhoneChatType, UIPhoneChatItem } from './UIPhoneChatItem';
import { v3 } from 'cc';
import { v2 } from 'cc';
import { ChatData, PhoneData } from '../gameplay/GameDataModel/PhoneData';
import { UIID } from '../common/config/GameUIConfig';
import { size } from 'cc';
import { TrChat } from '../schema/schema';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { GameEvent } from '../common/config/GameEvent';
import { UITransform } from 'cc';
import { Animation } from 'cc';
import { AnimationState } from 'cc';
import { Prefab } from 'cc';
import { UIMusicManager } from '../gameplay/Manager/UIMusicManager';
import { SdkManager } from '../../modules/sdk/SdkManager';
import { UIHome } from '../UIHome/UIHome';
import { ImageAsset } from 'cc';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIPhone')
export class UIPhone extends CCComp {
    
    @property(Node)
    scrollView_init: Node = null!;
    @property(Node)
    scrollViewInitContent: Node = null!;

    @property(ScrollView)
    scrollViewChat: ScrollView = null!;
    @property(UITransform)
    scrollViewChatViewTransfrom: UITransform = null!;
    @property(Node)
    scrollViewChatContent: Node = null!;
    @property(Prefab)
    itemChatPrefab: Prefab = null!;
    @property(Prefab)
    itemInitPrefab: Prefab = null!;
    @property(UITransform)
    chatScrollBgUITransform: UITransform = null!;

    @property(Sprite)
    picShow: Sprite = null!;

    @property(Node)
    chatBtnBgNode: Node = null!;

    @property([Node])
    chatBtnArr: Node[] = [];
    @property([Sprite])
    chatSpArr: Sprite[] = [];
    @property([Label])
    chatBtnLabelArr: Label[] = [];
    @property(Label)
    showSendLabel: Label = null!;
    @property(Node)
    chatListBgNode: Node = null!;
    @property(Node)
    initListBgNode: Node = null!;
    @property(Label)
    labTitle: Label = null!;
    @property(Animation)
    animation: Animation = null!;


    private _isCheckReply: boolean = false;
    /** id */
    private _curRoleId: number = -1;
    /**  false  */
    private _isDetailTag: boolean = false;
    private _waitCd: number = 0;

    
    private _roleChatList: number[] = [];
    private _chatList: number[] = [];
    // private _showChatIds: number[] = [];
    private _chatBtnCellHeight: number = 0;
    /**  */
    private _initChatBgHeight: number = 0;
    private _scrollViewChatContentInitHeight: number = 0;
    /** id */
    private _showChatIds: number[] = [];
    private _showChatTexts: string[] = [];
    /** id */
    private _appointNextId: number = -1;
    private itemChatList: Node[] = [];
    private contentHeightBefore : number = 0;
    /** scrollviewheight */
    private scrollChangeHeigt: number = 0;
    // private originalPosition : number = 0;
    private isScrolling: boolean = false;
    private itemInitNodeList: Node[] = [];
    private _timeoutId: NodeJS.Timeout | null = null;
    /** 0-2 */
    private _replyIndex: number = 0;
    private _replyCd: number = 0;
    private _isReplyOwner: boolean = true;
    private readonly _replyText: string = "...";
    /**  */
    private _cancelAwait: boolean = false;
    /** id */
    private _latestChatId: number = 0;
    private _latestChatItemHeight: number = 0;


    protected onLoad(): void {      
        // this._chatBtnCellHeight = this.chatBtnArr[0].uiTransform.contentSize.height;
        // this._initChatBgHeight = this.chatBtnBgNode.uiTransform.contentSize.height;
        // this._scrollViewChatContentInitHeight = this.scrollViewChatContent.uiTransform.contentSize.height;
        // 
        this.scrollViewChat.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this);
    }

    /**
     * 
     * @param args  
     * roleId 
     * @returns 
     */
    onAdded(args: any) {        
        this._curRoleId = -1;
        if(args.roleId) {
            this._curRoleId = args.roleId;
        }
        
        return true;
    }

    async testForCheckCfg() {
        
        const list = ConfigManager.tables.TbChat.getDataList();
        let data: Map<number, boolean> = new Map();
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if(element.NextId != -1 && !element.IfAnswer) {
                const cfg = ConfigManager.tables.TbChat.get(element.NextId);
                if(cfg == undefined || cfg == null) {
                    // result.push(element.NextId);
                    console.error("id%s,idid",element.Id);
                }
            }
            if(element.Picture != "") {
                const imageAsset = await oops.res.loadAsync<SpriteFrame>("UIPhone", element.Picture + "/spriteFrame");
                if(imageAsset == null || imageAsset == undefined) {
                    console.error("id%s, Picture ",element.Id);
                }
            }
            // if(element.Picture != "" && getImagePath(element.Picture) == "") {
            //     console.error("id%s,Picture ",element.Id);
            // }
            if(element.IfAnswer && element.ChoiceNextIds.length == 0) {
                console.error("id%s,",element.Id);
            }
            if(element.ChoiceNextIds.length > 0) {
                for (let j = 0; j < element.ChoiceNextIds.length; j++) {
                    const id = element.ChoiceNextIds[j];
                    const cfg = ConfigManager.tables.TbChat.get(id);
                    if(cfg == undefined || cfg == null) {
                        console.error("id%s,idid",id);
                    }
                }
            }
            if(element.Type == 0 && element.Text != "") {
                console.error("id%s,Text",element.Id);
            }
            if(element.Type == 0 && element.ChoiceNextIds.length == 0) {
                console.error("id%s,",element.Id);
            }
            if(element.Type == 1 && (element.Picture == "" || element.BigPicture == "")) {
                console.error("id%s,",element.Id);
            }
            if(element.Type == 4 && element.Text == "") {
                console.error("id%s,",element.Id);
            }

            if(!data.has(element.GroupId)) {
                data.set(element.GroupId, true);
                if(element.PeopleId == 0) {

                    console.error("id%s,",element.Id);
                }
            }
            if(element.Type == 4 && element.Text.length > 0 && element.Text.at(0) === ' ') {
                console.error("id%s,",element.Id);
            }
        }
        console.log("Phone testForCheckCfg Down!!!");
    }
    start() {
        this.unscheduleAllCallbacks();
        this.chatListBgNode.active = false; 
        // this.init();
        this.scheduleOnce(this.init, 0);

        // this.testForCheckCfg();
    }
    protected onDestroy(): void {
        this.clearDelay();
        this.unscheduleAllCallbacks();
        this._cancelAwait = true;
        this.contentHeightBefore = 0;
        this.scrollChangeHeigt = 0;
    }

    protected update(dt: number): void {
        if (this._waitCd < 0 || !this._isCheckReply || !this._isDetailTag)
        {
            return;
        }
        
        this._waitCd -= dt;
        this._replyCd -= dt;
        if(!this._isReplyOwner && this._replyCd <= 0) {
            this._replyCd = 0.5;
            this.labTitle.string = "" + this._replyText.substring(0, this._replyIndex);
            this._replyIndex = (++this._replyIndex % (this._replyText.length+1));
        }
        
        if (this._waitCd < 0)
        {
            this._checkReply();
        }
    }

    protected onDisable(): void {
        PlayerSystem.Instance.TryLevelUp();
        oops.message.dispatchEvent(GameEvent.RefreshHomeView);
        oops.message.off(GameEvent.ShowPhoneChange, this._otherDataChange, this);
    }

    protected onEnable(): void {
        oops.message.on(GameEvent.ShowPhoneChange, this._otherDataChange, this);
        UIMusicManager.inst.playUIMusic(UIID.Phone, 1024);
    }

    reset(): void {
    }

    private _otherDataChange(){
        // 
        // if(!this._checkReply(true)) {
        //     this._updateAll(true);
        // }
        this._updateAll();
    }

    init(){
        this._chatBtnCellHeight = 106;//this.chatBtnArr[0].uiTransform.contentSize.height;
        this._initChatBgHeight = 341;//this.chatBtnBgNode.uiTransform.contentSize.height;
        this._scrollViewChatContentInitHeight = this.scrollViewChatContent.uiTransform.contentSize.height;
        this._isCheckReply = false;
        this.picShow.node.active = false;
        if(this._curRoleId > 0) {
            this._isDetailTag = true;
        }
        else {
            this._isDetailTag = false;
        }
        this._cancelAwait = false;        
        this._latestChatId = 0;

        if(this._isDetailTag) {
            this._checkReply(true);
            this.animation.play("UIPhoneAnim_Left");
            SdkManager.inst.event("message_view", {userid: this._curRoleId, message_view: 1});
        }
        else{
            this._updateAll(true);
        }
    }

    /**
     * 
     * @param isReset 
     */
    private async _updateAll(isReset: boolean = false)
    {        
        // this.initListBgNode.active = false;
        if(!this._isDetailTag) {
            this.picShow.node.active = false;
        }
        this.chatListBgNode.active = this._isDetailTag; 
        // 
        const result = await this._updateBottomButton();
        // (result.needScrollTo || (isReset && this.scrollViewChat.node.uiTransform.height <= this.scrollViewChatContent.uiTransform.height)
        
        if (this._isDetailTag)
        {
            if (this._cancelAwait) return;
            // this.chatBtnBgNode.active = false;
            await this._updateDetail(isReset);
            // 
            // this.chatBtnBgNode.active = result.isHasAnswer;
        }
        else
        {
            this._updateInit(isReset);
        }
        
        this.chatListBgNode.active = this._isDetailTag; 
    }

    // srollview
    private _selfScrollToBottom(){
        this.scrollViewChat.stopAutoScroll();
        this.scrollViewChat.scrollToBottom();
    }

    /**
     * 
     * @param isReset 
     */
    private _updateInit(isReset: boolean = false)
    {
        if (this._isDetailTag){
            return;
        }
        if (this._roleChatList.length == 0)
        {
            this._roleChatList = GameData.GetChatListOnId();
        }
        
        // this._updateInitList();
        // this.scrollViewLayout_init.total(this._roleChatList.length);
        this.createInitItems();
    }

    private async createInitItems() {
        let totalY = 0;
        for (let i = 0; i < this._roleChatList.length; i++) {
            let item: Node = null!;
            if(i < this.itemInitNodeList.length) {
                item = this.itemInitNodeList[i];
            }
            else{
                item = instantiate(this.itemInitPrefab);
                this.scrollViewInitContent.addChild(item);
                this.itemInitNodeList.push(item);
            }
            item.active = false;
            const roleId = this._roleChatList[i];
            const chatData = GameData.PlayerData.PhoneData.ChatDatas.get(roleId);//[index];
            if(chatData) {
                const itemTemplate = item.getComponent(UIPhoneItem);
                const cfg = ConfigManager.tables.TbChat.get(chatData.ChatIds[chatData.ChatIds.length - 1]);
                if(cfg && itemTemplate){
                    const chatType = cfg.Type as PhoneChatType;
                    const height = itemTemplate.OnInit(chatData.RoleId, chatType == PhoneChatType.Text ? cfg.Text : "[]", chatData.LastTime, this._onClickRoleBack.bind(this));
                    item.setPosition(v3(0, -1*totalY));
                    totalY += height;  
                    this.showGuide(chatData, itemTemplate)
                    item.active = true;
                }
                else{
                    console.error("UIPhoneitemUIPhoneItem,chatId:%s", chatData.ChatIds[chatData.ChatIds.length - 1]);
                }
            }
        }
        for (let i = this._roleChatList.length; i < this.itemInitNodeList.length; i++) {
            this.itemInitNodeList[i].active = false;
        }
        
        this.scrollViewInitContent.uiTransform.setContentSize(this.scrollViewInitContent.uiTransform.width, totalY);
    }

    showGuide(chatData:ChatData, uIPhoneItem:UIPhoneItem)
    {
        ///,
        // if (chatData.RoleId == 1) {
        //     GuideManager.Instance.TryShowGuide(1210,[uIPhoneItem.bgButton],()=>{},()=>{})
        // }
    }

    /**
     * 
     */
    private _onClickRoleBack(roleId: number)
    {
        this._onChangeRoleShow(roleId);
    }

    async _onChangeRoleShow(roleId: number) {
        this._curRoleId = roleId;
        this._isDetailTag = true;
        this._clearCurrentRoleShow();
        await this._checkReply(true);
        this.animation.play("UIPhoneAnim_Left");
    }

    private async _clearCurrentRoleShow() {        
        this.labTitle.string = "";
        this._readyCdToReply(false);
        this.clearDelay();
        this.unscheduleAllCallbacks();
        this.scrollViewChat.stopAutoScroll();
        // this.scrollViewChatContent.uiTransform.setContentSize(this.scrollViewChatContent.uiTransform.width, this._scrollViewChatContentInitHeight);
        // this.scrollViewChat.scrollToTop(0);
    }

    /**
     *  
     * @param isReset 
     */
    private async _updateDetail(isReset: boolean = false)
    {
        if(!this._isDetailTag) {
            return;
        }
        // 
        await this.nextFrame();
        
        this._chatList.length = 0;        
        var chatData = GameData.GetChatDataListByRoleId(this._curRoleId);
        if(chatData) {
            //  ChatIds  _detailList
            this._chatList = [...chatData.ChatIds];
            const cfg = ConfigManager.tables.TbChat.get(chatData.ChatIds[chatData.ChatIds.length - 1]);
            // 
            if(cfg && cfg.PeopleId == 0 && cfg.IfAnswer) {
                this._chatList.pop();
            }
        }
        const lastChatId = this._chatList.last();
        if(this._latestChatId == 0 ) {
            this._latestChatId = lastChatId;
        }
        const isChange = this._latestChatId != lastChatId;
        // Content
        this.contentHeightBefore = this.contentHeightBefore > 0 ? this.contentHeightBefore : this.scrollViewChatContent.uiTransform.height;

        // console.log("_updateDetail _chatList len:%s,isChange:%s,isReset:%s",this._chatList.length, isChange, isReset);
        this.createItemChats();
        
        let time = 0;
        if(isReset && this.scrollViewChatContent.uiTransform.height >= this.scrollViewChat.node.uiTransform.height) {
            this.unschedule(this._selfScrollToBottom);
            this.scheduleOnce(this._selfScrollToBottom, 0);
        }
        else if(!isReset && isChange) {
            time = 0.12;
            this.unschedule(this.scrollToNewMessage);
            this.scheduleOnce(this.scrollToNewMessage, 0);
        }

        await this.nextFrame(time);
    }

    /**
     * 
     */
    private createItemChats() {
        let totalY = 0;
        for (let i = 0; i < this._chatList.length; i++) {

            let item: Node = null!;
            if(i < this.itemChatList.length) {
                item = this.itemChatList[i];
            }
            else{
                item = this.getItemChat();
                this.scrollViewChatContent.addChild(item);
                this.itemChatList.push(item);
            }
            item.active = true;
            
            const chatId = this._chatList[i];
            const chatItem = item.getComponent(UIPhoneChatItem);
            if(chatItem) {
                const cfg = ConfigManager.tables.TbChat.get(chatId);
                var groupId = cfg  == undefined ? 0 : cfg.GroupId;
                let nextGroupId = 0;
                const nextId = i + 1 < this._chatList.length ? this._chatList[i+1] : 0;
                if(nextId != 0) {
                    const nextCfg = ConfigManager.tables.TbChat.get(nextId);
                    nextGroupId = nextCfg  == undefined ? 0 : nextCfg.GroupId;
                }
                var isEnd = cfg?.NextId == -1 || (groupId != 0 && nextGroupId != 0 && nextGroupId != groupId);                
                const height = chatItem.onInit(chatId, this._picClickCallback.bind(this), cfg, isEnd);
                item.setPosition(v3(0, -1*totalY));
                totalY += height;
                this._latestChatItemHeight = height;       
            }
        }

        for(let i = this._chatList.length; i < this.itemChatList.length; i++) {
            this.itemChatList[i].active = false;
        }
        
        this.scrollViewChatContent.uiTransform.setContentSize(this.scrollViewChatContent.uiTransform.width, totalY);
    }
    
    private getItemChat() {
        return instantiate(this.itemChatPrefab);
    }

    // 
    private scrollToNewMessage() {
        // console.log("scrollToNewMessage.isScrolling:%s",this.isScrolling);
        //         
        if (this.isScrolling) return;

        const contentHeightAfter = this.scrollViewChatContent.uiTransform.height;
        const latestItemHeight = this._latestChatItemHeight;
        const heightDiff = latestItemHeight + this.scrollChangeHeigt;//contentHeightAfter - this.contentHeightBefore + this.scrollChangeHeigt;
        this.contentHeightBefore = 0;
        this.scrollChangeHeigt = 0;

        // 
        const currentOffset = this.scrollViewChat.getScrollOffset();
        
        // 
        const newOffsetY = currentOffset.y + heightDiff;
        console.log("scrollToNewMessage currentOffset.y:%s,newOffsetY:%s,heightDiff:%s,latestItemHeight:%s,scrollChangeHeigt:%s",
            currentOffset.y.toFixed(2),newOffsetY.toFixed(2), heightDiff.toFixed(2), latestItemHeight.toFixed(2), this.scrollChangeHeigt.toFixed(2));
        
        // 
        this.scrollViewChat.scrollToOffset(v2(0, newOffsetY), 0.3);
    }
    // 
    private onScrolling() {
        this.isScrolling = true;

        // 
        this.unschedule(this.resetScrolling);
        this.scheduleOnce(this.resetScrolling, 0.3);
    }
    // 
    private resetScrolling = () => {
        this.isScrolling = false;
    }
    /**
     * 
     * @param picPath 
     * @returns 
     */
    private _picClickCallback(picPath: string) {
        if(picPath == "" || picPath == null) {
            return;
        }

        this._showPic(picPath);
    }

    private async _showPic(picPath: string){
        await changeSpriteImage(this.picShow, picPath, "UIPhone");
        this.picShow.node.active = true;
    }


    /**
     * 
     * scroll
     * @returns {needScrollTo, isHasAnswer}
     */
    private async _updateBottomButton() {
        const result = {needScrollTo:false, isHasAnswer:false};
        this.chatBtnBgNode.active = this._isDetailTag;
        if (!this._isDetailTag) {
            return result;
        }

        this._showChatIds.length = 0;
        this._showChatTexts.length = 0;
        this._appointNextId = -1;
        const chatData = GameData.GetChatDataListByRoleId(this._curRoleId);
        if (!chatData || chatData.ChatIds.length === 0) {
            this.chatBtnBgNode.active = false;
            return result;
        }

        const newId = chatData.ChatIds[chatData.ChatIds.length - 1];
        const curCfg = ConfigManager.tables.TbChat.get(newId);
        const isHasAnswer = curCfg != null && ((!curCfg.IfAnswer && curCfg.NextId > 0) || curCfg.IfAnswer);
        this.chatBtnBgNode.active = isHasAnswer;
        // this.chatBtnBgNode.active = false;
        
        if (curCfg == null) {
            return result;
        }

        if(!curCfg.IfAnswer && curCfg.NextId > 0) {
            const nextCfg = ConfigManager.tables.TbChat.get(curCfg.NextId);
            // this.chatBtnBgNode.active = nextCfg != null && nextCfg.PeopleId == 0;
            if (nextCfg == null) {
                return result;
            }
            this._showChatIds = [...nextCfg.ChoiceNextIds];
            this._showChatTexts = [...nextCfg.ChoiceTexts];
        }
        else{
            this._showChatIds = [...curCfg.ChoiceNextIds];
            this._showChatTexts = [...curCfg.ChoiceTexts];
        }

        this.showSendLabel.string = "";
        for (let i = 0; i < this.chatBtnArr.length; i++) {
            const chatBtn = this.chatBtnArr[i];
            chatBtn.active = i < this._showChatIds.length;
            if (i < this._showChatIds.length) {
                this.chatBtnLabelArr[i].string = this._showChatTexts[i];
            }
        }
        
        // 
        // , 2
        const reserveBtnCount = Math.max(this.chatBtnArr.length - this._showChatIds.length, 0);
        let reduceChatBgHeight = isHasAnswer ? (reserveBtnCount * this._chatBtnCellHeight + 43 * reserveBtnCount) : this._initChatBgHeight;
        const dt = this._initChatBgHeight - reduceChatBgHeight;
        if(isHasAnswer) {
            this.chatBtnBgNode.uiTransform.setContentSize(size(this.chatBtnBgNode.uiTransform.contentSize.width, dt));
        }
        console.log("_updateBottomButton reserveBtnCount:%s, reduceChatBgHeight:%s, dt:%s",reserveBtnCount, reduceChatBgHeight, dt);

        // this.scrollView_chat.uiTransform.setContentSize(size(this.scrollView_chat.uiTransform.contentSize.width, this._initScrollView_chat_height + reduceChatBgHeight));
        // // viewviewmask
        // this.scrollView_chat_view_transfrom.setContentSize(size(this.scrollView_chat_view_transfrom.contentSize.width, this._initScrollView_chat_height + reduceChatBgHeight));
        await this.nextFrame();
        const backResult = await this._adjustScrollSize(reduceChatBgHeight, isHasAnswer);    
        await this.nextFrame();
        result.isHasAnswer = isHasAnswer;
        result.needScrollTo = backResult;
        return result;
;
    }

    /**
     * 
     * @param reduceChatBgHeight 
     * @param isHasAnswer 
     */
    private async _adjustScrollSize(reduceChatBgHeight: number, isHasAnswer: boolean) {
        let chatScrollBgUiTransformHeight = this.chatScrollBgUITransform.contentSize.height;
        let scrollHeight = reduceChatBgHeight;
        if(!isHasAnswer) {
            scrollHeight = chatScrollBgUiTransformHeight - 177;
        }
        else {
            scrollHeight = chatScrollBgUiTransformHeight  - 177 - (this._initChatBgHeight - reduceChatBgHeight);            
        }
        console.log("_adjustScrollSize isHasAnswer:%s, scrollHeight:%s, reduceChatBgHeight:%s,scrollViewChatContentHeight:%s,chatScrollBgUiTransformHeight:%s",
            isHasAnswer, scrollHeight.toFixed(2), this._initChatBgHeight-reduceChatBgHeight, this.scrollViewChatContent.uiTransform.height.toFixed(2),chatScrollBgUiTransformHeight.toFixed(2));

        this.scrollChangeHeigt = chatScrollBgUiTransformHeight - scrollHeight;
        this.scrollViewChat.node.uiTransform.setContentSize(size(this.scrollViewChat.node.uiTransform.contentSize.width, scrollHeight));
        // viewviewmask
        this.scrollViewChatViewTransfrom.setContentSize(size(this.scrollViewChatViewTransfrom.contentSize.width, scrollHeight));

        // if(scrollHeight < this.scrollViewChatContent.uiTransform.height) {
        //     this.scheduleOnce(()=>{this.scrollViewChat.node.uiScrollView.scrollToBottom(0.3);});  
        // }
        // if((isHasAnswer || reduceChatBgHeight > 0) && this.scrollViewChatContent.uiTransform.height >= scrollHeight) {
        //     this.scheduleOnce(()=>{this.scrollViewChat.node.uiScrollView.scrollToBottom();}); 
        // }
        
        return (isHasAnswer || reduceChatBgHeight > 0) && this.scrollViewChatContent.uiTransform.height >= scrollHeight;
    }
    private nextFrame(second: number = 0) {
        // this.clearDelay();
        // return new Promise(resolve => {
        //     this._timeoutId = setTimeout(resolve, ms)
        // });
        return new Promise(resolve => {
            this.scheduleOnce(resolve, second);
        });
    }

    private clearDelay() {
        if (this._timeoutId != null) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
    }
    /**
     * 
     * @param idx 
     * @returns 
     */
    private _showSendInfo(idx: number) {
        if(idx < 0 || idx >= this._showChatIds.length) {
            console.error("show send info idx error: " + idx);
            return;
        }
        this._appointNextId = this._showChatIds[idx];

        // this.showSendLabel.string = this._showChatTexts[idx];
        this.onClickSend();
    }

    /**
     * 
     * @param check 
     * @param cd 
     */
    private _readyCdToReply(check: boolean = true, cd: number = 1.5, isOwer: boolean = true) {
        this._isCheckReply = check;
        this._waitCd = cd;
        this._replyCd = 0;
        this._replyIndex = 0;
        this._isReplyOwner = true;

        if(check && !isOwer) {
            this.labTitle.string = "";
            this._isReplyOwner = false;
        }
    }

    private _resetReply(){
        this._waitCd = -1;
        this._isCheckReply = false;
        this._replyCd = -1;
    }

    /**
     * 
     * @param isFirstIn id 
     * @returns 
     */
    private async _checkReply(isFirstIn: boolean = false) :Promise<boolean> {
        this._readyCdToReply(false);
        this.labTitle.string = "";

        const chatData = GameData.GetChatDataListByRoleId(this._curRoleId);
        if(chatData == null) {
            return false;
        }
        if(isFirstIn) {
            await this._updateAll(isFirstIn);
            if (this._cancelAwait) return false;
        }
        const cfg = ConfigManager.tables.TbChat.get(chatData.ChatIds[chatData.ChatIds.length - 1]);
        // 
        if(cfg && !cfg.IfAnswer && cfg.NextId != -1) {

            // if(!isFirstIn) {
            //     this._updateAll();
            //     this._showMessageAudio(cfg?.PeopleId == 0);
            // }
            
            const nextCfg = ConfigManager.tables.TbChat.get(cfg.NextId);
            if(nextCfg && !nextCfg.IfAnswer) {
                if(!isFirstIn) {
                    await this._updateAll();
                    if (this._cancelAwait) return false;
                    this._showMessageAudio(cfg?.PeopleId == 0);
                }
                GameData.AddPhoneChatDataOnId(this._curRoleId, cfg.NextId);
                const replyTime = nextCfg.PeopleId != 0 ? (0.1 * nextCfg.Text.length) : 1.5;
                console.log("next reply text:%s, replyTime:%s",nextCfg.Text, replyTime);
                this._readyCdToReply(true, Math.max(replyTime, 1.5), nextCfg.PeopleId == 0);
                return true;
            }
            
        }
        this._resetReply();
        // if(cfg && !cfg.IfAnswer) {
        //     let audio =ConfigManager.tables.TbAudio.get(2010)!;
        //     oops.audio.playEffect(audio?.Resource, "Audios");
        // }
        // 
        if(!isFirstIn) {
            await this._updateAll();            
            if (this._cancelAwait) return false;
            this._showMessageAudio(cfg?.PeopleId == 0);
        }
        return false;
    }

    private _showMessageAudio(isOwn: boolean = false) {
        let audioId = 2010;
        if(isOwn) {
            audioId = 2009;
        }
        const audio =ConfigManager.tables.TbAudio.get(audioId)!;
        if(audio) {
            oops.audio.playEffect(audio?.Resource, "Audios");
        }
        else {
            console.error(" id:%s", audioId);
        }
        
    }
    
    /**
     * 
     * @param idx 
     * @returns 
     */
    private async _onClickReply()
    {
        const appointNextId = this._appointNextId;
        if (appointNextId < 0)
        {
            return;
        }
        this._appointNextId = -1;
        
        GameData.AddPhoneChatDataOnId(this._curRoleId, appointNextId);
        
        var cfg = ConfigManager.tables.TbChat.get(appointNextId);      
        
        if (cfg && cfg.NextId != -1 && !cfg.IfAnswer)
        {
            this._readyCdToReply(true, 0);
        }
        else {
            this._updateAll();
            this._showMessageAudio(true);
        }
    }

    public onClickBack()
    {
        if (this._isDetailTag)
        {            
            this._changeToInit();
        }
        else
        {
            this._onClickClose();
        }
    }

    private async _changeToInit() {
        this._clearCurrentRoleShow();
        this._isDetailTag = false;
        this._updateAll();
        this.animation.play("UIPhoneAnim_Right");
    }
    private _onClickClose()
    {
        let ins = oops.gui.get(UIID.UIHome)
        ins?.getComponent(UIHome)!.ShowGuide();
        oops.gui.remove(UIID.Phone);
        oops.message.dispatchEvent(GameEvent.PhoneDataChange);
    }
    public onClickClosePic()
    {
        this.picShow.node.active = false;
    }
    /**
     * 
     */
    public onClickSend() {
        // let audio =ConfigManager.tables.TbAudio.get(2009)!;
        //     oops.audio.playEffect(audio?.Resource, "Audios");
        this._onClickReply();
    }

    public onClickBtn1(){
        this._showSendInfo(0);
    }
    public onClickBtn2(){
        this._showSendInfo(1);
    }
    
}


