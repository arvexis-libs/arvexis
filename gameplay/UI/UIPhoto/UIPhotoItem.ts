import { Sprite } from "cc";
import { Label } from "cc";
import { _decorator } from "cc";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { PlayerSystem } from "../../Manager/PlayerSystem";
import { Node } from "cc";
import { Utility } from "../../Utility/Utility";
import { SpriteFrame } from "cc";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { Trmirror } from "../../../schema/schema";
import { TipsNoticeUtil } from "../../Utility/TipsNoticeUtil";

const { ccclass, property } = _decorator;

@ccclass
export default class UIPhotoItem extends GameComponent {
    @property(Sprite)
    imageLoader: Sprite = null!;

    @property(Sprite)
    pieceImageLoader: Sprite = null!;

    @property(Label)
    tex_Num: Label = null!;

    @property(Node)
    obj_Btn: Node = null!;

    @property(Node)
    obj_Red: Node = null!;

    @property(Node)
    obj_AD: Node = null!;

    private cfg: Trmirror = null!;
    private clickAction: () => void = null!;

    public async init(cfg: Trmirror, clickAction: () => void) {
        this.cfg = cfg;
        this.clickAction = clickAction;

        // 
        const path = cfg.MirrorType === 1 ?
            "common/common_icon_suipian_2" :
            "common/common_icon_suipian_1";
        let af = await Utility.loadImage(path);
        if (af) {
            this.pieceImageLoader.spriteFrame = af
        }
        this.refreshUI();
    }

    public async refreshUI() {
        const isUnlock = PlayerSystem.Instance.isUnlockPhoto(this.cfg.Id);
        const hasNum = PlayerSystem.Instance.GetPhotoPieceNum(this.cfg.MirrorType);

        // AD
        this.obj_AD.active = this.cfg.ChipType === 1;

        // 
        this.tex_Num.string = `${hasNum}/${this.cfg.ChipNum}`;

        // 
        this.obj_Btn.active = !isUnlock;

        // 
        const iconPath = isUnlock ? this.cfg.IconId : this.cfg.DimIconId;
        if (iconPath) {
            let path = ConfigManager.tables.TbAtlas.get(iconPath)?.Path!;
            let af = await Utility.loadImage(path,"UIPhoto");
            if (af) {
                this.imageLoader.spriteFrame = af
            }
        }
        // 
        this.obj_Red.active = !isUnlock && hasNum >= this.cfg.ChipNum;
    }

    public onClickUnlock() {
        const hasNum = PlayerSystem.Instance.GetPhotoPieceNum(this.cfg.MirrorType);
        if (hasNum < this.cfg.ChipNum) {
            TipsNoticeUtil.PlayNotice(""); 
            return;
        }

        if (PlayerSystem.Instance.SubtractPhotoPieceNum(this.cfg.MirrorType, this.cfg.ChipNum)) {
            PlayerSystem.Instance.UnlockPhoto(this.cfg.Id);
        }
    }

    public onClickVideo() {
        if (PlayerSystem.Instance.isUnlockPhoto(this.cfg.Id)) {
            this.clickAction?.();
        }
    }
}
