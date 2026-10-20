// jsdom has no AnimationEvent, so React would listen for the prefixed `webkitAnimationEnd` and never see the
// `animationend` that tests fire. React checks this once when it loads, so it has to exist before any React import.
if (!('AnimationEvent' in window)) {
  Object.defineProperty(window, 'AnimationEvent', { value: class AnimationEvent extends Event {} });
}
