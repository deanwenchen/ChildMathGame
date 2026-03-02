declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    flatten?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    position?: { x?: number; y?: number; w?: number; h?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
    useWorker?: boolean;
    resize?: boolean;
    canvas?: HTMLCanvasElement;
  }

  interface ConfettiInstance {
    (options?: Options): void;
  }

  interface Confetti {
    (options?: Options): void;
    create(canvas: HTMLCanvasElement, options?: { resize?: boolean; useWorker?: boolean; }): ConfettiInstance;
  }

  const confetti: Confetti;
  export default confetti;
  export as namespace confetti;
}
