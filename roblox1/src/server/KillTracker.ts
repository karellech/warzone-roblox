import { Players } from "@rbxts/services";
import { registerKill } from "./GameManager";

// ── Suivi des dégâts par joueur ──────────────────────────────
// On écoute l'événement Humanoid.Died pour détecter les morts

function onCharacterAdded(character: Model): void {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;

    humanoid.Died.Connect(() => {
        const victim = Players.GetPlayerFromCharacter(character);
        if (!victim) return;

        // Trouver le tueur via le tag "creator" placé par l'arme
        const creatorTag = humanoid.FindFirstChild("creator") as ObjectValue | undefined;
        if (!creatorTag || !creatorTag.Value) return;

        const killer = creatorTag.Value as Player;
        if (!killer || killer === victim) return;

        // Récupérer le nom de l'arme depuis le tag
        const weaponTag = humanoid.FindFirstChild("weapon") as StringValue | undefined;
        const weapon = weaponTag ? weaponTag.Value : "Unknown";

        registerKill(killer, victim, weapon);
    });
}

// Écouter les nouveaux personnages pour tous les joueurs
Players.PlayerAdded.Connect((player) => {
    player.CharacterAdded.Connect((character) => {
        onCharacterAdded(character);
    });
});

print("[WarZone] KillTracker actif !");