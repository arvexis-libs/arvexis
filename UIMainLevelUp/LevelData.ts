import { Label } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { TrLevel } from 'db://assets/script/game/schema/schema';
const { ccclass, property } = _decorator;

@ccclass('UIMain/LevelUp/LevelData')
export class LevelData extends Component {

    @property({type: String, displayName: ""})
    dataType: string = "";

    @property({type: Label})
    v1: Label = null!;

    @property({type: Label})
    v2: Label = null!;
    
    @property({type: Node})
    arrow: Node = null!;

    refresh(pre: TrLevel, to: TrLevel) {
        if (this.dataType === "MagicKeyMax")
        {
            this.arrow.active = true;
            this.v1.node.active = true;
            this.v1.string = pre.MagicKeyMax.toString();
            this.v2.string = to.MagicKeyMax.toString();
        } else {
            this.arrow.active = false;
            this.v1.node.active = false;
        }
        
        if (this.dataType === "PowAdd")
        {
            this.v2.string = `+${to.PowAdd}`;
        } else if (this.dataType === "MagicKey") {
            this.v2.string = `+${to.MagicKey}`;
        } else if (this.dataType === "MagicBoxReward") {
            this.v2.string =`+${to.MagicBoxReward}%`;
        }
    }
}