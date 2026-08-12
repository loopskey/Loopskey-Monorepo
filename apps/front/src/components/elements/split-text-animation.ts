import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { TSplitTextProps } from "@/types/element.types";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

export type SplitTextAnimationOptions = Pick<
  TSplitTextProps,
  | "to"
  | "text"
  | "ease"
  | "from"
  | "delay"
  | "duration"
  | "splitType"
  | "startDelay"
  | "threshold"
  | "rootMargin"
  | "inheritGradient"
> & { onComplete?: () => void };

type SplitTextElement = HTMLElement & {
  _rbsplitInstance?: GSAPSplitText;
};

export const animateSplitText = (
  el: SplitTextElement,
  {
    text,
    delay = 50,
    startDelay = 0,
    duration = 1.25,
    ease = "power3.out",
    splitType = "chars",
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = "-100px",
    inheritGradient = false,
    onComplete,
  }: SplitTextAnimationOptions,
) => {
  if (!text) return () => {};

  if (el._rbsplitInstance) {
    try {
      el._rbsplitInstance.revert();
    } catch {}
    el._rbsplitInstance = undefined;
  }

  const startPct = (1 - threshold) * 100;
  const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
  const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
  const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
  const sign =
    marginValue === 0
      ? ""
      : marginValue < 0
        ? `-=${Math.abs(marginValue)}${marginUnit}`
        : `+=${marginValue}${marginUnit}`;
  const start = `top ${startPct}%${sign}`;

  // `background-clip: text` paints the gradient on this element and clips
  // it to the glyphs. Once GSAP splits the text and tweens each character
  // (transform + opacity), every character becomes its own compositing
  // layer and drops out of that clip, so the line renders as nothing.
  // Re-paint the same gradient on each character instead, offset by the
  // character's layout position so the sweep still reads as one line.
  // offsetLeft/offsetTop are layout values, so the tween cannot skew them.
  const paintGradient = (chars: Element[]) => {
    const backgroundImage = getComputedStyle(el).backgroundImage;
    if (backgroundImage === "none") return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    chars.forEach((char) => {
      const node = char as HTMLElement;
      node.style.backgroundImage = backgroundImage;
      node.style.backgroundSize = `${width}px ${height}px`;
      node.style.backgroundPosition = `${-node.offsetLeft}px ${-node.offsetTop}px`;
      node.style.backgroundClip = "text";
      node.style.webkitBackgroundClip = "text";
    });
  };

  let targets: Element[] = [];
  const assignTargets = (self: GSAPSplitText) => {
    if (splitType.includes("chars") && self.chars?.length) targets = self.chars;
    if (!targets.length && splitType.includes("words") && self.words.length)
      targets = self.words;
    if (!targets.length && splitType.includes("lines") && self.lines.length)
      targets = self.lines;
    if (!targets.length) targets = self.chars || self.words || self.lines;
  };

  const splitInstance = new GSAPSplitText(el, {
    type: splitType,
    smartWrap: true,
    autoSplit: splitType === "lines",
    linesClass: "split-line",
    wordsClass: "split-word",
    charsClass: "split-char",
    reduceWhiteSpace: false,
    onSplit: (self: GSAPSplitText) => {
      assignTargets(self);
      if (inheritGradient) paintGradient(targets);
      return gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          delay: startDelay / 1000,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
            anticipatePin: 0.4,
          },
          onComplete,
          willChange: "transform, opacity",
          force3D: true,
        },
      );
    },
  });

  el._rbsplitInstance = splitInstance;

  // Breakpoints change the heading's font size, which moves every
  // character, so the gradient offsets have to be recomputed.
  let resizeObserver: ResizeObserver | undefined;
  if (inheritGradient) {
    resizeObserver = new ResizeObserver(() => paintGradient(targets));
    resizeObserver.observe(el);
  }

  return () => {
    resizeObserver?.disconnect();
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === el) st.kill();
    });
    try {
      splitInstance.revert();
    } catch {}
    el._rbsplitInstance = undefined;
  };
};
