import { _decorator, Component, Node } from 'cc';
import { FunctionOpenType } from '../../GameDataModel/FunctionOpenType';
import { GameHelper } from '../../GameTool/GameHelper';
import { FunctionOpenSystem } from '../../Manager/FunctionOpenSystem';
const { ccclass, property } = _decorator;

@ccclass('UIFunctionCheck')
export class UIFunctionCheck extends Component {
    
    @property({ type: FunctionOpenType }) 
    openType : FunctionOpenType = FunctionOpenType.None;
    onEnable(){
        FunctionOpenSystem.Instance.Register(this.openType, this.node);
        this.node.active = GameHelper.IsFunctionOpen(this.openType);
    }

    onDisable(){
        FunctionOpenSystem.Instance.Unregister(this.openType);
    }


}


