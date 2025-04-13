import { ScrollView } from 'cc';
import { Label } from 'cc';
import { _decorator, Component, Node, Vec2, Vec3, tween } from 'cc';
import { GameData } from '../gameplay/GameDataModel/GameData';
const { ccclass, property } = _decorator;

@ccclass('TimeState')
export class TimeState extends Component {
    @property(Label)
    TxtGameTime:Label = null!;
    @property(Label)
    NextTxtGameTime:Label = null!;
    @property(Node)
    SVContent:Node = null!;
    @property(Node)
    IconTime:Node = null!;

    private readonly initPosY:number = 17;
    private readonly nextPosY:number = 47;
    private _lastTime:number = 0;
    start() {
        
    }

    update(deltaTime: number) {
        
    }

    public SetLastTime(lastTime: number)
    {
        this._lastTime = lastTime;
    }

    public changeTimeAnim(curTime: number)
    { 
        this.initTime(curTime);
        this.initPos();
        this.PlayAnim();
    }

    PlayAnim()
    {
        let nextPos = new Vec3(0, this.nextPosY, 0)
        if (this._lastTime == 0) {
            this.SVContent.position = nextPos;
        }
        tween(this.SVContent)
        .to(4, { position:  nextPos},
            {
                easing: 'linear',//quadOut
                onStart: () => {
                    
                },
                onUpdate: (target) => {

                },
                onComplete: () => {
                    
                }
            }
        )
        .start();
    }
    initPos()
    {
        this.SVContent.position = new Vec3(0, this.initPosY, 0);
    }

    initTime(nextTime: number)
    {
        this.TxtGameTime.string = this._lastTime.toString()
        this.NextTxtGameTime.string = nextTime.toString()
    }
}


