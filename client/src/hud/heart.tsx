const SIZER = {
  smol: "h-3 w-3",
  big: "h-8 w-8",
};

export function Heart({ size }: { size: "smol" | "big" }) {
  return (
    <div className={SIZER[size]}>
      <img
        src="/heart.png"
        alt="heart"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
