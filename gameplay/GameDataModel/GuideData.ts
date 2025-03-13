

import { SerializeClass, SerializeData } from "../../../modules/base/SerializeClass";
import { TimeUtility } from "../Utility/TimeUtility";

export class GuideData extends SerializeClass {
    __className:string = "GuideData";
    @SerializeData()
    public PlayerId: number = 0;
    @SerializeData()
    public GuideStepId: number = 1000;
    @SerializeData()
    public ArrGuideState: GuideState[] = [];
}

export class GuideState extends SerializeClass{
    __className:string = "GuideState";
    @SerializeData()
    public GuideId: number = 0;
    @SerializeData()
    public Finished: boolean = false;
}
