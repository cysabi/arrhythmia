const SIZER = {
    smol: 'h-3 w-3',
    big: "h-8 w-8"
}

export function FancyHeart({ isAnimating, direction, size, onAnimationComplete, style }: { isAnimating: boolean, direction: 'filling' | 'emptying', size: 'smol' | 'big', onAnimationComplete: () => void, style?: React.CSSProperties }) {
    
    const animationClass = isAnimating 
        ? direction === 'filling' 
            ? 'animate-heart-fill' 
            : 'animate-heart-empty'
        : '';

    return (
        <div 
            className={`${SIZER[size]} ${animationClass}`}
            onAnimationEnd={onAnimationComplete}
            style={style}
        >
            <img src="/hearts/4-4.svg" alt="fancy-heart" className="w-full h-full object-contain" />
        </div>
    );
}