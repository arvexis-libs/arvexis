import { Label } from 'cc';
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { TrHeroinePropType } from 'db://assets/script/game/schema/schema';
import { HeroineDataManager } from 'db://assets/script/game/UIMain/HeroineDataManager';
const { ccclass, property } = _decorator;

@ccclass('UIHeroineInfo/PropItem')
export class PropItem extends Component {
    @property({type: Label})
    nameLabel: Label = null!;

    @property({type: Label})
    valueLabel: Label = null!;

    @property({type: Sprite})
    icon: Sprite = null!;

    async refresh(propType: TrHeroinePropType) {
        this.nameLabel.string = propType.Name;
        this.valueLabel.string = HeroineDataManager.Instance.GetPower(propType.Id).toString();
    }
}