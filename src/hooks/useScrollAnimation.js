import { useState, useEffect, useRef } from 'react';

/**
 * Animates a list of items in when they enter the viewport.
 * Returns setRef(i) to attach to each item, and isVisible(i) to check state.
 */
export function useScrollAnimation(itemCount) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.animIdx);
            setVisibleItems(prev => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    itemRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [itemCount]);

  const setRef = (i) => (el) => { itemRefs.current[i] = el; };

  return {
    setRef,
    isVisible: (i) => visibleItems.has(i),
  };
}
