import type { PropsWithChildren } from "react";
import { Health } from "./health";
import type { Player } from "../types";

const PlayerToast = () => {
  return (
    <div className="absolute inset-0 -translate-y-full flex items-end justify-center text-center">
      <div className="text-sm whitespace-nowrap px-2 font-semibold text-yellow-800">
        too early!
      </div>
    </div>
  );
};
