import { oops } from "db://oops-framework/core/Oops";
import ConfigManager from "../../manager/Config/ConfigManager";
import { GameData } from "../GameDataModel/GameData";
import { FunctionOpenSystem } from "../Manager/FunctionOpenSystem";
import { PlayerSystem } from "../Manager/PlayerSystem";
import { GameEvent } from "../../common/config/GameEvent";
import { ecs } from "db://oops-framework/libs/ecs/ECS";
import { UIID } from "../../common/config/GameUIConfig";
import { FunctionOpenType } from "../GameDataModel/FunctionOpenType";
import { TipsNoticeUtil } from "../Utility/TipsNoticeUtil";
import LanguageUtils from "../Utility/LanguageUtils";
import { ItemEnum } from "../GameDataModel/GameEnum";
import { UICallbacks } from "db://oops-framework/core/gui/layer/Defines";
import { EventMessage } from "../../../../../extensions/oops-plugin-framework/assets/core/common/event/EventMessage";
import { StorySystem } from "../Manager/StorySystem";

export class GameHelper{
    // 
    static readonly PlayerInfoAdList: number[] = [2, 3, 4, 5];
    
    // 
    private static ShowPhotoRed: boolean = true;

    static Init()
    {
        oops.message.on(GameEvent.PlayerLevelChange,this._levelUp,this);
        oops.message.on(GameEvent.UnlockConstellation,this._unlockConstellation,this);
        oops.message.on(GameEvent.OnShowTalk,this._showAside,this);
        oops.message.on(GameEvent.OnItemValueChanged,this._showConstellationNotice,this);
        oops.message.on(EventMessage.GAME_SHOW, this._gameShowAgain, this);
    }
    static onDestroy(): void {
        oops.message.off(GameEvent.PlayerLevelChange, this._levelUp, this);
        oops.message.off(GameEvent.UnlockConstellation, this._unlockConstellation, this);
        
        oops.message.off(GameEvent.OnShowTalk, this._showAside, this);
        oops.message.off(GameEvent.OnItemValueChanged, this._showConstellationNotice, this);
        oops.message.off(EventMessage.GAME_SHOW, this._gameShowAgain, this);
    }

    static _gameShowAgain() {
        /*oops.gui.clear();
        oops.gui.open(UIID.MainVideo);
        oops.gui.open(UIID.UIHome);
        StorySystem.Instance.ForceOver();*/
    }

    /**
     * 
     * @param event 
     * @param args 
     */
    static _showAside(event: string, args: any) {
        if(oops.gui.has(UIID.TalkView)) {
            oops.message.dispatchEvent(GameEvent.ShowPhoneChange);
        }
        else {
            oops.gui.open(UIID.TalkView, args)
        }
    }
    /**
     * 
     * @param event 
     * @param args {roleId}
     */
    private static _unlockConstellation(event: string, args: any) {
        
        
    }

    /**
     * 
     * @param event 
     * @param args {starId}
     */
    private static _showConstellationNotice(event: string, itemType: any, newV :any, dt: any) { 
        if(oops.gui.has(UIID.UIConstellation) || oops.gui.has(UIID.UIConstellationMain)) {
            return;
        }
        if(!(itemType == ItemEnum.ExpPlayer1 || itemType == ItemEnum.ExpPlayer2)) {
            return;
        }
        const v = dt as number;
        if(isNaN(v) || v == null || v == undefined) {
            return;
        }
        if(v <= 0) {
            return;
        }

        const itemCfg = ConfigManager.tables.TbItem.get(itemType);
        if(itemCfg == undefined || itemCfg.Param == "") {
            return;
        }
        const id = parseInt(itemCfg.Param);
        if(isNaN(id)) {
            return;
        }

        if(StorySystem.Instance.isInStoryReward) {
            StorySystem.Instance.isShowUIConstellationNotice = true;
            StorySystem.Instance.roleIdUIConstellationNotice = id;
        }
        else
        {
            if(oops.gui.has(UIID.UIConstellationNotice)) {
                oops.message.dispatchEvent(GameEvent.ConstellationNotice, {roleId: id});
            }
            else {
                oops.gui.open(UIID.UIConstellationNotice, {roleId: id});
            }
        }
    }

    private static _levelUp(event: string, args: any) {
        const taskCfg = PlayerSystem.Instance.GetTbTask();
        if (taskCfg.MessageId > 0) 
        {
            this.ShowPhoneMessage(taskCfg.MessageId);
        }
    }
    /**
     * 
     * @param chatId id
     * @param message key 
     * @returns 
     */
    static ShowPhoneMessage(chatId: number, message: string = ""): void {
        const cfg = ConfigManager.tables.TbChat.get(chatId);
        if (!cfg) return;

        let roleId = cfg.PeopleId;
        if(roleId == 0) {
            console.error("ShowPhoneMessage chatId:%s,PeopleId:",chatId,cfg.PeopleId);
            return;
        }
        GameData.AddPhoneChatDataOnId(roleId, chatId);
        
        ///
        let guideConditin1 = GameData.GetGuideStep() >= 1000 && GameData.GetGuideStep()<1050
        let guideConditin2 = GameData.GetGuideStep() >= 2010 && GameData.GetGuideStep()<2020
        let guideConditin3 = GameData.GetGuideStep() >= 2030 && GameData.GetGuideStep()<2040

        if (guideConditin1 || guideConditin2 || guideConditin3) {
            return;
        }
        if(oops.gui.has(UIID.PhoneMessage)) {
            oops.message.dispatchEvent(GameEvent.ShowPhoneChange);
        }
        else {
            let param = {roleId, message};
            oops.gui.pushWait(UIID.PhoneMessage, param);
        }
        oops.message.dispatchEvent(GameEvent.PhoneDataChange);
        // if (UIPhoneContext.Instance.IsOpened) {
        //     UIPhoneContext.Instance.OnNewMessageNeedUpdate();
        // } else {
        //     UIPhoneTipsContext.Instance.mRoleId = roleId;
        //     UIPhoneTipsContext.Instance.mShowContent = message;
        //     UIPhoneTipsContext.Instance.Open();
        // }
    }

    static IsEnoughMoney(amount: bigint, isNeedTips: boolean = false): boolean {
        if (GameData.PlayerData.GlobalData.money < amount) {
            if (isNeedTips) {
                TipsNoticeUtil.PlayNotice(LanguageUtils.GetLanguageString("NoEnoughMoney"));
            }
            return false;
        }
        return true;
    }

    static IsHasPhoneRed(): boolean {
        if (!GameHelper.IsFunctionOpen(FunctionOpenType.Phone, false)) return false;

        // return GameData.PlayerData.PhoneData.ChatDatas.some(chatData => {
        //     const lastChatId = chatData.ChatIds[chatData.ChatIds.length - 1];
        //     const cfg = ConfigManager.tables.TbChat.get(lastChatId);
        //     return cfg?.NextId !== -1;
        // });
        for (const [roleId, data] of GameData.PlayerData.PhoneData.ChatDatas) {
            if(!GameData.IsCurrentChatEnd(roleId)) {
                return true;
            }
        }
        return false;
    }

    static IsHasSkinRed(): boolean {
        return GameHelper.IsFunctionOpen(FunctionOpenType.Skin, false) && 
            Object.keys(PlayerSystem.Instance.PlayerData.SkinData.LookNum)
                .some(id => !PlayerSystem.Instance.IsUnlockSkin(parseInt(id)));
    }

    static IsFunctionOpen(id: FunctionOpenType, isNeedTips: boolean = false): boolean {
        const isOpen = FunctionOpenSystem.Instance.IsOpen(id);
        if (!isOpen && isNeedTips) {
            for (let i = 1; i < 100; i++) {
                const cfg = ConfigManager.tables.TbTask.get(i);
                // if (cfg?.FunctionOpen === id) {
                //     const name = ConfigManager.tables.TbPlayer.get(1)?.Name;
                //     oops.gui.toast(`${name}${i}`);
                //     break;
                // }
            }
        }
        return isOpen;
    }

    static CheckPhotoRed(): boolean {
        if (!GameHelper.IsFunctionOpen(FunctionOpenType.Photo)) return false;

        const allPhoto = ConfigManager.tables.Tbmirror.getDataList();
        const cfgs = allPhoto.filter(p => p.NpcID === PlayerSystem.Instance.CurPlayId);
        
        if (PlayerSystem.Instance.PlayerData.photoData.UnlockPhotoId.length >= cfgs.length) return false;

        if (this.ShowPhotoRed) {
            this.ShowPhotoRed = false;
            return true;
        }

        return cfgs.some(p => 
            !PlayerSystem.Instance.isUnlockPhoto(p.Id) && 
            p.ChipNum <= PlayerSystem.Instance.GetPhotoPieceNum(p.ChipType)
        );
    }

    static EnoughCountChange(
        curCount: number, 
        maxCount: number,
        lowColor?: string,
        highColor?: string
    ): string {
        if (lowColor && highColor) {
            return curCount < maxCount 
                ? lowColor.replace("{0}", curCount.toString()).replace("{1}", maxCount.toString())
                : highColor.replace("{0}", curCount.toString()).replace("{1}", maxCount.toString());
        }
        
        const mainColor = curCount < maxCount ? "#FF0000" : "#11ad4c";
        const subColor = curCount < maxCount ? "#655D60" : "#59515c";
        return `<color=${mainColor}>${curCount}</color><color=${subColor}>/${maxCount}</color>`;
    }

    //// <summary></summary>
    static TransformLayer(name : string = "XuanJueAni", time: number = 0.5, callback?: Function ): void {
        oops.gui.openAsync(UIID.UITransformAni, {
            name: name,
            time: time,
            callback: callback
        });
    }

    /**
     * 
     */
    static TransformWait(callBack?: Function): void {
        oops.gui.open(UIID.UITransformWait, {
            callback: callBack
        });
    }

    //
    static CheckPlayerInteractionRed(InteractionId : number) : boolean{
        let player = PlayerSystem.Instance.PlayerData;
        if(player == null){
            return false;
        }
        let cfg = ConfigManager.tables.TbInteraction.get(InteractionId);
        if(cfg == null){
            return false;
        }

        return GameHelper.IsFunctionOpen(cfg.Openfunction) && !player.usedInteraction.includes(InteractionId);
    }
}