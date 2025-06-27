const SIZER = {
  smol: "h-3 w-3",
  big: "h-8 w-8",
};

import heart from "/heartgem.svg";

export function FancyHeart({
  size,
  style,
}: {
  size: "smol" | "big";
  style?: React.CSSProperties;
}) {
  return (
    <div className={SIZER[size]} style={style}>
      <img
        style={{ scale: 2 }}
        src={heart}
        alt="fancy-heart"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
