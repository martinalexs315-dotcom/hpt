import { useEffect, useRef, useState } from 'react';

const MOBILE_QUERY = '(max-width: 759px)';

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}

export function useScrollY() {
  const [y, setY] = useState(() => window.scrollY);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  return y;
}

/** Adds `.visible` once the element scrolls into view; calls onReveal the first time. */
export function useReveal(onReveal) {
  const ref = useRef(null);
  const cb = useRef(onReveal);
  cb.current = onReveal;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add('visible');
      cb.current?.();
      io.disconnect();
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Eased 0→1 progress that starts when `start()` is called. */
export function useCountUp(duration = 1600) {
  const [t, setT] = useState(0);
  const started = useRef(false);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const start = () => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  return [t, start];
}
