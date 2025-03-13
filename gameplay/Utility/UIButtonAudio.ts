import { Button } from "cc";
import { Toggle } from "cc";
import { Enum } from "cc";
import { _decorator } from "cc";
import { oops } from "db://oops-framework/core/Oops";
import { GameComponent } from "db://oops-framework/module/common/GameComponent";
import { TrAudio } from "../../schema/schema";
import ConfigManager from "../../manager/Config/ConfigManager";

const { ccclass, property, requireComponent } = _decorator;
const SoundType = Enum({
    CLICK: 2004,    // 
    CLOSE: 2005,    // 
    EXP_LV_UP: 2006,// 
    TAP: 2007       // 
});
@ccclass('UIButtonAudio')
export class UIButtonAudio extends GameComponent {
    @property({
        type: SoundType,
        tooltip: ""
    })
    public soundType: number = SoundType.CLICK;
    static SoundType = SoundType;
    private _clickCooldown: number = 0;
    private _isInCooldown: boolean = false;

    onLoad() {
        this._initializeComponents();
    }

    // UI
    private _initializeComponents(): void {
        // 
        const button = this.node.getComponent(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, this._handleClick, this);
        }

        // Toggle
        const toggle = this.node.getComponent(Toggle);
        if (toggle) {
            toggle.node.on(Toggle.EventType.TOGGLE, () => {
                this._handleClick();
            });
        }
    }

    update(dt: number) {
        if (!this._isInCooldown) return;

        this._clickCooldown += dt;
        if (this._clickCooldown >= 1) {
            this._resetCooldown();
        }
    }

    // 
    private _resetCooldown(): void {
        this._clickCooldown = 0;
        this._isInCooldown = false;
    }

    // 
    private _handleClick(): void {
        if (this._isInCooldown) return;

        this._isInCooldown = true;
        this._clickCooldown = 0;
        this._playSoundEffect();
    }

    // 
    private _playSoundEffect(): void {
        let audio: TrAudio =ConfigManager.tables.TbAudio.get(this.soundType)!;
        oops.audio.playEffect(audio?.Resource, "Audios");
    }

}


