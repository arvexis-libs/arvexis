
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { _decorator, Component, Node, Label, Button, Animation, UITransform, instantiate, Prefab } from 'cc';
import { Sprite } from "cc";
import { ADEnum } from "../../Manager/GameDot";
import { GameData } from "../../GameDataModel/GameData";
import { Utility } from "../../Utility/Utility";
import { PlayerSystem } from "../../Manager/PlayerSystem";
import ConfigManager from "../../../manager/Config/ConfigManager";
import { TipsNoticeUtil } from "../../Utility/TipsNoticeUtil";
import { oops } from "db://oops-framework/core/Oops";
import { GameEvent } from "../../../common/config/GameEvent";
import { UIID } from "../../../common/config/GameUIConfig";
const { ccclass, property } = _decorator;
@ccclass('UIOtherPlayerView')
export class UIOtherPlayerView extends GameComponent {
    @property(Label)
    desLabels: Label[] = [];

    // @property(Label)
    // desdesLabels: Label[] = [];

    // @property(Node)
    // adNodes: Node[] = [];

    @property(Sprite)
    icon: Sprite = null!;
    @property(Sprite)
    ad1: Sprite = null!;
    @property(Sprite)
    ad2: Sprite = null!;
    private adenum: ADEnum = ADEnum.Gril_adv;
    private playerNodes: Node[] = [];
    private buttonNodes: Node[] = [];


    protected onLoad(): void {

    }

    protected onEnable(): void {
        this.refreshView();
    }


    private refreshView(): void {
        this.updateDescriptions();
        this.updateAdStatus();
        this.refreshIcon(GameData.GetIconPathByADEnum(this.adenum));
    }

    private updateDescriptions(): void {
        this.desLabels.forEach((label, index) => {
            label.string = this.getPlayerDescription(index + 1);
        });

        // this.desdesLabels.forEach((label, index) => {
        //     label.string = this.getPlayerSubDescription(index + 1);
        // });
    }

    private updateAdStatus(): void {
        // this.adNodes.forEach((node, index) => {
        //     node.active = !this.checkAdViewed(index + 1);
        // });
    }

    private async refreshIcon(path: string) {
        // let spF = await Utility.loadImage(path, "UIKaDianTask");
        // if (spF) {
        //     this.icon.spriteFrame = spF;
        //     this.ad1.spriteFrame = spF;
        //     this.ad2.spriteFrame = spF;
        // }
    }

    private checkAdViewed(playerId: number): boolean {
        const player = PlayerSystem.Instance.GetPlayerDataById(playerId);
        return player?.isLookLoverAd ?? false;
    }

    private getPlayerDescription(playerId: number): string {
        var cfg = ConfigManager.tables.TbPlayer.get(playerId)!;
        const playerData = PlayerSystem.Instance.GetPlayerDataById(playerId)!;

        if (PlayerSystem.Instance.PlayerIsUnlock(playerId)) {
            return `${cfg.Name}              Lv.${playerData.level}`;
        } else {
            const [requiredId, requiredLevel] = cfg.Unlock;
            const requiredConfig = ConfigManager.tables.TbPlayer.get(requiredId)!;
            return `${requiredConfig.Name}${requiredLevel}`;
        }
    }

    private getPlayerSubDescription(playerId: number): string {
        const config = PlayerSystem.Instance.GetPlayerDataById(playerId)!;
        return `${config.Name}`;
    }

    private OnClickPlayer(event: any,aa:any): void 
    {
        let playerId=parseInt(aa);
        if (!PlayerSystem.Instance.PlayerIsUnlock(playerId)) {
            TipsNoticeUtil.PlayNotice(this.getPlayerDescription(playerId));
            return;
        }

        if (playerId >= 4) {
            TipsNoticeUtil.PlayNotice("");
            return;
        }

        if (GameData.PlayerData.GlobalData.CurPlayId !== playerId) {
            GameData.PlayerData.GlobalData.CurPlayId = playerId;
            oops.message.dispatchEvent(GameEvent.RefreshHomeView);
            oops.message.dispatchEvent(GameEvent.OnSkinChange);
        }

        oops.gui.remove(UIID.UIOtherPlayer);
    }

    private OnClickBtn(buttonId: number): void {
        if (!PlayerSystem.Instance.PlayerIsUnlock(buttonId)) {
            TipsNoticeUtil.PlayNotice(this.getPlayerDescription(buttonId));
            return;
        }


        if (!this.IsLookLoverAd(buttonId)) 
        {
            const config = PlayerSystem.Instance.GetPlayerDataById(buttonId)!;
            config.isLookLoverAd = true;

            TipsNoticeUtil.PlayNotice("");
            this.refreshView();
        }
        else {
            // 
            // var cfg = DataTableManager.Instance.Tables.TbPlayer.Get(id);
            // PlayerSystem.Instance.PlayVideo(cfg.VideoId);
        }
    }

    private IsLookLoverAd(id: number): boolean {
        if (!PlayerSystem.Instance.PlayerIsUnlock(id)) {
            return false;
        }

        return PlayerSystem.Instance.GetPlayerDataById(id)?.isLookLoverAd!;
    }

    private OnClose()
    {
        oops.gui.remove(UIID.UIOtherPlayer);
    }
}
