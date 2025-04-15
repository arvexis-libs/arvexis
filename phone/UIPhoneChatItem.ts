import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { GameEvent } from '../common/config/GameEvent';
import ConfigManager from '../manager/Config/ConfigManager';
import { TimeExUtil } from '../common/TimeExUtils';
import { Button } from 'cc';
import { UITransform } from 'cc';
import { changeLabelText, changeSpriteImage, getImagePath } from '../common/UIExTool';
import { v3 } from 'cc';
import { UIMainVideoComp } from '../UIMainVideo/UIMainVideoComp';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { TrChat } from '../schema/schema';
const { ccclass, property } = _decorator;


export enum PhoneChatType {
    None = 0,
    /**  */
    Pic = 1,
    /**  */
    Video = 2,
    /** Gif */
    Gif = 3,
    /**  */
    Text = 4,
}

@ccclass('UIPhoneChatItem')
export class UIPhoneChatItem extends CCComp {
    
    
    @property(Node)
    baseBg: Node = null!;
    /**  */
    @property(Node)
    leftNode: Node = null!;
    @property(Node)
    leftBgImage: Node = null!;
    @property(Sprite)
    leftHeadImage: Sprite = null!;
    @property(Sprite)
    leftPicImage: Sprite = null!;
    @property(Node)
    leftPlayNode: Node = null!;
    @property(Label)
    leftContentText: Label = null!;
    /**  */
    @property(Node)
    rightNode: Node = null!;
    @property(Node)
    rightBgImage: Node = null!;
    @property(Sprite)
    rightHeadImage: Sprite = null!;
    @property(Sprite)
    rightPicImage: Sprite = null!;
    @property(Node)
    rightPlayNode: Node = null!;
    @property(Label)
    rightContentText: Label = null!;

    @property(Node)
    chatEndLineNode: Node = null!;



    private _picCallback: Function = null!;
    private _picPath: string = "";

    private _bgRectTransform: UITransform = null!;
    private _rootRectTransform: UITransform = null!;
    private readonly _maxWidth: number = 629;
    private readonly _minWidth: number = 80;
    private _labTextHeight: number = 0;
    private _picHeight: number = 0;
    private _initRootHeight: number = 0;
    // private _initBgHeight: number = 0;
    private _isLeft: boolean = false;
    private _initChatContentBgHeight: number = 0;
    private _videoId: number = 0;
    private _chatEndLineInitPosY = 0;
    _iconPath: string = "";
    // private _initLeftFavorBgPosY: number = 0;
    // private _initRightFavorBgPosY: number = 0;

    // get favorLabel(): Label {
    //     if(this._isLeft) {
    //         return this.leftFavorText;
    //     }

    //     return this.rightFavorText;
    // }
    // get favorBg(): Node {
    //     if(this._isLeft) {
    //         return this.leftFavorImage.node;
    //     }

    //     return this.rightFavorImage.node;
    // }

    get contentBg(): Node {
        if(this._isLeft) {
            return this.leftBgImage;
        }

        return this.rightBgImage;
    }

    get contentLabel(): Label {
        if(this._isLeft) {
            return this.leftContentText;
        }

        return this.rightContentText;
    }

    get picImage(): Sprite {
        if(this._isLeft) {
            return this.leftPicImage;
        }

        return this.rightPicImage;
    }

    get headImage(): Sprite {
        if(this._isLeft) {
            return this.leftHeadImage;
        }

        return this.rightHeadImage;
    }

    private _isInit = false;
    onLoad() {

        this._init();
    }

    private _init(){
        if(this._isInit) {
            return;
        }
        this._isInit = true;
        this._bgRectTransform = this.baseBg.getComponent(UITransform)!;
        this._rootRectTransform = this.node.getComponent(UITransform)!;
        this._initRootHeight = this._rootRectTransform.height;
        this._labTextHeight = this.contentLabel.node.uiTransform.height;
        this._chatEndLineInitPosY = this.chatEndLineNode.position.y;
        // this._initBgHeight = this._bgRectTransform.height;
        this._picHeight = 0;
        if (this.leftPicImage != null) {
            const picRectTransform = this.picImage.node.getComponent(UITransform);
            if (picRectTransform != null) {
                this._picHeight = picRectTransform.height;
            }
        }
        // 
        this._initChatContentBgHeight = this.leftBgImage.size.height;
        this._iconPath = "";
        // this._initLeftFavorBgPosY = this.leftFavorImage.node.position.y;
        // this._initRightFavorBgPosY = this.rightFavorImage.node.position.y;
    }

    reset(): void {
    }

    /**
     * @param isLeft 
     * @param content 
     * @param headKey  key
     * @param favorNum >0 
     * @param picKey key
     * @param bigPicKey key
     * @param picCallback 
     * @returns 
     */
    // public OnInit(isLeft: boolean, content: string, headKey: string, picKey: string = "", bigPicKey: string = "", video: string, picCallback: (a:string) => void = () => {}) : number {
    public onInit(chatId: number, picCallback: (a:string) => void = () => {}, chatCfg?: TrChat, isEnd: boolean = false) : number {        
        this._init();
        this._picCallback = picCallback;
        // this._isLeft = chatId != 0;
        let cfg = chatCfg;
        if(cfg == null) {
            cfg = ConfigManager.tables.TbChat.get(chatId);
        }
        // const cfg = ConfigManager.tables.TbChat.get(chatId);
        // console.log("onInit chatId:%s,isEnd:%s", chatId, isEnd);
        if(cfg == undefined || cfg == null) {
            return 0;
        }
        this._videoId = cfg.Video;
        this._isLeft = cfg.PeopleId != 0;
        // var headKey = "";
        if(this._isLeft) {
            var playerCfg = ConfigManager.tables.TbBook.get(cfg.PeopleId);
            const path = playerCfg != null ? getImagePath(playerCfg.PhoneIcon) : "";            
            if(this._iconPath != path) {
                changeSpriteImage(this.headImage, path, "UIPhone");
            }
            this._iconPath = path;
        }
        // if(contentKey != "") {
            // changeLabelText(this.contentLabel, contentKey);
        // }
        const chatType = cfg.Type as PhoneChatType;
        if(chatType == PhoneChatType.Pic) {
            changeSpriteImage(this.picImage, cfg.Picture, "UIPhone");
            this._picPath = cfg.BigPicture;
        }
        else if(chatType == PhoneChatType.Video) {
            changeSpriteImage(this.picImage, cfg.Picture, "UIPhone");
        }
        else if(chatType == PhoneChatType.Gif) {

        }
        else if(chatType == PhoneChatType.Text) {
            this.contentLabel.string = cfg.Text;
        }
        
        this.chatEndLineNode.active = isEnd;
        this._updateLeftOrRightState(this._isLeft, cfg.Type);

        // this.favorLabel.string = getLabelText("Chat_Favor") + favorNum.toString();

        //getImagePath(bigPicKey);
        // changeSpriteImage(this.headImage, headKey, "UIHome");
        
        // if(isLeft) {
        //     changeSpriteImage(this.headImage, headKey, "UIHome");
        // }

        
        
        // console.log("chatId:%s,Text:%s",chatId,cfg.Text);
        return this._adjustBubbleSize(chatType != PhoneChatType.Text, isEnd);
    }

    /**
     * 
     * @param isLeft 
     * @param isShowFavor 
     * @param isPic 
     */
    _updateLeftOrRightState(isLeft: boolean, chatType: number) {
        this.leftNode.active = isLeft;
        this.rightNode.active = !isLeft;

        this.leftPicImage.node.active = isLeft && (chatType == PhoneChatType.Pic || chatType == PhoneChatType.Video);
        this.rightPicImage.node.active = !isLeft && (chatType == PhoneChatType.Pic || chatType == PhoneChatType.Video);

        // this.leftFavorImage.node.active = isLeft && isShowFavor;
        // this.leftFavorText.node.active = isLeft && isShowFavor;

        // this.rightFavorImage.node.active = !isLeft && isShowFavor;
        // this.rightFavorText.node.active = !isLeft && isShowFavor;
        this.leftPlayNode.active = isLeft && chatType == PhoneChatType.Video;
        this.rightPlayNode.active = !isLeft && chatType == PhoneChatType.Video;

        this.leftBgImage.active = isLeft && chatType == PhoneChatType.Text;
        this.leftContentText.node.active = isLeft && chatType == PhoneChatType.Text;
        this.rightBgImage.active = !isLeft && chatType == PhoneChatType.Text;
        this.rightContentText.node.active = !isLeft && chatType == PhoneChatType.Text;
    }

    /**
     * 
     * @param isHasPic 
     * @returns 
     */
    _adjustBubbleSize(isHasPic: boolean, isEnd: boolean) : number {
        if (!this.contentLabel) return 0;
        this.contentLabel.updateRenderData(true); // 
        const labContentUITransform = this.contentLabel.node.uiTransform;//this.contentLabel.node.getComponent(UITransform);
        if (!labContentUITransform) return 0;

        // const realTextWidth = labContentUITransform.contentSize.width;

        const fontSize = this.contentLabel.fontSize;
        const labLength = this.contentLabel.string.length;
        const wordsLen = fontSize * labLength;
        const maxWidth = 14 * fontSize;
        const realWidth = Math.min(wordsLen, maxWidth);
        const textWidth = Math.max(realWidth, this._minWidth);
        const lineNum = Math.ceil(wordsLen / textWidth);
        // console.log("fontSize:%s,labLength:%s,wordsLen:%s,maxWidth:%s,realWidth:%s,textWidth:%s,lineNum:%s",fontSize,labLength,wordsLen,maxWidth,realWidth,textWidth, lineNum);
        const actualTextHeight = lineNum * this.contentLabel.lineHeight;
        labContentUITransform.setContentSize(textWidth, actualTextHeight);

        // // 
        // if (this._rootRectTransform) {
        //     this._rootRectTransform.updateLayout();
        // }

        const textHeight = labContentUITransform.contentSize.height + 50;
        const bubbleWidth = textWidth;//Math.min(textWidth, this._maxWidth);
        const dtHeight = textHeight - this._initChatContentBgHeight;
        
        const contentBgTransform = this.contentBg.uiTransform;
        const cbWidth = bubbleWidth + 108;//Math.min(bubbleWidth + 108, this._maxWidth);
        contentBgTransform.setContentSize(cbWidth, textHeight);

        // console.log("end contentChangeHeight:%s,%s",contentChangeHeight, favorBgPos.y);
        let chatEndLineY = this._chatEndLineInitPosY - dtHeight;
        let dtRootH = dtHeight > 0 ? this._initRootHeight + dtHeight : this._initRootHeight;
        if (isHasPic) {
            const lastH = dtRootH;
            dtRootH = Math.max(this._picHeight + 80, dtRootH);
            chatEndLineY = this._chatEndLineInitPosY - dtRootH + lastH - 25;
        }

        this._rootRectTransform.setContentSize(this._rootRectTransform.width, dtRootH);
        this.chatEndLineNode.setPosition(this.chatEndLineNode.position.x, chatEndLineY);
            
        return dtRootH + (isEnd ? 20 : 0);
        // }
        
        // return this._rootRectTransform?.contentSize.height;
    }

    // 
    public onClickPic(){
        if(this._picPath == "") {
            return;
        }
        // this._picCallback(this._picPath);
    }

    public onClickLeftPlay() {
        if(this._videoId == 0) {
            return;
        }
        // UIMainVideoComp.getInstance().playUrl(this._videoId);
        PlayerSystem.Instance.PlayVideo(this._videoId);
    }
    public onClickRightPlay() {
        if(this._videoId == 0) {
            return;
        }
        PlayerSystem.Instance.PlayVideo(this._videoId);
    }
}


