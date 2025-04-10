// Anime.js v4 TypeScript Definitions

// Animation instance returned by animate()
interface AnimeInstance {
  pause: () => void;
  play: () => void;
  restart: () => void;
  reverse: () => void;
  seek: (time: number) => void;
  complete: () => void;
}

// Animation timeline returned by createTimeline()
interface AnimeTimeline extends AnimeInstance {
  add: (params: object, timeOffset?: string | number) => AnimeTimeline;
}

// Stagger function and options
interface AnimeStaggerOptions {
  start?: number;
  from?: number | string | 'first' | 'last' | 'center';
  direction?: 'normal' | 'reverse';
  easing?: string | ((el: any, i: number, total: number) => number);
  grid?: [number, number];
  axis?: 'x' | 'y';
}

interface AnimeStaggerFunction {
  (value: number): (el: any, i: number, total: number) => number;
  (value: number, options: AnimeStaggerOptions): (el: any, i: number, total: number) => number;
}

// SVG interface for createDrawable
interface AnimeSvgInterface {
  createDrawable: (selector: string | SVGElement | SVGElement[]) => any[];
}

// Easing functions
interface AnimeEasing {
  (t: number): number;
}

// Timeline parameters
interface AnimeTimelineParams {
  targets?: any;
  autoplay?: boolean;
  duration?: number;
  easing?: string | AnimeEasing;
  loop?: boolean | number;
  direction?: 'normal' | 'reverse' | 'alternate';
  delay?: number | ((el: any, i: number, total: number) => number);
  endDelay?: number;
  [prop: string]: any;
}

// Main Anime.js API interface
interface AnimeJS {
  // Core methods
  animate: (targets: any, params: object) => AnimeInstance;
  createTimeline: (params?: AnimeTimelineParams) => AnimeTimeline;
  createTimer: (params: object) => AnimeInstance;
  createSpring: (params: { stiffness?: number, damping?: number, mass?: number }) => (t: number) => number;
  createDraggable: (targets: any, params: object) => any;
  createScope: (params: object) => any;
  
  // Utility functions
  stagger: AnimeStaggerFunction;
  svg: AnimeSvgInterface;
  utils: {
    $: (selector: string) => any[];
    cloneNode: (node: Node) => Node;
    getAnimations: (targets?: any) => AnimeInstance[];
    random: (min: number, max: number) => number;
    [key: string]: any;
  };
  
  // Backwards compatibility with v3
  (params: object): AnimeInstance;
  timeline: (params?: object) => AnimeTimeline;
}

declare global {
  interface Window {
    anime: AnimeJS;
  }
}

// This empty export is necessary to make this a module
export {};