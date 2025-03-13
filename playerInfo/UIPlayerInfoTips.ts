import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { Button } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { GameEvent } from '../common/config/GameEvent';
import { UIID } from '../common/config/GameUIConfig';
import { UIPlayerTipsItem } from './UIPlayerInfoTipsItem';
const { ccclass, property } = _decorator;

@ccclass('UIPlayerInfoTips')
export class UIPlayerInfoTips extends CCComp {

    @property(UIPlayerTipsItem)
    mBirthScript: UIPlayerTipsItem = null!;    
    @property(UIPlayerTipsItem)
    mHobbyScript: UIPlayerTipsItem = null!;
    @property(UIPlayerTipsItem)
    mHWScript: UIPlayerTipsItem = null!;
    @property(UIPlayerTipsItem)
    mBWHScript: UIPlayerTipsItem = null!;
    @property(Button)
    mCloseBtn: Button = null!;

    private mAdList: number[] = [2,3,4,5];

    reset(): void {
        this._updateAll();
    }
    start() {
        this._updateAll();
    }

    protected onLoad(): void {
        this.mCloseBtn.node.on(Button.EventType.CLICK, this._onClickClose, this);
    }

    _updateAll() {
        const playerCfg = ConfigManager.tables.TbPlayer.get(PlayerSystem.Instance.CurPlayId);
        if(playerCfg == null) {
            return;
        }
        const playerInfo = GameData.GetPlayerInfo();
        const { Birthday, Hobby, HW, BWH, birthdayNum, hobbyNum, hWNum, bWHNum } = playerInfo;

        this.mBirthScript.OnInit(1, Birthday !== 0, Birthday !== 0 ? playerCfg.Birthday : "???", birthdayNum, this.mAdList[0], this._unlockCallback.bind(this));
        this.mHobbyScript.OnInit(2, Hobby !== 0, Hobby !== 0 ? playerCfg.Hobby : "???", hobbyNum, this.mAdList[1], this._unlockCallback.bind(this));
        this.mHWScript.OnInit(3, HW !== 0, HW !== 0 ? playerCfg.HW : "???", hWNum, this.mAdList[2], this._unlockCallback.bind(this));
        this.mBWHScript.OnInit(4, BWH !== 0, BWH !== 0 ? playerCfg.BWH : "???", bWHNum, this.mAdList[3], this._unlockCallback.bind(this));
    }

    _unlockCallback(infoType: number) {
        const playerInfo = GameData.GetPlayerInfo();
        switch (infoType) {
            case 1:
                playerInfo.birthdayNum += 1;
                break;
            case 2:
                playerInfo.hobbyNum += 1;
                break;
            case 3:
                playerInfo.hWNum += 1;
                break;
            case 4:
                playerInfo.bWHNum += 1;
                break;
        }
        this._updateAll();
        
        oops.message.dispatchEvent(GameEvent.PlayerInfoChange);
    }

    _onClickClose() {
        oops.gui.remove(UIID.UIPlayerInfoTips);
    }
}


