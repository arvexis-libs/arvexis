import { _decorator, Component, Node, EventTouch,Color,Animation } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import ConfigManager from '../manager/Config/ConfigManager';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Utility } from '../gameplay/Utility/Utility';
import { debug, error } from 'console';
import { Sprite } from 'cc';
import { instantiate } from 'cc';
import { Button } from 'cc';
import { Label } from 'cc';
import { TrRhythmGameGK } from '../schema/schema';
import { math } from 'cc';
import { GameEvent } from '../common/config/GameEvent';
import { GameData } from '../gameplay/GameDataModel/GameData';
import { MiniGameData } from '../gameplay/GameDataModel/MiniGameData';
import { UIMusicManager } from "../gameplay/Manager/UIMusicManager";
import { SdkManager } from '../../modules/sdk/SdkManager';
import { color } from 'cc';
import { StorySystem } from '../gameplay/Manager/StorySystem';
const { ccclass, property } = _decorator;

@ccclass('UIPiano')
export class UIPiano extends CCComp {

    @property(Sprite)
    HeadIcon: Sprite = null!;
    @property(Node)
    content_Level: Node = null!;
    @property(Node)
    ItemLevel: Node = null!;
    @property(Label)
    TxtDifficultyAdd: Label = null!;
    @property(Label)
    TxtRewardAdd: Label = null!;
    @property(Label)
    TxtScoreAdd: Label = null!;
    @property(Label)
    ScoreTxt: Label = null!;

    private _roleId: number = 1;//ID
    private _curSelectedLevel = 0;//id
    private _curSelectedLevelUnlock = false;//
    private _listTbRhythmGameGK: TrRhythmGameGK[] | undefined;

    protected onLoad(): void {
        UIMusicManager.inst.playUIMusic(UIID.UIPiano, 1021);
        this._listTbRhythmGameGK = ConfigManager.tables.TbRhythmGameGK.getDataList();
    }

    onAdded(data: any) {

        this._roleId = data.roleId
        return true;
    }
    start() {
        this.SetInfo()
        this.setLevelList();


    }

    update(deltaTime: number) {

    }

    async SetInfo() {
        let headIconRes = this.GetRoleHeadIcon()
        if (headIconRes != "") {
            let spF = await Utility.loadImage("SpritesPiano/" + headIconRes, "UIPiano");
            if (spF) {
                this.HeadIcon.spriteFrame = spF
            }

            // this.name1.string = cfg.Name;
            // this.name2.string = cfg.NickName;
        }
    }

    GetRoleHeadIcon()
    {
        for (let i = 0; i < this._listTbRhythmGameGK!.length; i++) {
            const element = this._listTbRhythmGameGK![i];
            if (element.RoleId == this._roleId) {
                return element.StartImage;
            }
        }

        return ""
    }

    setLevelList() {
        let lastUnlockLevelbtn: Node;
        let index = 0;
        for (let i = 0; i < this._listTbRhythmGameGK!.length; i++) {
            const element = this._listTbRhythmGameGK![i];
            let isUnLock:boolean
            if (i!=0) {
                isUnLock = this.GetUnLockStatue(this._listTbRhythmGameGK![i-1].Id, element.Id)
            }
            else
            {
                isUnLock = true;
            }

            if (element.Id == 2001) {
                isUnLock = true;
            }


            if (element.RoleId == this._roleId) {
                let cloneObj = instantiate(this.ItemLevel);
                cloneObj.name = cloneObj.name + "_" + element.Id+"_"+isUnLock;
                let border = cloneObj.getChildByName("Border")
                cloneObj.setParent(this.content_Level);
                let btnLevel = cloneObj.getChildByName("BtnLevel")!
                this.SetUILockStatue(btnLevel,isUnLock)
                this.SetLevelItem(cloneObj, index, isUnLock);
                if (isUnLock) {
                    lastUnlockLevelbtn = btnLevel;
                }
                
                btnLevel.on(Node.EventType.TOUCH_END, () => {
                    this.On_LevelItem_Click(btnLevel)
                }, this);
                index++;
            }

        }

        this.On_LevelItem_Click(lastUnlockLevelbtn!)
    }

    GetUnLockStatue(lastLevelId:number, levelId:number)
    {
        if (lastLevelId == 0) {
            return true
        }

        let lastLevelTopScore = GameData.GetPianoData_topScore(this._roleId,lastLevelId)
        let levelTopScore = GameData.GetPianoData_topScore(this._roleId,levelId)
        if (Number(lastLevelTopScore)>0) {
            return true
        }

        return false
    }

    SetUILockStatue(node: Node, isUnlock: boolean) {
        let sprite = node.getComponent(Sprite)!
        sprite.color = isUnlock ? new Color(255, 255, 255, 255) : new Color(255, 255, 255, 0.4 * 255)
    }

    reset(): void {

    }

    On_BtnBack_Click() {
        oops.gui.remove(UIID.UIPiano);
        StorySystem.Instance.ForceOver();
    }
    On_BtnStart_Click() {
        if (!this._curSelectedLevelUnlock) {
            oops.gui.openAsync(UIID.UIConstellationTips, "");
            return;
        }
        SdkManager.inst.event("musicgame_times", { userid: PlayerSystem.Instance.CurPlayId, musicgame_times: 1});
        oops.gui.openAsync(UIID.UIPianoPlay, {
            levelId: this._curSelectedLevel,
            roleId: this._roleId

        }).then(() => {
            oops.gui.remove(UIID.UIPiano);
        })


    }

    On_LevelItem_Click(btnObj: Node) {
        let arr = btnObj!.parent!.name.split('_');
        let levelId;
        if (arr.length >= 2) {
            levelId = arr[1];
        }

        if (arr.length >= 3) {
            if (arr[2] == "false") {
                oops.gui.openAsync(UIID.UIConstellationTips, "");
                return
                this._curSelectedLevelUnlock = false;
            }
            else{
                this._curSelectedLevelUnlock = true;
            }
        }
        this.SelectLevel(levelId!);
    }

    SelectLevel(levelId: string) {
        this._curSelectedLevel = Number(levelId);
        const arrChild = this.content_Level.children;
        for (let i = 0; i < arrChild.length; i++) {
            const ele = arrChild[i]
            if (ele.name.includes(levelId)) {
                ele.getChildByName("Border")!.active = true;
            }
            else {
                ele.getChildByName("Border")!.active = false;
            }
        }
        let trRhythmGameGK = ConfigManager.tables.TbRhythmGameGK.get(this._curSelectedLevel)
        this.TxtDifficultyAdd.string = trRhythmGameGK?.ShowDifficulty.toString()!;
        this.TxtRewardAdd.string = parseFloat(trRhythmGameGK?.ShowReward!.toFixed(2).toString()!).toString()!;
        this.TxtScoreAdd.string = trRhythmGameGK?.ScoreBonus.toString()!;

        this.ScoreTxt.string = GameData.GetPianoData_topScore(this._roleId, this._curSelectedLevel).toString();

    }

    async SetLevelItem(node: Node, levelIndex: number, isUnLock:boolean) {
        let BtnLevel = node.getChildByName("BtnLevel")!
        let iconB = BtnLevel.getChildByName("IconB")!
        let iconT = BtnLevel.getChildByName("IconT")!.getComponent(Sprite)
        let txtLevel = BtnLevel.getChildByName("TxtLevel")!
        let levelRes = await Utility.loadImage("SpritesPiano/music_n" + (levelIndex + 1), "UIPiano");
        let sprite: Sprite = iconB.getComponent(Sprite)!;
        let label: Label = txtLevel.getComponent(Label)!;
        let anim: Animation = node.getComponent(Animation)!;

        if (sprite) {
            sprite.spriteFrame = levelRes;
        }
        if (label) {
            label.string = levelIndex % 2 == 0 ? "FLOW" : "TEMPO"
        }

        let iconT_res
        if (isUnLock) {
            iconT_res = await Utility.loadImage("SpritesPiano/music_badge1", "UIPiano");
        }
        else{
            iconT_res = await Utility.loadImage("Sprites/common_icon_lock1", "UIHome");
        }

        iconT!.spriteFrame = iconT_res

        this.scheduleOnce(()=>{
            anim.play("ItemLevelAnim");
            node.active = true;
        }, 0.5)
    }
}


