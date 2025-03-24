import { _decorator, Component, Node } from 'cc';
import { tips } from 'db://assets/script/game/common/prompt/TipsManager';
import { UIID } from 'db://assets/script/game/common/config/GameUIConfig';
import { oops } from 'db://oops-framework/core/Oops';
const { ccclass, property } = _decorator;

@ccclass('UIHeroineInfo')
export class UIHeroineInfo extends Component {
    start() {

    }

    onClose() {
        oops.gui.remove(UIID.UIHeroineInfo);
    }
}