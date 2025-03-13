import { _decorator, Component, Node, tween, Vec3} from 'cc';
import { oops } from 'db://oops-framework/core/Oops';
import { UIID } from '../common/config/GameUIConfig';
import { UIPianoPlay } from './UIPianoPlay';
import { PianoPlayBase } from './PianoPlayBase';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MusicNoteDrop')
export class MusicNoteDrop extends Component {
    private _uiPianoPlay = new UIPianoPlay();
    public _tweenDrop:Tween= new Tween();;
    public InitPos_Y = 0;
    start() {
        this._uiPianoPlay = oops.gui.get(UIID.UIPianoPlay).getComponent(UIPianoPlay)!
        this.SetMusicNoteDrop();
    }

    update(deltaTime: number) {
        
    }

    SetMusicNoteDrop()
    {
        const startPos = this.node.position.clone();
        startPos.y = this.InitPos_Y;
        this.node.position = startPos
        const endPos = new Vec3(startPos.x, -3000, startPos.z); 

        this._tweenDrop=tween(this.node)
            .to(6, { position: endPos }, { easing: 'linear' }) 
            .start();//5
    }

    SetDropPause()
    {
        this._tweenDrop.pause()
    }

    SetDropResume()
    {
        this._tweenDrop.resume()
    }
}


