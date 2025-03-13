import { Button } from "cc";
import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { PlayerSystem } from "../../Manager/PlayerSystem";
import { Node } from "cc";
import { color } from "cc";
import UIPhotoItem from "./UIPhotoItem";
import { Utility } from "../../Utility/Utility";
import { GameData } from "../../GameDataModel/GameData";
import { ADEnum } from "../../Manager/GameDot";
import { GameEvent } from "../../../common/config/GameEvent";
import { Trmirror } from "../../../schema/schema";
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "../../../common/config/GameUIConfig";

const { ccclass, property } = _decorator;

@ccclass
export default class UIPhotoView extends GameComponent {
    @property(Button)
    closeBtn: Button = null!;

    @property(Button)
    leftBtn: Button = null!;

    @property(Button)
    rightBtn: Button = null!;

    @property(Button)
    tab1: Button = null!;

    @property(Button)
    tab2: Button = null!;

    @property(Button)
    playBtn: Button = null!;

    @property(Button)
    showPhoto: Button = null!;
    @property(Sprite)
    ShowPhotoImg: Sprite = null!;

    @property(Label)
    totalUnlockNum: Label = null!;

    @property(Label)
    videoNum1: Label = null!;

    @property(Label)
    pictureNum2: Label = null!;

    @property(Label)
    pageTex: Label = null!;

    @property(Node)
    content: Node = null!;

    @property(Sprite)
    icon: Sprite = null!;

    @property(Node)
    videohuibg: Node = null!;

    @property(Node)
    photohuibg: Node = null!;

    @property(Label)
    videotxt: Label = null!;

    @property(Label)
    phototxt: Label = null!;

    @property(Node)
    tab1Red: Node = null!;

    @property(Node)
    red2Red: Node = null!;
    @property(Node)
    leftRed: Node = null!;

    @property(Node)
    rightRed: Node = null!;

    private readonly VIDEO_PIECE_GET_NUM = 2;
    private readonly PICTURE_PIECE_GET_NUM = 10;
    private curMirrorType: number = 0;
    private curPage: number = 0;
    private totalPage: number = 0;
    private totalPhotoNum: number = 0;
    private allCfgData = new Map<number, Trmirror[]>();
    private showItem: any[] = [];
    private adenum: ADEnum = ADEnum.Photo_adv;

    onLoad() {
        this.on(GameEvent.OnPhotoPieceChange, this.onHandler, this);
        this.on(GameEvent.OnUnlockPhoto, this.onHandler, this);
    }

    onEnable() {
        this.loadCfgData();
        this.onClickVideoBtn();
        this.refreshPieceNum();
        this.RefreshIcon();
    }

    onDisable() {
        // TODO: 
    }
    protected onDestroy(): void {
        this.off(GameEvent.OnPhotoPieceChange);
        this.off(GameEvent.OnUnlockPhoto);
    }
    private onHandler(event: string, args: any): void {
        this.refreshUI();
    }
    private async RefreshIcon() {
        let spF = await Utility.loadImage(GameData.GetIconPathByADEnum(this.adenum));
        if (spF) {
            this.icon.spriteFrame = spF
        }
    }
    private loadCfgData() {
        this.totalPhotoNum = 0;
        this.allCfgData.clear();

        const cfgs = ConfigManager.tables.Tbmirror.getDataList();
        cfgs.forEach(temp => {
            if (temp.NpcID !== PlayerSystem.Instance.CurPlayId) return;

            const mirrorType = temp.MirrorType;
            if (!this.allCfgData.has(mirrorType)) {
                this.allCfgData.set(mirrorType, []);
            }

            this.allCfgData.get(mirrorType)?.push(temp);
            this.totalPhotoNum++;
        });
    }

    private async chooseMirrorType() {
        this.showItem = [];
        this.totalPage = 0;

        const list = this.allCfgData.get(this.curMirrorType)!;
        this.content.children.forEach((child: Node, index) => {
            const itemIndex = this.curPage * 6 + index;
            child.active = itemIndex < list.length;

            if (child.active) {
                const item = child.getComponent(UIPhotoItem);
                if (item) {
                    item.init(list[itemIndex], () => {
                        if (list[itemIndex].MirrorType === 1) 
                        {
                            PlayerSystem.Instance.PlayVideo(list[itemIndex].VideoId);
                        } else 
                        {
                            this.showPhoto.node.active = true;
                            if (list[itemIndex].BigIcon) {
                                const atlas = ConfigManager.tables.TbAtlas.get(list[itemIndex].BigIcon)?.Path!;
                                this.loadIcon(atlas);
                            }
                        }
                    });
                    this.showItem.push(item);
                }
            }
        });

        this.totalPage = Math.ceil(list.length / 6);
        this.totalUnlockNum.string = `: ${PlayerSystem.Instance.PlayerData.photoData.UnlockPhotoId.length}/${this.totalPhotoNum}`;
        this.checkLRShow();
        this.refreshRed();
    }

    private async loadIcon(url: string) {
        let af = await Utility.loadImage(url, "UIPhoto")!;
        if (af) {
            this.ShowPhotoImg.spriteFrame = af;
        }
    }

    private refreshUI() {
        this.showItem.forEach(item => item.refreshUI());
        this.refreshPieceNum();
        this.totalUnlockNum.string = `: ${PlayerSystem.Instance.PlayerData.photoData.UnlockPhotoId.length}/${this.totalPhotoNum}`;
        this.refreshRed();
    }

    // 
    onClickVideoBtn() {
        this.curMirrorType = 1;
        this.curPage = 0;
        this.chooseMirrorType();
        this.videohuibg.active = false;
        this.photohuibg.active = true;
        this.videotxt.color = color(80, 71, 74);
        this.phototxt.color = color(101, 93, 96);
    }

    onClickPictureBtn() {
        this.curMirrorType = 2;
        this.curPage = 0;
        this.chooseMirrorType();
        this.videohuibg.active = true;
        this.photohuibg.active = false;
        this.videotxt.color = color(101, 93, 96);
        this.phototxt.color = color(80, 71, 74);
    }

    // 
    onClickLeft() {
        if (this.curPage <= 0) return;
        this.curPage--;
        this.chooseMirrorType();
    }

    onClickRight() {
        if (this.curPage >= this.totalPage - 1) return;
        this.curPage++;
        this.chooseMirrorType();
    }

    private checkLRShow() {
        const dataLength = this.allCfgData.get(this.curMirrorType)?.length || 0;
        if (dataLength <= 6) {
            this.leftBtn.node.active = false;
            this.rightBtn.node.active = false;
            this.pageTex.string = `${this.curPage + 1}/${this.totalPage}`;
            return;
        }

        this.leftBtn.node.active = this.curPage > 0;
        this.rightBtn.node.active = this.curPage < this.totalPage - 1;
        this.pageTex.string = `${this.curPage + 1}/${this.totalPage}`;
    }

    // 
    private onClickGetPiece() {
        // WxADSystem.instance.showRewardedVideoAd(() => {
        //     PlayerSystem.instance.addPhotoPieceNum(MirrorType.Video, this.VIDEO_PIECE_GET_NUM);
        //     PlayerSystem.instance.addPhotoPieceNum(MirrorType.Picture, this.PICTURE_PIECE_GET_NUM);
        //     this.refreshIcon();
        // }, this.adenum);
        PlayerSystem.Instance.AddPhotoPieceNum(1, this.VIDEO_PIECE_GET_NUM);
        PlayerSystem.Instance.AddPhotoPieceNum(2, this.PICTURE_PIECE_GET_NUM);
        this.RefreshIcon();
    }

    private refreshPieceNum() {
        this.videoNum1.string = PlayerSystem.Instance.GetPhotoPieceNum(1).toString();
        this.pictureNum2.string = PlayerSystem.Instance.GetPhotoPieceNum(2).toString();
    }


    private refreshRed() {
        this.tab1Red.active = false;
        var hasNum1 = PlayerSystem.Instance.GetPhotoPieceNum(1);
        for (let i = 0; i < this.allCfgData.get(1)!.length; i++) {
            if (PlayerSystem.Instance.isUnlockPhoto(this.allCfgData.get(1)![i].Id))
                continue;

            if (hasNum1 >= this.allCfgData.get(1)![i].ChipNum) {
                this.tab1Red.active = true;
                break;
            }
        }
        this.red2Red.active = false;
        var hasNum2 = PlayerSystem.Instance.GetPhotoPieceNum(2);

        for (let i = 0; i < this.allCfgData.get(2)!.length; i++) {
            if (PlayerSystem.Instance.isUnlockPhoto(this.allCfgData.get(2)![i].Id))
                continue;

            if (hasNum2 >= this.allCfgData.get(2)![i].ChipNum) {
                this.red2Red.active = true;
                break;
            }
        }

        this.leftRed.active = false;
        var curNum = PlayerSystem.Instance.GetPhotoPieceNum(this.curMirrorType);
        for (let i = 0; i < this.curPage * 6; i++) {
            if (PlayerSystem.Instance.isUnlockPhoto(this.allCfgData.get(this.curMirrorType)![i].Id))
                continue;

            if (curNum >= this.allCfgData.get(this.curMirrorType)![i].ChipNum) {
                this.leftRed.active = true;
                break;
            }
        }

        this.rightRed.active = false;
        for (let i = (this.curPage + 1) * 6; i < this.allCfgData.get(this.curMirrorType)!.length; i++) {
            if (PlayerSystem.Instance.isUnlockPhoto(this.allCfgData.get(this.curMirrorType)![i].Id))
                continue;

            if (curNum >= this.allCfgData.get(this.curMirrorType)![i].ChipNum) {
                this.rightRed.active = true;
                break;
            }
        }
    }

    private onClickShowPhoto() {
        this.showPhoto.node.active = false;
    }

    private onClickClose() {
        oops.gui.remove(UIID.UIPhoto);
    }
}


