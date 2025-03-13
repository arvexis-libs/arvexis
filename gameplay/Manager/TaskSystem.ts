import { oops } from "db://oops-framework/core/Oops";
import { GameData } from "../GameDataModel/GameData";
import { CharacterAttribute } from "../GameDataModel/GameEnum";
import { TaskType } from "../GameDataModel/TaskType";
import { GameHelper } from "../GameTool/GameHelper";
import { PlayerSystem } from "./PlayerSystem";
import { GameEvent } from "../../common/config/GameEvent";
import ConfigManager from "../../manager/Config/ConfigManager";
import LanguageUtils from "../Utility/LanguageUtils";
import { StorySystem } from '../../gameplay/Manager/StorySystem';

interface ITbTask {
    EventId: string[];
    EventDes: string[];
    EventParam: string[];
    FunctionOpen: number;
}

export class TaskData {
    taskType: TaskType = TaskType.Nothing;
    targetVaule: number = 0;
    subTargetVaule: number = 0;
    taskDes: string = "";
    nextTaskType: TaskType = TaskType.Nothing;
    nestTaskIndex: number = 0;
    eventComplete: boolean = false;
    npcId : number = -1;

    CheckComplete(): boolean {
        let res = false;
        let curVaule = 0;
        switch (this.taskType) {
            case TaskType.Exp:
                res = PlayerSystem.Instance.CurExp >= PlayerSystem.Instance.CurNeedExp;
                break;
            case TaskType.KaDian:
                res = PlayerSystem.Instance.IsStartAwayTask && PlayerSystem.Instance.CurTaskAwayTimeStamp < 0;
                break;                
            case TaskType.PhoneMessage:
                res = GameData.IsChatEndByChatId(this.targetVaule);
                break;
                
            case TaskType.Video:
                res = GameData.PlayerData.GlobalData.GetPlayVideoData(this.targetVaule);
                break;
            case TaskType.Story:
                res = StorySystem.Instance.IsLookComplete(this.targetVaule);
                break;
            case TaskType.MingZuoShe:
                res = GameData.GetConstellationStarIsUnlockById(this.targetVaule);
                break;
            case TaskType.Date:
                res = GameData.PlayerData.GlobalData.GetStoryPlayCount(this.npcId) >= this.targetVaule;
                break;
            case TaskType.LittleGame:
                res = GameData.PlayerData.GlobalData.GetStoryPlayGameCount(this.npcId) >= this.targetVaule;
                break;
            case TaskType.DateAndGame:
                res = GameData.PlayerData.GlobalData.GetStoryAndGameCount(this.npcId) >= this.targetVaule;
                break;
            case TaskType.Interaction:
                let player = PlayerSystem.Instance.GetPlayerData(this.npcId);
                if(player != null){
                    let count = 0;
                    if(this.subTargetVaule == 0){
                        player.InteractionCount.forEach(num => {
                            count += num;
                        });
                    }
                    else{
                        if(player.InteractionCount.has(this.subTargetVaule))
                            count = player.InteractionCount.get(this.subTargetVaule)!;
                    }
                    

                    res = count >= this.targetVaule;
                }
                break;
        }
        return res;
    }

    GetTaskHeight(): number {
        switch (this.taskType) {
            case TaskType.Exp:
            case TaskType.MingZuoShe:
                return 80;
            
            case TaskType.KaDian:
                return 80;
            case TaskType.Strength:
            case TaskType.Appearance:
            case TaskType.Endurance:
            case TaskType.Intelligence:
            case TaskType.Charisma:
            case TaskType.Date:
            case TaskType.LittleGame:
            case TaskType.Interaction:
            case TaskType.DateAndGame:
                return 70;
            
            default:
                return 60;
        }
    }
}

export class TaskSystem {
    private static _instance: TaskSystem;
    public static get Instance(): TaskSystem {
        return this._instance || (this._instance = new TaskSystem());
    }

    public TaskDatas: TaskData[] = [];
    public TaskHeight: number = 0;
    public TaskY: number = 0;

    ReSetTaskData(): void {
        this.TaskDatas = [];

        // 
        const expData = new TaskData();
        expData.taskType = TaskType.Exp;
        expData.nextTaskType = TaskType.Nothing;
        expData.targetVaule = PlayerSystem.Instance.CurNeedExp;
        expData.taskDes = `${PlayerSystem.Instance.CurNeedExp}`;
        this.TaskDatas.push(expData);

        const cfg = PlayerSystem.Instance.GetTbTask();
        let tempHeight = 0;
        let tempY = 0;

        cfg.EventId.forEach((tasks, i) => {
            const taskList = tasks.split('|');
            taskList.forEach((taskId, j) => {
                const taskData = new TaskData();
                taskData.taskType = parseInt(taskId) as TaskType;
                taskData.npcId = this.GetNpcIDByTaskID(cfg.Id);
                if (taskList.length > 1) {
                    taskData.nextTaskType = j + 1 > taskList.length - 1 
                        ? TaskType.TaskListEnd 
                        : parseInt(taskList[j + 1]) as TaskType;
                    taskData.nestTaskIndex = j;
                }

                if (cfg.EventDes[i] && cfg.EventParam[i]) {
                    const [desFormat, param] = [
                        cfg.EventDes[i].split('|')[j],
                        cfg.EventParam[i].split('|')[j]
                    ];
                    let tempParam = param;
                    switch (taskData.taskType) {

                        case TaskType.MingZuoShe:
                            const starConfig = ConfigManager.tables.TbStarSingle.get(parseInt(param));
                            if (starConfig) {
                                let name = starConfig.Name;
                                const s = LanguageUtils.formatString(desFormat, name);
                                taskData.taskDes = s;
                            }
                            break;

                        case TaskType.Story:
                            taskData.taskDes = desFormat.replace('{0}', param);
                            break;
                        case TaskType.Date:
                            taskData.taskDes = LanguageUtils.formatString(desFormat, GameData.PlayerData.GlobalData.GetStoryPlayCount(taskData.npcId));
                            break;
                        case TaskType.LittleGame:
                            taskData.taskDes = LanguageUtils.formatString(desFormat, GameData.PlayerData.GlobalData.GetStoryPlayGameCount(taskData.npcId));
                            break;
                        case TaskType.DateAndGame:
                            taskData.taskDes = LanguageUtils.formatString(desFormat, GameData.PlayerData.GlobalData.GetStoryAndGameCount(taskData.npcId));
                            break;
                        case TaskType.Interaction:
                            tempParam = param.split(";")[1];
                            taskData.subTargetVaule = parseInt(param.split(";")[0]);

                            let count = 0;
                            let player = PlayerSystem.Instance.GetPlayerData(taskData.npcId);
                            if(player != null){
                                if(taskData.subTargetVaule == 0){
                                    //
                                    player.InteractionCount.forEach(num => {
                                        count += num;
                                    });
                                }
                                else{
                                    if(player.InteractionCount.has(taskData.subTargetVaule))
                                        count = player.InteractionCount.get(taskData.subTargetVaule)!;
                                }
                            }
                            taskData.taskDes = LanguageUtils.formatString(desFormat, count);
                            break;
                        default:
                            taskData.taskDes = desFormat.replace('{0}', param);
                    }
                    
                    taskData.targetVaule = parseInt(tempParam);
                }

                this.TaskDatas.push(taskData);

                if (j === 0 && taskList.length === 1) {
                    const height = taskData.GetTaskHeight();
                    tempHeight += height;
                    tempY += height * -0.5;
                }
            });
        });

        const curTask = this.GetTaskInTaskList();
        if (curTask) {
            tempHeight += curTask.GetTaskHeight();
            tempY += curTask.GetTaskHeight() * -0.5;
        }

        this.TaskHeight = 142 + tempHeight;
        this.TaskY = 580 + tempY;
    }

    CheckCompleteAllTask(): boolean {
        return this.TaskDatas.every(data => data.CheckComplete());
    }

    GetTaskComplete(index: number): boolean;
    GetTaskComplete(taskType: TaskType): boolean;
    GetTaskComplete(arg: number | TaskType): boolean {
        if (typeof arg === 'number') {
            return this.TaskDatas[arg]?.CheckComplete() ?? false;
        }
        return this.TaskDatas.find(data => data.taskType === arg)?.CheckComplete() ?? false;
    }

    HasTask(arg: number | TaskType): boolean {
        return this.TaskDatas.find(data => data.taskType === arg) != null;
    }

    GetFitnessTaskNum(taskType: TaskType): number 
    {
        if (![TaskType.Strength, TaskType.Endurance, TaskType.Intelligence, TaskType.Charisma].includes(<number>taskType)) {
            return -1;
        }
        return this.TaskDatas.find(data => data.taskType === taskType)?.targetVaule ?? -1;
    }

    SetTaskComplete(taskType: TaskType): void {
        const task = this.TaskDatas.find(data => data.taskType === taskType);
        if (task) task.eventComplete = true;
    }

    GetTaskInTaskList(): TaskData | null {
        let callback: TaskData | null = null;
        let lastTask: TaskData | null = null;

        for (const data of this.TaskDatas) {
            if (data.nextTaskType === TaskType.Nothing) continue;

            lastTask = data;
            if (data.CheckComplete()) continue;

            callback = data;
            break;
        }

        return callback ?? lastTask;
    }

    GetShowTaskList(): TaskData[] {
        const normalTasks = this.TaskDatas.filter(data => data.nextTaskType === TaskType.Nothing);
        const chainTask = this.GetTaskInTaskList();
        
        if (chainTask) {
            oops.message.dispatchEvent(GameEvent.TaskListRefresh,chainTask.taskType);
            return [...normalTasks, chainTask];
        }
        return normalTasks;
    }

    public GetNpcIDByTaskID(id : number){
        var temp = Math.floor(id / 1000);
        if(temp == 0)
            temp = 1;
        return temp;
    }
}
