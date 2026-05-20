import { ReplicatedStorage, SoundService } from "@rbxts/services";

const sound = new Instance("Sound");
sound.Name = "Ambiance";
sound.SoundId = "rbxassetid://138622883735751";
sound.Volume = 0.4;
sound.Looped = true;
sound.RollOffMaxDistance = 0; // pas d'atténuation 3D
sound.Parent = SoundService;

const eventsFolder = ReplicatedStorage.WaitForChild("Events") as Folder;
const updateHUDEvent = eventsFolder.WaitForChild("UpdateHUD") as RemoteEvent;

updateHUDEvent.OnClientEvent.Connect((_, __, state: string) => {
    if (state.sub(1, 5) === "MATCH") {
        if (!sound.IsPlaying) {
            sound.Play();
        }
    } else {
        if (sound.IsPlaying) {
            sound.Stop();
        }
    }
});