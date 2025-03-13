import { MathUtil } from "db://oops-framework/core/utils/MathUtil";
import { SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { Util } from "../../../modules/base/Util";
import ConfigManager from "../../manager/Config/ConfigManager";
import { oops } from "db://oops-framework/core/Oops";
import { TrCityMapBuild, TrEventTrigger } from "../../schema/schema";
import { EventType } from "../Manager/EventMgr";
import { ConditionAndOr, ConditionMgr } from "../Manager/ConditionMgr";
import { PlayerSystem } from "../Manager/PlayerSystem";
import { EventTriggerMgr } from "../Manager/EventTriggerMgr";
import { basename } from "path/win32";

export interface IBigCityEvent{
    buildId: number,
    eventType:number,
    eventId:number,
    createTimeStamp:number,
    roleId:number,
    isFixed:boolean,    // 
    isFinished:boolean, //
    plotId?:number,  //


}

export class BigCityMapData extends SerializeClass{
    __className: string = "BigCityMapData";

    @SerializeData()
    EventList:IBigCityEvent[] = [];

    /** */
    mTempEventList:IBigCityEvent[] = [];
    mTempBuildList:number[] = [];

    //  
    mFixEventsRoleIdCache:Map<number, number[]> = new Map();

    protected updateEventByRole(event:IBigCityEvent){
        let index = this.EventList.findIndex(e=>e.roleId == event.roleId);
        if(index == -1){
            this.EventList.push(event);
        }else{
            this.EventList[index] = event;
        }
    }

    getEventByRole(roleId:number){
        return this.EventList.find(e=>e.roleId == roleId);
    }

    getEventByBuildId(buildId:number){
        return this.EventList.find(e=>e.buildId == buildId);
    }

    getEvents(){
        return this.EventList;
    }

    /**
     * 
     */
    protected createEvents(){
        let shuffleArray = this.GetShuffleArrayBuilds();
        this.EventList = [];
        //
        let roles = ConfigManager.tables.TbPlayer.getDataList();
        for(let i = 0; i < roles.length; i++){
            // 
            if(!PlayerSystem.Instance.PlayerIsUnlock(roles[i].Id)){
                continue;
            }

            // 

            let eventInfo = this.createEventForRole(roles[i].Id, shuffleArray);
            this.EventList.push(eventInfo);
        }
    }

    private findCanTriggerEvent(eventTriggerIds:number[], inParam:number):number{

        for(let i = 0; i < eventTriggerIds.length; i ++){
            let selectEventTriggerId = eventTriggerIds[i];
            let triggerT = ConfigManager.tables.TbEventTrigger.get(selectEventTriggerId) as TrEventTrigger;

            let conditionPass = ConditionMgr.inst.checkAllConditions(triggerT?.Conditions, triggerT.ConditionType as ConditionAndOr, inParam);
            // console.error(" findCanTriggerEvent " , triggerT.Id , conditionPass);
            if(conditionPass){

                let triggerT = ConfigManager.tables.TbEventTrigger.get(selectEventTriggerId) as TrEventTrigger; 
                if(!triggerT) 
                {
                    console.error(" id" + selectEventTriggerId);
                    continue;
                };
                let eventT = ConfigManager.tables.TbEvent.get(triggerT.Events[0]);

                if(!eventT){
                    console.error(" id" + triggerT.Events[0]);
                    continue;
                }

                return selectEventTriggerId;
            }
        }
        return 0;
    }

    public createEventForRole(roleId:number, buildList:TrCityMapBuild[], excludeBuildId:number = 0): IBigCityEvent{

        let buildInfo = buildList[buildList.length -1];
        if(excludeBuildId != undefined && excludeBuildId != 0 && buildInfo.Id == excludeBuildId){
            let index = buildList.length - 2;
            index = index < 0? 0 : index;
            buildInfo = buildList[index];
            buildList.splice(index, 1);
        }
        else{
            buildList.pop();
        }

        let eventIds = buildInfo?.EventId;
        let length = eventIds?.length || 0;
        let randomIndex = oops.random.getRandomInt(0, length -1);
        //let selectEventId = eventIds?[randomIndex] : 0;
        if(eventIds == undefined || eventIds.length == 0){
            console.error("BuildId = " + buildList);
            console.error("roleId = " + roleId);
            
        }
        let selectTriggerEventId = this.findCanTriggerEvent(eventIds, roleId);//Array.isArray(eventIds) ? eventIds[randomIndex] : eventIds;

        let triggerT = ConfigManager.tables.TbEventTrigger.get(selectTriggerEventId) as TrEventTrigger;
        console.log("selectTriggerEventId = "  + selectTriggerEventId);
        if (selectTriggerEventId == 0) {
            console.error("BuildId = " + buildInfo.Id);
            console.error("roleId = " + roleId);
        }
        //,
        let eventT
        try {
            eventT = ConfigManager.tables.TbEvent.get(triggerT.Events[0]);
        } catch (error) {
            // 
            console.error(":", error);
            // 
            if (error instanceof Error) {
                console.log(":", error.name);
                console.log(":", error.message);
                console.log(":", error.stack);
            } else {
                console.error("Error:", error);
            }

            if (!ConfigManager.tables) {
                console.error("ConfigManager.tables  null")
            }
            else if (!ConfigManager.tables.TbEvent) {
                console.error("ConfigManager.tables.TbEvent  null")

            }
        }
        

        if(eventT && (eventT.EventType == EventType.PlayPlot || eventT.EventType == EventType.RandomPlayPlot)){
            let selectEventId = eventT.Id;
            let plotId =parseInt(eventT.Param1);
            if(eventT.EventType == EventType.RandomPlayPlot){
                let rIndex = oops.random.getRandomInt(1, eventT.Param3.length);
                plotId = eventT.Param3[rIndex - 1];
            }

            return {
                buildId : buildInfo?.Id || 0,
                eventType:buildInfo?.EventType || 0,
                eventId:selectEventId || 0,
                createTimeStamp:oops.timer.getClientTime(),
                roleId:roleId,
                isFixed:false,
                isFinished:false,
                plotId:plotId
            };
        }

        let eventInfo = {
            buildId : buildInfo?.Id || 0,
            eventType:buildInfo?.EventType || 0,
            eventId:eventT?.Id || 0,
            createTimeStamp:oops.timer.getClientTime(),
            roleId:roleId,
            isFinished:false,
            isFixed:false
        };
        return  eventInfo;
    }

    protected refreshEvent(){
        let needRefreshRole = [];
        let excludeMap: { [key: number]: number } = {};
        let shuffleArray = this.GetShuffleArrayBuilds();
        let now = oops.timer.getClientTime();

        //
        const MaxChaneTime = ConfigManager.tables.TbConst.get("MapEventRefreshLimitTime")?.Int || 3600;
        for(let i = this.EventList.length - 1; i >=0 ; i--){
            let eventInfo = this.EventList[i];
            if(now - eventInfo.createTimeStamp > (MaxChaneTime * 1000)){
                //
                needRefreshRole.push(eventInfo.roleId);
                this.EventList.splice(i, 1);
                excludeMap[eventInfo.roleId] = eventInfo.buildId;
            }
            else{

                for(let j = 0; j< shuffleArray.length; j ++){
                    if(shuffleArray[j].Id == eventInfo.buildId){
                        shuffleArray.splice(j, 1);
                        break;
                    }
                }
            }
        }

        for(let i = 0; i < needRefreshRole.length; i++){
            let roleId = needRefreshRole[i];
            let eventInfo = this.createEventForRole(roleId, shuffleArray, excludeMap[roleId] || 0);
            this.EventList.push(eventInfo);
        }
    }

    public addMapEvent(eventInfo:IBigCityEvent){
        this.EventList.push(eventInfo);
    }
    /**
     * 
     */
    public initEvents(){
        // 
        if(!this.CreateSpecialEvents()){
            let playerCnt = PlayerSystem.Instance.getUnlockPlayerCnt();

            if(this.EventList.length != playerCnt){
                this.createEvents();
            }
            else{
                this.refreshEvent();
            }
        }
    }

    public finieshEventByRoleIdAndPlotId(roleId:number, plotId:number){
        for(let i = 0; i < this.EventList.length; i++){
            let eventInfo = this.EventList[i];
            if(eventInfo.roleId == roleId && eventInfo.plotId == plotId){
                this.EventList[i].isFinished = true;
                break;
            }
        }
    }

    //
    /**
     *   ->  
     *  1
     *  2 
     *  3 ( )
     *  4
     */
    public initEventV2(){

        // 
        this.checkAndInitFixedEventConfig();

        this.mTempEventList = [];
        this.mTempBuildList = this.fitlerBuildIdByEnable();

        let roleIds = this.getUnlockRoleIdsWithCurFirst();
        for(let i = 0; i < roleIds.length; i ++){
            this.initRoleEvents(roleIds[i]);
        }

        //
        //7,
        for(let i = 0; i < roleIds.length; i ++){
            if(this.getEventInTempModelByRoleId(roleIds[i]) == null){
                this.createRondomEventV2(roleIds[i]);
            }
        }
        //
        this.EventList = this.mTempEventList;
    }

    /**
     * id   1   
     *                      2  
     *                      3   
     *                      4   ,
     *                      5 ()
     *                      6   
     *                      7,
     * @param roleId id
     */
    private initRoleEvents(roleId:number){
        //
        let hasFixedEvent = this.checkAndCreateFixedEvents(roleId);
        if(!hasFixedEvent){
            //
            this.createRondomEventV2(roleId);
        }
    }

    /**
     * 
     * @param roleId
     * 
     * 
     * */
    private createRondomEventV2(roleId:number){
        //
        let eventInfo = this.getEventInOriginModelByRoleId(roleId);
        let needRefresh = false;
        if(!eventInfo || eventInfo.isFixed){
            needRefresh = true;
        }
        else{
            // 
            // 
            needRefresh = this.checkRondomNeedRefresh(eventInfo);
        }

        if(needRefresh){
            eventInfo = this.createNewRondomEventByRoleId(roleId, eventInfo);
        }

        if(eventInfo){
            this.mTempEventList.push(eventInfo);
        }
        else{
            console.error(" " + roleId);
        }


    }

    /**
     * 
     * @param eventInfo         
     * // 
         
     */
    private checkRondomNeedRefresh(eventInfo:IBigCityEvent):boolean{
        if(this.getEventInTempModelByBuildId(eventInfo.buildId) != null){
            console.log("" + eventInfo.eventId);
            return true;
        }
        if(this.isRondomEventExpired(eventInfo)){
            console.log("" + eventInfo.eventId);
            return true;
        }

        if(eventInfo.isFinished){
            console.log("" + eventInfo.eventId);
            return true;
        }

        return false;
    }

    /**
     * 
     * @param roleId 
     */
    private createNewRondomEventByRoleId(roleId:number, oldEventInfo:IBigCityEvent | null):IBigCityEvent | null{
        //  
        let unlockBuildList = this.GetShuffleArrayBuilds();
        //
        for(let i = unlockBuildList.length - 1; i >= 0; i --){
            let buildInfo = unlockBuildList[i];
            if(this.getEventInTempModelByBuildId(buildInfo.Id) != null){
                unlockBuildList.splice(i, 1);
            }
        }
        //
        for(let i = unlockBuildList.length - 1; i >= 0; i --){
            let buildInfo = unlockBuildList[i];
            let eventInfo = this.getEventInOriginModelByBuildId(buildInfo.Id);
            if(eventInfo && !this.isRondomEventExpired(eventInfo)){
                unlockBuildList.slice(i, 1);
            }
        }

        //null
        if(unlockBuildList.length == 0){
            console.error("");
            return null;
        }
        // 
        if(oldEventInfo != null){
            for(let i = 0; i < unlockBuildList.length; i ++){
                if(unlockBuildList[i].Id == oldEventInfo.buildId){
                    const element = unlockBuildList.splice(i, 1)[0];
                    unlockBuildList.push(element);
                    break;
                }
            }
        }

        //
        for(let i = 0; i < unlockBuildList.length; i ++){
            let triggerEventIds = unlockBuildList[i].EventId;

            let selectTriggerEventId = this.findCanTriggerEvent(triggerEventIds, roleId);
            if(selectTriggerEventId != 0){

                let triggerT = ConfigManager.tables.TbEventTrigger.get(selectTriggerEventId) as TrEventTrigger; 
                let eventT = ConfigManager.tables.TbEvent.get(triggerT.Events[0])!;
                let eventId = eventT?.Id || 0;
                let plotId = 0;
                if(eventT.EventType == EventType.PlayPlot){
                    plotId = parseInt(eventT.Param1) || 0;
                }

                let eventInfo = {
                    buildId : unlockBuildList[i].Id,
                    eventType: ConfigManager.tables.TbCityMapBuild.get(unlockBuildList[i].Id)?.EventType || 0,
                    eventId: eventId,
                    createTimeStamp:oops.timer.getClientTime(),
                    roleId:roleId,
                    isFixed: false,
                    isFinished: false,
                    plotId: plotId
                };
                return eventInfo;

            }
            else{
                continue;
            }

        }
        return null;

    }

    /**
     * 
     * @param eventInfo 
     */
    private isRondomEventExpired(eventInfo:IBigCityEvent):boolean{
        let now = oops.timer.getClientTime();
        const MaxChaneTime = ConfigManager.tables.TbConst.get("MapEventRefreshLimitTime")?.Int || 3600;
        return now - eventInfo.createTimeStamp > (MaxChaneTime * 1000);
    }
    
    /**
     * 
     * @param roleId id
     * @returns 
     */
    private checkAndCreateFixedEvents(roleId:number):boolean{
        let hasFixedEvent = false;
        let fixedConfigList = this.mFixEventsRoleIdCache.get(roleId);
        if(!fixedConfigList){
            console.log(" roleId = " + roleId);
            return false;
        }

        for(let i = 0; i < fixedConfigList.length; i ++){
            let fixEventCofig = ConfigManager.tables.TbSpecialEvent.get(fixedConfigList[i])!;
            if(!this.isBuildUnlock(fixEventCofig.BuildId))
            {
                console.log(" " + fixEventCofig.BuildId);
                continue;
            }
            let canTriggerEventId = this.findCanTriggerEvent(fixEventCofig.FirstEventId, roleId);
            if(canTriggerEventId == 0){
                continue;
            }
            else{
                    let triggerT = ConfigManager.tables.TbEventTrigger.get(canTriggerEventId) as TrEventTrigger; 
                    if(!triggerT) 
                    {
                        console.error(" id" + canTriggerEventId);
                        continue;
                    };
                    let eventT = ConfigManager.tables.TbEvent.get(triggerT.Events[0]);

                    if(!eventT){
                        console.error(" id" + triggerT.Events[0]);
                        continue;
                    }

                    // 
                    let buildEvent = this.getEventInTempModelByBuildId(fixEventCofig.BuildId);
                    // 
                    if(buildEvent && buildEvent.isFixed){
                        console.error(`${fixEventCofig.BuildId} ${buildEvent.eventId}`);
                        break;
                    }
                    else{
                        if(buildEvent && !buildEvent.isFixed){
                            //
                            this.removeEventInTempModelByBuildId(fixEventCofig.BuildId);
                        }
                        //
                        
                        let eventId = eventT?.Id || 0;
                        let plotId = 0;
                        if(eventT.EventType == EventType.PlayPlot){
                            plotId = parseInt(eventT.Param1) || 0;
                        }

                        let eventInfo = {
                            buildId : fixEventCofig.BuildId,
                            eventType: ConfigManager.tables.TbCityMapBuild.get(fixEventCofig.BuildId)?.EventType || 0,
                            eventId: eventId,
                            createTimeStamp:oops.timer.getClientTime(),
                            roleId:roleId,
                            isFixed: true,
                            isFinished: false,
                            plotId: plotId
                        };

                        hasFixedEvent = true;

                        this.mTempEventList.push(eventInfo);
                        break;
                    }
            }
        }

        return hasFixedEvent;
    }

    //
    private getEventInTempModelByBuildId(buildId:number):IBigCityEvent|null{
        for(let i = 0; i < this.mTempEventList.length; i ++){
            if(this.mTempEventList[i].buildId == buildId){
                return this.mTempEventList[i];
            }
        }
        return null;
    }

    private removeEventInTempModelByBuildId(buildId:number){
        for(let i = 0; i < this.mTempEventList.length; i ++){
            if(this.mTempEventList[i].buildId == buildId){
                this.mTempEventList.splice(i, 1);
                return;
            }
        }
    }

    //
    private getEventInTempModelByRoleId(roleId:number):IBigCityEvent|null{
        for(let i = 0; i < this.mTempEventList.length; i ++){
            if(this.mTempEventList[i].roleId == roleId){
                return this.mTempEventList[i];
            }
        }
        return null;
    }

    //
    private getEventInOriginModelByRoleId(roleId:number):IBigCityEvent|null{
        for(let i = 0; i < this.EventList.length; i ++){
            if(this.EventList[i].roleId == roleId){
                return this.EventList[i];
            }
        }
        return null;
    }

    private getEventInOriginModelByBuildId(buildId:number):IBigCityEvent|null{
        for(let i = 0; i < this.EventList.length; i ++){
            if(this.EventList[i].buildId == buildId){
                return this.EventList[i];
            }
        }
        return null;
    }

    /**
     *  
     */
    private getUnlockRoleIdsWithCurFirst():number[]{
        let roleIds = [];
        let curId = PlayerSystem.Instance.CurPlayId;
        roleIds.push(curId);
        let roleList = ConfigManager.tables.TbPlayer.getDataList();
        for(let i = 0; i < roleList.length; i ++){
            if(PlayerSystem.Instance.PlayerIsUnlock(roleList[i].Id)){
                if(roleList[i].Id != curId){
                    roleIds.push(roleList[i].Id);
                }
            }
        }
        return roleIds;
    }

    /**
     *  
     */
    private checkAndInitFixedEventConfig(){
        if(this.mFixEventsRoleIdCache.size == 0){
            let roleList = ConfigManager.tables.TbPlayer.getDataList();
            let fixedEventsList = ConfigManager.tables.TbSpecialEvent.getDataList();
            for(let i = 0; i < roleList.length; i ++){
                for(let j = 0; j < fixedEventsList.length; j++){
                    let array = this.mFixEventsRoleIdCache.get(roleList[i].Id);
                    if(!array){
                        array = [];
                        this.mFixEventsRoleIdCache.set(roleList[i].Id, array);
                    }
                    if(fixedEventsList[j].NpcId == roleList[i].Id){
                        array.push(fixedEventsList[j].Id);
                    }
                }
            }
        }
    }

    public CreateSpecialEvents(): boolean{
        let res = false;
        let lastNpcId = -1;
        let tEventList:IBigCityEvent[] = [];
        let buildIdList = this.fitlerBuildIdByEnable();

        ConfigManager.tables.TbSpecialEvent.getDataList().forEach(data => {
            let NpcId = data.NpcId;
            if (lastNpcId != NpcId){
                if(PlayerSystem.Instance.PlayerIsUnlock(NpcId)){
                    data.FirstEventId.forEach(eventTriggerId => {
                        if(EventTriggerMgr.inst.CanTriggerEvent(eventTriggerId))
                        {

                            if(buildIdList.includes(data.BuildId)){
                                lastNpcId = NpcId;
                                res = true;

                                let triggerT = ConfigManager.tables.TbEventTrigger.get(eventTriggerId) as TrEventTrigger; 
                                if(!triggerT) 
                                {
                                    console.error(" id" + eventTriggerId);
                                    return;
                                };
                                let eventT = ConfigManager.tables.TbEvent.get(triggerT.Events[0]);

                                if(!eventT){
                                    console.error(" id" + triggerT.Events[0]);
                                    return;
                                }
                                let eventId = eventT?.Id || 0;
                                let plotId = 0;
                                if(eventT.EventType == EventType.PlayPlot){
                                    plotId = parseInt(eventT.Param1) || 0;
                                }
                                
                                let eventInfo = {
                                    buildId : data.BuildId,
                                    eventType: ConfigManager.tables.TbCityMapBuild.get(data.BuildId)?.EventType || 0,
                                    eventId: eventId,
                                    createTimeStamp:oops.timer.getClientTime(),
                                    roleId:NpcId,
                                    isFixed: true,
                                    isFinished: false,
                                    plotId: plotId
                                };
                                tEventList.push(eventInfo);  
                            }
                        }
                    });
                }
            }
        });

        if  (res) { 
            this.EventList = [];
            this.EventList = tEventList;
        }

        return res;
    }


    public changeRoleEvent(roleId:number):IBigCityEvent{
        let shuffleArray = this.GetShuffleArrayBuilds();
        for(let i = this.EventList.length - 1; i >=0 ; i--){
            for(let j = 0; j< shuffleArray.length; j ++){
                if(shuffleArray[j].Id == this.EventList[i].buildId){
                    shuffleArray.splice(j, 1);
                    break;
                }
            }
            if(this.EventList[i].roleId == roleId){
                this.EventList.splice(i, 1);
            }
        }

        let eventInfo = this.createEventForRole(roleId, shuffleArray);
        this.EventList.push(eventInfo);
        return eventInfo;
    }

    /**
     *  +
     */
    public fitlerBuildByEnable(randomType : boolean):TrCityMapBuild[]{
        let buildList = ConfigManager.tables.TbCityMapBuild.getDataList();
        buildList = Util.shuffleArray(buildList);

        let newBuildList = [];
        for(let i = 0; i < buildList.length; i ++){
            let buildInfo = buildList[i];

            if(ConditionMgr.inst.checkAllConditions(buildInfo.UnlockConditions, Number(buildInfo.UnConditionType) as ConditionAndOr)){
                newBuildList.push(buildInfo);
            }
        }

        // 
        newBuildList.sort((a,b) => {
            if(randomType)
            {
                if(b.EventType == 1){
                    return 1;
                }
                else 
                    return -1;
            }
            else
            {
                if(a.EventType != 1){
                    return -1;
                }
                else 
                    return 1;
            }
      
            return 0;
        });     

        return newBuildList;
    }

    public fitlerBuildIdByEnable():number[]{
        let buildList = ConfigManager.tables.TbCityMapBuild.getDataList();
        let newBuildList = [];
        for(let i = 0; i < buildList.length; i ++){
            let buildInfo = buildList[i];
            // console.error(" |============   buildInfo" , buildInfo.Id  , "|============");
            if(ConditionMgr.inst.checkAllConditions(buildInfo.UnlockConditions, Number(buildInfo.UnConditionType) as ConditionAndOr)){

                newBuildList.push(buildInfo.Id);
            }
        }
        return newBuildList;
    }

    //
    private isBuildUnlock(buildId:number):boolean{
        let buildInfo = ConfigManager.tables.TbCityMapBuild.get(buildId);
        if(!buildInfo) { console.error(" id" + buildId); return false;}
        if(ConditionMgr.inst.checkAllConditions(buildInfo.UnlockConditions, Number(buildInfo.UnConditionType) as ConditionAndOr)){
            return true;
        }
        return false;
    }

    public GetShuffleArrayBuilds():TrCityMapBuild[]{
        // 
        const randomType = Math.random() < 0.5 ? true : false;
        let shuffleArray = this.fitlerBuildByEnable(randomType);

        return shuffleArray;
    }
}