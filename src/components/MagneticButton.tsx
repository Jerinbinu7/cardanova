import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTouchDevice } from '../hooks/useTouchDevice';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  cursorLabel?: string;
  as?: 'button' | 'a';
  target?: string;
  rel?: string;
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  cursorLabel = '',
  as = 'button',
  target,
  rel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useTouchDevice();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 200 });
  const springY = useSpring(y, { damping: 15, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.3;
    const distY = (e.clientY - centerY) * 0.3;
    x.set(distX);
    y.set(distY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Tag = as === 'a' ? motion.a : motion.button;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Tag
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        data-cursor={cursorLabel}
        className={className}
        style={{
          x: reducedMotion || isTouch ? 0 : springX,
          y: reducedMotion || isTouch ? 0 : springY,
        }}
        whileTap={reducedMotion ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {children}
      </Tag>
    </div>
  );
}
