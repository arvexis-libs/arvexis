import ConfigManager from "../../manager/Config/ConfigManager";
import { ConditionAndOr, ConditionMgr } from "./ConditionMgr";
import { EventMgr } from "./EventMgr";

export class EventTriggerMgr{
    private static _instance: EventTriggerMgr;
    public static get inst(): EventTriggerMgr {
        if (this._instance == null) {
            this._instance = new EventTriggerMgr();
        }
        return this._instance;
    }

    public tryToTriggerEvent(eventTriggerId: number): boolean {
        // TODO: 
        let tr = ConfigManager.tables.TbEventTrigger.get(eventTriggerId);
        if (tr == null) {
            return false;
        }

        let conditionPass = ConditionMgr.inst.checkAllConditions(tr.Conditions, tr.ConditionType as ConditionAndOr);
        if (!conditionPass) {
            return false;
        }
        else
        {
            for (let i = 0; i < tr.Events.length; i++) {
                let eventId = tr.Events[i];
                // TODO: 
                EventMgr.inst.trigger(eventId);
            }

        }
        return true;
    }

    public CanTriggerEvent(eventTriggerId: number): boolean {
        // TODO: 
        let tr = ConfigManager.tables.TbEventTrigger.get(eventTriggerId);
        if (tr == null) {
            return false;
        }

        let conditionPass = ConditionMgr.inst.checkAllConditions(tr.Conditions, tr.ConditionType as ConditionAndOr);
        if (!conditionPass) {
            return false;
        }
 
        return true;
    }

}