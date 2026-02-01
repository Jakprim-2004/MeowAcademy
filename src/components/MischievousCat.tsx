import { useState, useEffect, useRef } from 'react';
// import { Cat } from 'lucide-react'; // Removed lucide icon import
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const MischievousCat = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [mode, setMode] = useState<'peeking' | 'idle'>('idle');
    const [dialogue, setDialogue] = useState<string | null>(null);

    const location = useLocation();
    const peekTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Peeking Logic (Random intervals)
    useEffect(() => {
        const schedulePeek = () => {
            const randomTime = Math.random() * 20000 + 10000; // 10-30s
            peekTimerRef.current = setTimeout(() => {
                // Only peek if currently idle
                if (mode === 'idle' && Math.random() > 0.6) {
                    setMode('peeking');
                    setDirection(Math.random() > 0.5 ? 'left' : 'right');
                    setDialogue("เมี๊ยว? 😺");

                    // Go back to sleep after peeking
                    setTimeout(() => {
                        setMode('idle');
                        setDialogue(null);
                        schedulePeek(); // Schedule next
                    }, 4000);
                } else {
                    schedulePeek(); // Try again later
                }
            }, randomTime);
        };

        schedulePeek();
        return () => {
            if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
        };
    }, [mode]);

    const handleClick = () => {
        const audio = new Audio("/sounds/meow.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => { });

        // Wake up briefly if clicked while sleeping
        if (mode === 'idle') {
            setMode('peeking');
            setDialogue("งื้อออ! 😻");
            setTimeout(() => {
                setMode('idle');
                setDialogue(null);
            }, 2000);
        } else {
            setDialogue("เมี๊ยววว!");
            setTimeout(() => setDialogue(null), 1500);
        }
    };

    // Determine current image
    const getCatImage = () => {
        if (mode === 'idle') return "/images/cat-icons/sleeping_cat.png";
        return "/images/cat-icons/running_cat.png";
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed z-[100] transition-all duration-500 ease-out pointer-events-auto cursor-pointer",
                // Positioning logic
                mode === 'idle' ? "bottom-4 right-4" : "", // Sleep in corner
                mode === 'peeking' ? "top-1/2 -translate-y-1/2" : "",

                !isVisible && "opacity-0"
            )}
            style={{
                right: (mode === 'idle' || (mode === 'peeking' && direction === 'right')) ? '1rem' : 'auto',
                left: (mode === 'peeking' && direction === 'left') ? '0' : 'auto',

                transform: `${mode === 'peeking' ? (direction === 'left' ? 'translateX(-20%) hover:translateX(0)' : 'translateX(20%) hover:translateX(0)') : ''}
                           ${mode === 'idle' ? 'scale(0.8) hover:scale(1.0)' : ''}`
            }}
            onClick={handleClick}
        >
            <div className="relative group">
                {/* Dialogue Bubble */}
                {dialogue && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-2xl shadow-lg border border-primary/20 whitespace-nowrap animate-fade-in-up z-10">
                        <span className="text-sm font-medium text-primary">{dialogue}</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-primary/20"></div>
                    </div>
                )}

                {/* The Cat Image */}
                <div className={cn(
                    "relative transition-transform duration-300",
                    // Flip image if moving left (only for scrolling/running cat)
                    (direction === 'left' && mode !== 'idle') && "scale-x-[-1]"
                )}>
                    <img
                        src={getCatImage()}
                        alt="Mischievous Cat"
                        className={cn(
                            "object-contain drop-shadow-xl select-none",
                            mode === 'idle' ? "w-20 h-20" : "w-24 h-24"
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default MischievousCat;
