import type { PropsWithChildren } from "react";
import { Health } from "./health";
import type { Player } from "../types";

export function PlayerWrapper({ player, children }: { player: Player } & PropsWithChildren) {
    return (
        <div className="relative group cursor-pointer">
            <Health player={player} size="smol" hoverOnly={true} />
            {children}
        </div>
    )
}