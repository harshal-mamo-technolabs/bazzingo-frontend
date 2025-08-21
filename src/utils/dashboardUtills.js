import React, {useEffect, useState} from "react";

export function useMediaQuery(query) {
    const getMatches = () =>
        typeof window !== 'undefined' ? window.matchMedia(query).matches : false;

    const [matches, setMatches] = useState(getMatches);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        setMatches(mql.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}

export function useAutoScroll(containerRef, enabled, intervalMs = 2000) {
    useEffect(() => {
        if (!enabled) return;
        const container = containerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('.carousel-card');
        if (!cards || cards.length < 2) return;

        let index = 0;
        const id = setInterval(() => {
            index = (index + 1) % cards.length;
            const scrollTo = cards[index].offsetLeft;
            container.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }, intervalMs);

        return () => clearInterval(id);
    }, [containerRef, enabled, intervalMs]);
}

export const DAILY_GAMES = [
    {
        id: 4,
        title: 'Probability Prediction',
        category: 'Numerical Reasoning',
        difficulty: 'Easy',
        icon: './games-icon/probability-prediction.png',
        bgColor: '#ffffff',
        path: '/games/probability-prediction-game',
    },
    {
        id: 5,
        title: 'Word Chain Logic',
        category: 'Logic',
        difficulty: 'Medium',
        icon: './games-icon/word-chain-logic.png',
        bgColor: '#1D1D1B',
        path: '/games/word-chain-logic-game',
    },
    {
        id: 6,
        title: 'Resource Allocation Game',
        category: 'Critical Thinking',
        difficulty: 'Medium',
        icon: './games-icon/resource-allocation-strategy.png',
        bgColor: '#FFFFFF',
        path: '/games/resource-allocation-strategy-game',
    },
];