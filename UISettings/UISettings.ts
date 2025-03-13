import { _decorator, Component, Slider, Button } from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { ProgressBar } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UISettings')
export class UISettings extends Component {
    @property(Slider) private musicSlider: Slider = null!;
    @property(Slider) private soundSlider: Slider = null!;
    @property(ProgressBar) private musicProgr: ProgressBar = null!;
    @property(ProgressBar) private soundProgr: ProgressBar = null!;

    onLoad() {
        this.musicSlider.node.on('slide', this.OnMusicVolumeChange, this);
        this.soundSlider.node.on('slide', this.OnSoundVolumeChange, this);

        this.RefreshUI();
    }

    private RefreshUI() {
        this.musicSlider.progress = oops.audio.volumeMusic;
        this.soundSlider.progress = oops.audio.volumeEffect;
        this.musicProgr.progress = oops.audio.volumeMusic;
        this.soundProgr.progress = oops.audio.volumeEffect;
    }

    private OnMusicVolumeChange(slider: Slider) {
        oops.audio.volumeMusic = slider.progress;
        this.musicProgr.progress = slider.progress;
    }

    private OnSoundVolumeChange(slider: Slider) {
        oops.audio.volumeEffect = slider.progress;
        this.soundProgr.progress = slider.progress;
    }

    private OnClose() {
        oops.gui.remove(UIID.UISettings);
    }
}