import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BFInfoItem')
export class BFInfoItem extends Component {
    
    @property(Label)
    labTitle: Label = null!;
    @property(Label)
    labDesc: Label = null!;
    
    public onInit(title: string, desc: string) {
        this.labTitle.string = title;
        this.labDesc.string = desc;
    }
}


