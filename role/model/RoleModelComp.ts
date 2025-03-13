/*
 * @Author: dgflash
 * @Date: 2021-11-18 15:56:01
 * @LastEditors: dgflash
 * @LastEditTime: 2022-07-25 17:04:37
 */
import { ecs } from "../../../../../extensions/oops-plugin-framework/assets/libs/ecs/ECS";
import { VM } from "../../../../../extensions/oops-plugin-framework/assets/libs/model-view/ViewModel";
import { RoleNumeric } from "./attribute/RoleNumeric";
import { RoleNumericMap } from "./attribute/RoleNumericMap";
import { RoleAttributeType } from "./RoleEnum";

/** 
 *  
 * 
 * 
 * 1
 * 2
 * 3VM
 * 
 * 
 * 1ecs.Compecs.Entity ecs.Entity.get(RoleModelComp) 
 */
@ecs.register('RoleModel')
export class RoleModelComp extends ecs.Comp {
    /**  */
    id: number = -1;

    private _name: string = "";
    /**  */
    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
        this.vm.name = value;
    }

    /**  */
    anim: string = "model1";

    /**  */
    attributes: RoleNumericMap = null!;

    constructor() {
        super();
        this.attributes = new RoleNumericMap(this.vm);
    }

    /**  VM  */
    private vm: any = {};

    vmAdd() {
        VM.add(this.vm, "Role");
    }

    vmRemove() {
        VM.remove("Role");
    }

    reset() {
        this.vmRemove();

        this.id = -1;
        this.name = "";

        for (var key in this.vm) {
            this.vm[key] = 0;
        }
    }

    toString() {
        console.log(`${this.name}"--------------------------------------------`);
        this.attributes.forEach((value: RoleNumeric, key: RoleAttributeType) => {
            console.log(key, value.value);
        });
    }
}
