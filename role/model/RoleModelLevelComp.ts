/*
 * @Author: dgflash
 * @Date: 2021-11-18 15:56:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-06-14 19:55:01
 */

import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { VM } from "../../../../../extensions/oops-plugin-framework/assets/libs/model-view/ViewModel";
import { TableRoleLevelUp } from "../../common/table/TableRoleLevelUp";

/**
 * 
 * 
 * 
 * 1
 * 
 * 
 * 1API
 * 2
 */
@ecs.register('RoleModelLevel')
export class RoleModelLevelComp extends ecs.Comp {
    /**  */
    rtluNext: TableRoleLevelUp = new TableRoleLevelUp();
    /**  */
    rtluCurrent: TableRoleLevelUp = new TableRoleLevelUp();

    /**  VM  */
    vm: RoleLevelVM = new RoleLevelVM();

    vmAdd() {
        VM.add(this.vm, "RoleLevel");
    }

    vmRemove() {
        this.vm.reset();
        VM.remove("RoleLevel");
    }

    reset() {
        this.vmRemove();
    }
}

class RoleLevelVM {
    /**  */
    lv: number = 0;
    /**  */
    exp: number = 0;
    /**  */
    expNext: number = 0;

    reset() {
        this.lv = 0;
        this.exp = 0;
        this.expNext = 0;
    }
}