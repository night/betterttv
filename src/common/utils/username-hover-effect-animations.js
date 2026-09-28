import classNames from 'classnames';
import effects from '@/common/styles/UsernameEffects.module.css';
import {UsernameHoverEffects, UsernameEffects} from '@/constants';
import {shouldReduceMotion} from './reduced-motion';

// Replays the text as per-character cells in an overlay; inline-block letter spans would drop kerning.

// past this many characters the stagger drags and every extra character costs another cell
const WHOLE_NAME_CHARACTERS = 15;

// clip window bleed past each character's advance box, so kerned ink overhang survives
const CLIP_PAD_RATIO = 0.75;

const CLEANUP_BACKSTOP_MS = 250;

// scripts whose glyphs render identically in isolation; anything else reshapes and animates whole
const SAFE_TEXT_PATTERN =
  /^[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Common}\p{Script=Inherited}]*$/u;

// keeps flags, zwj emoji and combining marks whole; guarded because a module-scope throw kills the bundle
const graphemeSegmenter =
  typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, {granularity: 'grapheme'}) : null;

function splitGraphemes(text) {
  if (graphemeSegmenter == null) {
    return [...text];
  }

  return [...graphemeSegmenter.segment(text)].map((segment) => segment.segment);
}

const animatingNodes = new WeakSet();

// effect classes mirrored onto the copies so background-clip textures keep rendering in the overlay
const USERNAME_EFFECT_CLASS_NAMES = Object.values(UsernameEffects)
  .map((usernameEffect) => effects[usernameEffect])
  .filter((className) => className != null);

function measureText(node) {
  const textNode = node.firstChild;
  if (node.childNodes.length !== 1 || textNode?.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const text = textNode.textContent;
  if (text.length === 0) {
    return null;
  }

  // one rect per line box, so more than one means the name wrapped and the slots would be wrong
  const rects = node.getClientRects();
  if (rects.length !== 1) {
    return null;
  }

  const baseRect = rects[0];
  const characters = splitGraphemes(text);
  const range = document.createRange();

  if (characters.length > WHOLE_NAME_CHARACTERS || !SAFE_TEXT_PATTERN.test(text)) {
    // measured off the text, not the element box: they differ on scripts that draw outside their line box
    range.selectNodeContents(textNode);
    const textRect = range.getBoundingClientRect();
    return {
      slots: [
        {
          character: text,
          left: textRect.left - baseRect.left,
          top: textRect.top - baseRect.top,
          width: textRect.width,
          height: textRect.height,
        },
      ],
      width: baseRect.width,
    };
  }

  let unitOffset = 0;
  const slots = [];
  for (const character of characters) {
    const characterUnitOffset = unitOffset;
    unitOffset += character.length;
    if (character.trim().length === 0) {
      continue;
    }

    range.setStart(textNode, characterUnitOffset);
    range.setEnd(textNode, unitOffset);
    const rect = range.getBoundingClientRect();
    slots.push({
      character,
      left: rect.left - baseRect.left,
      top: rect.top - baseRect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  if (slots.length === 0) {
    return null;
  }

  return {slots, width: baseRect.width};
}

function buildCharacterCopy(slot, usernameEffectClassName) {
  const copy = document.createElement('span');
  copy.className = usernameEffectClassName ?? '';
  copy.textContent = slot.character;
  return copy;
}

function buildFlipStrip(slot, usernameEffectClassName) {
  const strip = document.createElement('span');
  strip.className = effects.flipStrip;
  strip.appendChild(buildCharacterCopy(slot, usernameEffectClassName));
  strip.appendChild(buildCharacterCopy(slot, usernameEffectClassName));
  return strip;
}

// bounce and wave animate the cell itself, so one static copy suffices
function buildStaticStrip(slot, usernameEffectClassName) {
  const strip = document.createElement('span');
  strip.className = effects.staticStrip;
  strip.appendChild(buildCharacterCopy(slot, usernameEffectClassName));
  return strip;
}

function syncAnimationTimes(sourceAnimations, targetAnimations) {
  const timesByName = new Map();
  for (const animation of sourceAnimations) {
    if (timesByName.has(animation.animationName)) {
      continue;
    }

    timesByName.set(animation.animationName, animation.currentTime);
  }

  for (const animation of targetAnimations) {
    const sourceTime = timesByName.get(animation.animationName);
    if (sourceTime == null) {
      continue;
    }

    animation.currentTime = sourceTime;
  }
}

const ANIMATIONS_BY_EFFECT = {
  [UsernameHoverEffects.FLIP]: {buildStrip: buildFlipStrip, cellClassName: effects.flipCell},
  [UsernameHoverEffects.BOUNCE]: {buildStrip: buildStaticStrip, cellClassName: effects.bounceCell},
  [UsernameHoverEffects.WAVE]: {buildStrip: buildStaticStrip, cellClassName: effects.waveCell},
};

// reports whether a run started, so callers can refund their rate limiting on bails
export default function runUsernameHoverEffectAnimation(node, effect) {
  const animation = ANIMATIONS_BY_EFFECT[effect];
  if (node == null || animation == null || animatingNodes.has(node) || shouldReduceMotion()) {
    return false;
  }

  const measured = measureText(node);
  if (measured == null) {
    return false;
  }

  const {slots, width} = measured;
  animatingNodes.add(node);

  const overlay = document.createElement('span');
  overlay.className = effects.textAnimOverlay;
  overlay.style.setProperty('--bttv-name-width', `${width}px`);
  // the overlay takes over the host's filter for the run; see .textAnimHost in the stylesheet
  const hostFilter = getComputedStyle(node).filter;
  overlay.style.filter = hostFilter === 'none' ? '' : hostFilter;

  const usernameEffectClassName = USERNAME_EFFECT_CLASS_NAMES.find((className) => node.classList.contains(className));

  for (const [index, slot] of slots.entries()) {
    const cell = document.createElement('span');
    cell.className = classNames(effects.textAnimCell, animation.cellClassName);
    const clipPadPx = Math.round(slot.height * CLIP_PAD_RATIO);
    cell.style.setProperty('--bttv-cell-index', index);
    cell.style.setProperty('--bttv-cell-x', `${Math.round(slot.left) - clipPadPx}px`);
    cell.style.setProperty('--bttv-cell-y', `${Math.round(slot.top)}px`);
    cell.style.setProperty('--bttv-cell-width', `${Math.round(slot.width) + clipPadPx * 2}px`);
    cell.style.setProperty('--bttv-cell-height', `${Math.round(slot.height)}px`);
    cell.style.setProperty('--bttv-cell-pad', `${clipPadPx}px`);
    cell.style.setProperty('--bttv-cell-char-left', `${slot.left}px`);

    cell.appendChild(animation.buildStrip(slot, usernameEffectClassName));
    overlay.appendChild(cell);
  }

  // hidden by visibility alone, so the text node twitch's react owns is never moved
  node.classList.add(effects.textAnimHost);
  node.appendChild(overlay);

  // isolated copies land a hair off their slot; all reads then all writes, so this costs one layout
  const hostRect = node.getBoundingClientRect();
  const correctionRange = document.createRange();
  const cellDeltas = slots.map((slot, index) => {
    correctionRange.selectNodeContents(overlay.children[index].firstChild.firstChild);
    const renderedRect = correctionRange.getBoundingClientRect();
    return [renderedRect.left - (hostRect.left + slot.left), renderedRect.top - (hostRect.top + slot.top)];
  });
  for (const [index, [deltaX, deltaY]] of cellDeltas.entries()) {
    if (deltaX === 0 && deltaY === 0) {
      continue;
    }

    const cell = overlay.children[index];
    cell.style.setProperty('--bttv-cell-dx', `${-deltaX}px`);
    cell.style.setProperty('--bttv-cell-dy', `${-deltaY}px`);
  }

  // the copies' texture clocks start at zero, so the phase would jump without this
  const hostAnimations = node.getAnimations();
  if (hostAnimations.length > 0) {
    syncAnimationTimes(hostAnimations, overlay.getAnimations({subtree: true}));
  }

  let backstopTimeout = null;
  let cleanedUp = false;
  function restoreText() {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;
    clearTimeout(backstopTimeout);

    syncAnimationTimes(overlay.getAnimations({subtree: true}), node.getAnimations());

    node.classList.remove(effects.textAnimHost);
    overlay.remove();
    animatingNodes.delete(node);
  }

  // the effect textures loop forever, so the only animationend events are the cells' runs
  let endedAnimations = 0;
  overlay.addEventListener('animationend', function handleHoverEffectAnimationEnd() {
    endedAnimations += 1;
    if (endedAnimations >= slots.length) {
      restoreText();
    }
  });

  // a cancelled run fires no animationend and would strand the host hidden; deadline read off the css
  const runMs = overlay
    .getAnimations({subtree: true})
    .filter((cellAnimation) => cellAnimation.effect?.getComputedTiming().iterations !== Infinity)
    .reduce((longest, cellAnimation) => {
      const {delay, activeDuration} = cellAnimation.effect.getComputedTiming();
      return Math.max(longest, delay + activeDuration);
    }, 0);
  backstopTimeout = setTimeout(restoreText, runMs + CLEANUP_BACKSTOP_MS);

  return true;
}
