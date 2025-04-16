export enum CharacterAttribute {
    None = 0,
    Strength,
    Endurance,
    Intelligence,
    Charisma,
    Appearance
}

export enum ItemEnum{
    None = 0,
    /**  */
    FinalcialClass = 10000000,   //
    /**  */
    Cash = 100001,       //
    /**  */
    Gem = 100002,
    /**  */
    Key = 100003,
    /**   */
    Biao = 10000002,        //  
    /**   */
    YuPei = 10000003,       //  
    /**  */
    ExpClass = 20000000,    //
    /**  1 */
    ExpPlayer1 = 20000002,  // 1
    /**  2 */
    ExpPlayer2 = 20000003,  // 2

    ExpEnd = 20000100,
}

export enum MagicBoxRewardType
{
    Item = 1,//
    Identity = 2,////
    Currency = 3,//
    Property = 4,//
    Exp = 5,//
}

export interface ICurrencyClass{
    name:string,
    currency: number[];
}

/**
 * 
 */
export enum EItemClass{
    XinWu = 1,      //
}

export const CurrencyShow = {
    [EItemClass.XinWu]: {
        name: "",
        currency: [ItemEnum.Biao, ItemEnum.YuPei]
    }
}

export enum SublimingType {
    AllProp = 1,//
    MagicReward = 2,//
    SingleProp = 3,//
}

