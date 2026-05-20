import { ReplicatedStorage } from "@rbxts/services";

const events = ReplicatedStorage.WaitForChild("Events") as Folder;

export const UpdateHUD = events.WaitForChild("UpdateHUD") as RemoteEvent;
export const GameStateChanged = events.WaitForChild("GameStateChanged") as RemoteEvent;