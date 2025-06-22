const SIZER = {
    smol: 'h-3 w-3',
    big: "h-8 w-8"
}

export function FancyHeart({ size, style }: { size: 'smol' | 'big', style?: React.CSSProperties }) {
    return (
        <div 
            className={SIZER[size]}
            style={style}
        >
            <img src="/hearts/4-4.svg" alt="fancy-heart" className="w-full h-full object-contain" />
        </div>
    );
}