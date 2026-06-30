'use client';

import { useEffect, useRef, useState } from 'react';

const getFlipPosition = (cardRect: DOMRect, expandedWidth: number, expandedHeight: number) => {
  return {
    flipX: cardRect.left + expandedWidth > window.innerWidth,
    flipY: cardRect.top + expandedHeight > window.innerHeight,
  };
}

type UseMovieCardHoverOptions = {
  delay: number;
  expandedWidth: number;
  expandedHeight: number;
};

export const useMovieCardHover = (
  ref: React.RefObject<HTMLElement | null>,
  { delay, expandedWidth, expandedHeight }: UseMovieCardHoverOptions,
) => {
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, []);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      const cardRect = ref.current?.getBoundingClientRect();
      if (cardRect) {
        const { flipX, flipY } = getFlipPosition(cardRect, expandedWidth, expandedHeight);
        setFlipX(flipX);
        setFlipY(flipY);
      }
      setIsHovered(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  };

  return { isHovered, flipX, flipY, handleMouseEnter, handleMouseLeave };
}
