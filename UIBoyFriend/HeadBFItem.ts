import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import ConfigManager from '../manager/Config/ConfigManager';
import { changeSpriteImage } from '../common/UIExTool';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HeadBFItem')
export class HeadBFItem extends Component {
    
    @property(Sprite)
    spIcon: Sprite = null!;
    @property(Node)
    nodeLock: Node = null!;
    @property(Label)
    labName: Label = null!;

    private _selfIdx: number = 0;
    private _currentId: number = 0;
    private _isSelect: boolean = false;
    private _clickCallBack: Function = null!;
    
    public onInit(index: number, id: number, isSelect: boolean, clickCallback: (a:number) => void) {

        // if(this._currentId != 0 && this._currentId == id && isSelect == this._isSelect) {
        //     return;
        // }

        this._currentId = id;
        this._selfIdx = index;

        const cfg = ConfigManager.tables.TbBoyFriend.get(id);
        if(cfg == null || cfg == undefined) {
            return;
        }
        this._clickCallBack = clickCallback;

        changeSpriteImage(this.spIcon, isSelect ? cfg.Pic : cfg.Icon, "UIBoyFriend");
        const scale = isSelect ? 1.2 : 1;
        this.spIcon.node.setScale(scale, scale, scale);

        const boyFriend = PlayerSystem.Instance.GetBoyFriendById(id);
        this.nodeLock.active = false == boyFriend.IsUnlock();
        this.labName.string = cfg.Name;
    }

    public onClick() {
        if(this._clickCallBack != null) {
            this._clickCallBack(this._selfIdx);
        }
    }
}


