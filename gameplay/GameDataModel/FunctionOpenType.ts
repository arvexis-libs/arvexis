import { Enum } from "cc";

 export enum FunctionOpenType
{
    None = 0,
    Interaction = 1,            //
    FateLine = 2,               //
    PlayerInvite = 3,           //
    Player1_Interaction1 = 5,   //11
    Player1_Interaction2 = 6,   //12
    Player1_Interaction3 = 7,   //13
    Player1_Interaction4 = 8,   //14
    Player2_Interaction1 = 9,   //21
    Player2_Interaction2 = 10,  //22
    Player2_Interaction3 = 11,  //23
    Player2_Interaction4 = 12,  //24
    ClarityMemory = 13,         //
    Constellation = 14,         //
    HeartMission = 15,          //
    HeartLevel = 16,            //
    Date = 17,                  //
    Skin = 18,                  //
    Photo = 19,                 //
    WorldTree = 20,             //
    Phone = 21,                 //
    Fitness = 99,
}

export const TypeEnum = Enum(FunctionOpenType);