import { _decorator, Component, Node } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from '../../../../extensions/oops-plugin-framework/assets/core/Oops';
import { GameEvent } from '../common/config/GameEvent';
import { Sprite } from 'cc';
import { Label } from 'cc';
import { UITransform } from 'cc';
import { Button } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { changeSpriteImage } from '../common/UIExTool';
import { UIPlayerLevelItem } from './UIPlayerLevelItem';
import { UIID } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;

@ccclass('UIPlayerInfo')
export class UIPlayerInfo extends CCComp {


    @property(Sprite)
    iconImage: Sprite = null!;
    @property(Label)
    mName: Label = null!;
    @property(Label)
    mAge: Label = null!;
    @property(Label)
    mProfession: Label = null!;
    @property(Label)
    mBirth: Label = null!;
    @property(Label)
    mHobby: Label = null!;
    @property(Label)
    mHW: Label = null!;
    @property(Label)
    m3D: Label = null!;
    @property(Node)
    mContent: Node = null!;
    @property(Button)
    mInfoButton: Button = null!;
    @property(Button)
    mCloseBtn: Button = null!;

    private readonly _levelList:number[] = [1,10,20,30,40,50,60,80,100];


    reset(): void {
        this._updateInfo();
        this._updateLevel();
    }

    onLoad() {
        this._initEventListeners();
    }

    protected start(): void {
        this._updateInfo();
        this._updateLevel();
    }

    protected onDisable(): void {
        oops.message.off(GameEvent.PlayerInfoChange, this._updateInfo, this);
    }

    protected onEnable(): void {
        oops.message.on(GameEvent.PlayerInfoChange, this._updateInfo, this);
    }

    private _initEventListeners() {
        this.mInfoButton.node.on(Button.EventType.CLICK, this._onClickInfo, this);
        this.mCloseBtn.node.on(Button.EventType.CLICK, this._onClickClose, this);
    }

    private _updateInfo() {
        const playerCfg = ConfigManager.tables.TbPlayer.get(PlayerSystem.Instance.CurPlayId);
        if(playerCfg == null) {
            return;
        }
        // let birthday = 0;
        // let hobby = 0;
        // let hW = 0;
        // let bWH = 0;
        // const playerInfo = GameData.PlayerData.UserData.PlayerInfos.get(PlayerSystem.Instance.CurPlayId);
        // if (playerInfo) {
        //     birthday = playerInfo.Birthday;
        //     hobby = playerInfo.Hobby;
        //     hW = playerInfo.HW;
        //     bWH = playerInfo.BWH;
        // }
        // else{
        //     birthday = playerCfg.Birthday;
        // }

        // const defaultStr = "Player_Guess";

        this.mBirth.string = playerCfg.Birthday;
        this.mHobby.string = playerCfg.Hobby;
        this.mHW.string = playerCfg.HW;
        this.m3D.string = playerCfg.BWH;
        this.mAge.string = playerCfg.Age;
        this. mProfession.string = playerCfg.Job;
        this.mName.string = playerCfg.Name;

        let url:string=ConfigManager.tables.TbAtlas.get(playerCfg.ImagePath)?.Path!;
        changeSpriteImage(this.iconImage, url, "UIPhoto");
    }

    private _updateLevel() {
        const count = this.mContent.children.length;
        let nextIdx = 1;
        let nextLevel = nextIdx < this._levelList.length ? this._levelList[nextIdx] : this._levelList[this._levelList.length - 1];
        for (let i = 0; i < count; i++) {
            const item = this.mContent.children[i];
            if(item != null) {
                const uiPlayerLevelItem = item.getComponent(UIPlayerLevelItem);
                if (uiPlayerLevelItem) {
                    uiPlayerLevelItem.OnInit(this._levelList[i], nextLevel);
                }
                nextIdx++;
                nextLevel = nextIdx < this._levelList.length ? this._levelList[nextIdx] : this._levelList[this._levelList.length - 1];
            }
        }
    }

    private _onClickInfo() {
        oops.gui.open(UIID.UIPlayerInfoTips);
    }

    private _onClickClose() {
        oops.gui.remove(UIID.UIPlayerInfo);
    }
}


