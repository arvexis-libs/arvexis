/*
 * @Author: dgflash
 * @Date: 2021-12-29 11:33:59
 * @LastEditors: dgflash
 * @LastEditTime: 2022-06-14 19:56:45
 */
import { sp, _decorator } from "cc";
import AnimatorSpine from "../../../../../extensions/oops-plugin-framework/assets/libs/animator/AnimatorSpine";
import { AnimatorStateLogic } from "../../../../../extensions/oops-plugin-framework/assets/libs/animator/core/AnimatorStateLogic";
import { RoleAnimatorType, WeaponName } from "../model/RoleEnum";
import { Role } from "../Role";
import { AnimationEventHandler } from "./animator/AnimationEventHandler";
import { RoleStateAttack } from "./animator/RoleStateAttack";
import { RoleStateDead } from "./animator/RoleStateDead";
import { RoleStateHit } from "./animator/RoleStateHit";

const { ccclass, property, requireComponent, disallowMultiple } = _decorator;

/** 
 * SPINE
 * 
 * 
 * 1
 * 2
 * 3
 */
@ccclass("RoleViewAnimator")
@disallowMultiple
@requireComponent(sp.Skeleton)
export class RoleViewAnimator extends AnimatorSpine {
    /**  */
    onAttackComplete: Function = null!;
    /**  */
    onHitActionComplete: Function = null!;
    /**  */
    role: Role = null!;

    /**  */
    private weaponAnimName: string = null!;

    start() {
        super.start();

        // 
        let anim = new AnimationEventHandler();
        let asl: Map<string, AnimatorStateLogic> = new Map();
        asl.set(RoleAnimatorType.Attack, new RoleStateAttack(this.role, anim));
        asl.set(RoleAnimatorType.Hurt, new RoleStateHit(this.role, anim));
        asl.set(RoleAnimatorType.Dead, new RoleStateDead(this.role, anim));
        this.initArgs(asl, anim);
    }

    /**  */
    left() {
        this.node.parent!.setScale(1, 1, 1);
    }

    /**  */
    right() {
        this.node.parent!.setScale(-1, 1, 1);
    }

    /**  */
    refresh() {
        // 
        this.onStateChange(this._ac.curState, this._ac.curState);
    }

    /**
     * 
     * @override
     * @param animName 
     * @param loop 
     */
    protected playAnimation(animName: string, loop: boolean) {
        if (animName) {
            this.weaponAnimName = this.getWeaponAnimName();
            var name = `${animName}_${this.weaponAnimName}`;
            this._spine.setAnimation(0, name, loop);
        }
        else {
            this._spine.clearTrack(0);
        }
    }

    /**  */
    private getWeaponAnimName() {
        var job = this.role.RoleModelJob;
        var weaponAnimName = WeaponName[job.weaponType[0]];
        return weaponAnimName;
    }
}