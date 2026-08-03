import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTouchDevice } from '../hooks/useTouchDevice';

export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const isTouch = useTouchDevice();
  const [cursorText, setCursorText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const springConfigRing = { damping: 20, stiffness: 180, mass: 0.8 };

  const dotX = useSpring(mouseX, springConfig);
  const dotY = useSpring(mouseY, springConfig);
  const ringX = useSpring(mouseX, springConfigRing);
  const ringY = useSpring(mouseY, springConfigRing);

  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isTouch || reducedMotion) return;

    // Keep default browser cursor visible
    document.body.style.cursor = 'auto';

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        if (!isVisible) setIsVisible(true);
      });
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // Detect hoverable elements
    const onOverInteractive = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        document.body.style.cursor = 'auto';
        setIsHovering(false);
        setCursorText('');
        return;
      } else {
        document.body.style.cursor = 'none';
      }

      const closest = target.closest(
        'a, button, [data-cursor], .product-card, .gallery-image'
      );
      if (closest) {
        setIsHovering(true);
        const text = closest.getAttribute('data-cursor') || '';
        setCursorText(text);
      }
    };

    const onOutInteractive = () => {
      setIsHovering(false);
      setCursorText('');
    };

    document.addEventListener('mouseover', onOverInteractive, { passive: true });
    document.addEventListener('mouseout', onOutInteractive, { passive: true });

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOverInteractive);
      document.removeEventListener('mouseout', onOutInteractive);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isTouch, reducedMotion, mouseX, mouseY, isVisible]);

  if (isTouch || reducedMotion) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full"
        style={{
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
          backgroundColor: '#fff',
          mixBlendMode: 'difference',
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
      />
      {/* Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998] flex items-center justify-center rounded-full border-[1.5px]"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: '#fff',
          mixBlendMode: 'difference',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 64 : 36,
          height: isHovering ? 64 : 36,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <AnimatePresence>
          {cursorText && (
            <motion.span
              key={cursorText}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-[10px] font-medium tracking-wider text-white uppercase"
              style={{ mixBlendMode: 'difference' }}
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
