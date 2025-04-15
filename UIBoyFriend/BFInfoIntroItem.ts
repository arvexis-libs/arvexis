import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BFInfoIntroItem')
export class BFInfoIntroItem extends Component {
    
    @property(Label)
    labTitle: Label = null!;
    @property(Node)
    nodeMask: Node = null!;
    
    public onInit(title: string, isUnlock: boolean) {
        this.labTitle.string = title;
        this.labTitle.node.active = isUnlock;
        this.nodeMask.active = !isUnlock;
    }
}


