/*
 * @Author: dgflash
 * @Date: 2022-06-02 09:38:48
 * @LastEditors: dgflash
 * @LastEditTime: 2023-08-16 14:44:08
 */
import { EventTouch, Node, _decorator } from "cc";
import { oops } from "../../../../../extensions/oops-plugin-framework/assets/core/Oops";
import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { CCComp } from "../../../../../extensions/oops-plugin-framework/assets/module/common/CCComp";
import { UIID } from "../../common/config/GameUIConfig";
import { SingletonModuleComp } from "../../common/ecs/SingletonModuleComp";

const { ccclass, property } = _decorator;

/**  */
@ccclass('RoleViewInfoComp')
@ecs.register('RoleViewInfo', false)
export class RoleViewInfoComp extends CCComp {
    onAdded(args: any) {
        console.log(args);
        return true;
    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchEnd(event: EventTouch) {
        switch (event.target.name) {
            case "btn_levelup":
                var role = ecs.getSingleton(SingletonModuleComp).account.AccountModel.role;
                role.upgrade();
                break;
            case "btn_close":
                this.ent.remove(RoleViewInfoComp);
                break;
        }

        event.propagationStopped = true;
    }

    reset() {
        oops.gui.remove(UIID.Demo_Role_Info, false);

        // 
        // setTimeout(() => {
        //     oops.gui.remove(UIID.Demo_Role_Info);
        // }, 1000);
    }

    protected onDestroy(): void {
        console.log("");
    }
}