/*
 * @Author: dgflash
 * @Date: 2021-11-18 17:42:59
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-05 10:32:42
 */

import { sp, _decorator } from "cc";
import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { CCComp } from "../../../../../extensions/oops-plugin-framework/assets/module/common/CCComp";
import { Role } from "../Role";
import { RoleEvent } from "../RoleEvent";
import { RoleViewAnimator } from "./RoleViewAnimator";
import { RoleViewController } from "./RoleViewController";
import { RoleViewLoader } from "./RoleViewLoader";

const { ccclass, property } = _decorator;

/**  */
@ccclass('RoleViewComp')                   //  Cocos Creator 
@ecs.register('RoleView', false)           //  ECS 
export class RoleViewComp extends CCComp {
    @property({ type: sp.Skeleton, tooltip: '' })
    spine: sp.Skeleton = null!;

    /**  */
    loader: RoleViewLoader = null!;
    /**  */
    animator: RoleViewAnimator = null!;
    /**  */
    controller: RoleViewController = null!;

    /**  */
    onLoad() {
        var role = this.ent as Role;

        this.loader = this.node.addComponent(RoleViewLoader);
        this.node.emit("load", role);

        this.animator = this.spine.getComponent(RoleViewAnimator)!;
        this.animator.role = role;

        this.controller = this.node.addComponent(RoleViewController);
        this.controller.role = role;

        this.on(RoleEvent.ChangeJob, this.onHandler, this);
    }

    /**  */
    private onHandler(event: string, args: any) {
        switch (event) {
            case RoleEvent.ChangeJob:
                this.animator.refresh();
                break;
        }
    }

    reset() {
        this.node.destroy();
    }
}