import { _decorator, Component, Node } from 'cc';
import { UIConfigData } from '../common/config/GameUIConfig';
const { ccclass, property } = _decorator;
import { oops } from "db://oops-framework/core/Oops";
import { UIID } from "db://assets/script/game/common/config/GameUIConfig";
import { GameData } from "db://assets/script/game/gameplay/GameDataModel/GameData";
import { Button } from 'cc';
import { TbGuide, TrGuide } from '../schema/schema';
import * as exp from 'constants';
import ConfigManager from '../manager/Config/ConfigManager';
import { StorySystem } from '../gameplay/Manager/StorySystem';
import { FunctionOpenType } from "../gameplay/GameDataModel/FunctionOpenType";
import { FunctionOpenSystem } from "db://assets/script/game/gameplay/Manager/FunctionOpenSystem";
import { ConditionAndOr, ConditionMgr } from '../gameplay/Manager/ConditionMgr';
import { GameDot } from '../gameplay/Manager/GameDot';

export enum GuideType{
    PlayStory=1,
    PlayDialogue=2,
    ClickBtn=3,
    FunctionOpen=4,
    OnlyShowDesc=5,
}


@ccclass('GuideManager')
export class GuideManager {
    private static _instance: GuideManager;
    public static get Instance(): GuideManager {
        if (!this._instance) {
            this._instance = new GuideManager()
            this._instance._arrTrGuide = ConfigManager.tables.TbGuide.getDataList();
        }
        return this._instance;
    }

    private _arrTrGuide:TrGuideTest[]|undefined=null!;
    private _trGuide: TrGuideTest | undefined = null!;
    private _bubbleTxt:string|undefined;
    private _isGuiding:boolean = false;
    private _isInFinger:boolean = false;
    private _curGuideId: number = 104;//
    private _onComplete:()=>void=()=>{};

    TryShowGuide(guideId:number
        , arrBtnGuide: Button[]=null!
        , onOpen:()=>void=null!
        , onComplete:()=>void=null!
        , HideOrDisplayUINode:(display:boolean,arrHideNode:Node[])=>void=null!
        , arrHideNode:Node[]=[]
        , arrNodeTakeUp:Node[]=[])
    {
        if (GameData.IsGuideFinished(guideId)) {
            if (onComplete) {
                onComplete();
            }

            return
        }

        //this._trGuide = ConfigManager.tables.TbGuide.get(guideId);
        let result = ConditionMgr.inst.checkAllConditions(ConfigManager.tables.TbGuide.get(guideId)!.Condition, ConditionAndOr.And)
        if (!GameData.IsfrontGuideAllFinished(guideId) || !result) {
            return;
        }

        this._onComplete = onComplete;
        if (onOpen) {
            onOpen();
        }
        
        
        this._curGuideId = guideId;
        this._trGuide = ConfigManager.tables.TbGuide.get(this._curGuideId);
        if (guideId<=1100) {
            if (HideOrDisplayUINode) {
                HideOrDisplayUINode(false,arrHideNode);
            }
        }

        this._isGuiding = true;

        switch (this._trGuide?.Type) {
            case GuideType.PlayStory:
                this.SetPlayStory()
                break;
            case GuideType.ClickBtn:
                this.SetFinger(arrBtnGuide,arrNodeTakeUp)
                break;
            case GuideType.FunctionOpen:
                this.SetFunctionOpen()
                break;
            case GuideType.OnlyShowDesc:
                this.SetOnlyShowDesc(arrBtnGuide,arrNodeTakeUp);
                break;
            default:
                break;
        }
    }

    SetPlayStory() 
    {
        this.FinishGuide();
        let storyId = Number(this._trGuide?.Parm1)
        StorySystem.Instance.Play(storyId, () => {
            if (this._onComplete) {
                this._onComplete()
            }
            
        }
        );
    }

    SetFinger(arrBtnGuide: Button[] = null!, arrNodeTakeUp: Node[] = null!) {
        let targetBtnName: string
        let targetBtn = this.GetTargetBtn(arrBtnGuide, this._trGuide!.Parm1)
        let targetNode = this.getNodeTakeUp(arrNodeTakeUp,this._trGuide!.Parm3)
        this._bubbleTxt = this._trGuide?.Parm2
        if (targetBtn) {
            this._isInFinger = true;
            oops.gui.openAsync(UIID.UIGuide,
                {
                    guideId: this._curGuideId,
                    targetBtn: targetBtn,
                    targetNodeTakeUp: targetNode,
                    bubbleTxt: this._bubbleTxt,
                    onComplete: ()=>
                    {
                        FunctionOpenSystem.Instance.ShowOpenFunction(()=>
                        {
                            if (this._onComplete) {
                                this._onComplete()
                            }
                        });
                    },
                }
            );
        }
        else {
            console.error("TargetBtn  ID: " + this._curGuideId);
        }
        
    }
    SetFunctionOpen()
    {
        //if (GameData.GetGuideStep() == this._curGuideId) {
            //
            //FunctionOpenSystem.Instance.AddOpenFunction(Number(this._trGuide?.Parm1));
            FunctionOpenSystem.Instance.ShowOpenFunction();
            this.FinishGuide();
            if (this._onComplete) {
                this._onComplete()
            }
        //}
    }

    SetOnlyShowDesc(arrBtnGuide: Button[] = null!, arrNodeTakeUp: Node[] = null!) {
        this._bubbleTxt = this._trGuide?.Parm2
        let targetBtn = this.GetTargetBtn(arrBtnGuide, this._trGuide!.Parm1)
        let targetNode = this.getNodeTakeUp(arrNodeTakeUp,this._trGuide!.Parm3)
        oops.gui.openAsync(UIID.UIGuide,
            {
                guideId: this._curGuideId,
                targetBtn: targetBtn,
                targetNodeTakeUp: targetNode,
                bubbleTxt: this._bubbleTxt,
                onComplete: this._onComplete,
            }
        );
    }

    FinishGuide()
    {
        if (this._isGuiding) {
            this._isInFinger = false
            this._isGuiding = false
            this.SetGuideIdFinished(this._curGuideId);
            oops.gui.remove(UIID.UIGuide)
            try {
                GameDot.Instance.GuideDot(this._curGuideId);
            } catch (error) {
                console.error("GameDot.Instance.GuideDot !!! " + error)
            }
            
        }
        FunctionOpenSystem.Instance.CheckCondition();
    }

    SetGuideIdFinished(guideId:number)
    {
        GameData.SaveGuideStep(guideId);
    }

    private GetTargetBtn(arrBtnGuide:Button[], targetBtnName:string)
    {
        for (let i = 0; i < arrBtnGuide.length; i++) {
            const element = arrBtnGuide[i].node;
            if (element.name == targetBtnName) 
            {
                return element;
            }
        }
    }

    private getNodeTakeUp(arrNodeTakeUp:Node[], targetNodeName:string)//
    {
        for (let i = 0; i < arrNodeTakeUp.length; i++) {
            const element = arrNodeTakeUp[i];
            if (element.name == targetNodeName) 
            {
                return element;
            }
        }
    }

    private GetNextGuideId(curGuideId:number)
    {
        for (let i = 0; i < this._arrTrGuide!.length; i++) {
            const element = this._arrTrGuide![i];
            if (element.GuideID == curGuideId) {
                if (i>=this._arrTrGuide!.length-1) {
                    return 0
                }
                else
                {
                    return this._arrTrGuide![i+1].GuideID
                }
            }
            
        }

        return 0;
    }

    public IsInFinger() {
        return this._isInFinger;
    }
}

export class TrGuideTest {
   GuideID:number=0;
   Type:number=0;
   Condition:number[]=[];
   Parm1:string=null!;
   Parm2:string=null!;
   Parm3:string=null!;
}


