import React from "react";
import type { Tile } from "../../types";

const TileComponent = ({ tile }: { tile: Tile }) => {
  return <div className="w-10 h-10 bg-gray-200 border">{tile}</div>;
};

export default TileComponent;
