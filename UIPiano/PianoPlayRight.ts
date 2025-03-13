import { _decorator, Component, Node, Vec3, director, Camera, SpriteFrame, ImageAsset, Texture2D, EventHandler } from 'cc';
import { CCComp } from '../../../../extensions/oops-plugin-framework/assets/module/common/CCComp';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UITransform } from 'cc';
import { instantiate } from 'cc';
import { Sprite } from 'cc';
import ConfigManager from "../manager/Config/ConfigManager";
import { Label } from 'cc';
import { TrRhythmGame } from "../schema/schema";
import { MusicInfo, PianoPlayBase, E_MusicNoteType } from "./PianoPlayBase";
const { ccclass, property } = _decorator;

export class PianoPlayRight extends PianoPlayBase {
    @property({ type: Node })

    init(btnClickArea:Node, music_line:Node): void {
        PianoPlayBase._isRightOver = false;
        let musicId = this._uiPianoPlay._tbRhythmGameGK?.MusicId;
        const cfgs = ConfigManager.tables.TbRhythmGame.get(musicId!);
        this.musicalNoteData = cfgs?.MusicalNoteRight;
        super.init(btnClickArea, music_line);
        this.musicline_x = 246;
    }
    start(): void {
        super.start();
    }
    updateGame(): void {
        //let musicLength = this._list_musicInfo.length>4?4:this._list_musicInfo.length;//
        let musicLength = this._list_musicInfo.length;
        if (this.indexMusicNote >= musicLength) {
            if (!PianoPlayBase._isRightOver) {
                PianoPlayBase._isRightOver = true;
                this.JudgGameOver();
            }
        }
        super.updateGame();
    }

    onDestroy(): void {
        super.onDestroy();
    }
}
