import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { PlayerSystem } from '../gameplay/Manager/PlayerSystem';
const { ccclass, property } = _decorator;

@ccclass('UIPlayerLevelItem')
export class UIPlayerLevelItem extends Component {
    
    @property(Sprite)
    selectImage: Sprite = null!;
    @property(Sprite)
    unlockImage: Sprite = null!;
    @property(Sprite)
    lockImage: Sprite = null!;

    public OnInit(level: number, nextLevel: number)
    {
        const playerLevel = PlayerSystem.Instance.CurLv;
        this.selectImage.node.active = (playerLevel < nextLevel && playerLevel >= level) || (level == nextLevel && playerLevel >= level);
        this.unlockImage.node.active = level <= playerLevel;
        this.lockImage.node.active = level > playerLevel;
    }
}


