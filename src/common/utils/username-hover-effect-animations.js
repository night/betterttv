import classNames from 'classnames';
import effects from '@/common/styles/UsernameEffects.module.css';
import {UsernameHoverEffects, UsernameEffects} from '@/constants';
import {shouldReduceMotion} from './reduced-motion';

// Replays the text as measured per-character cells in an overlay — inline-block letter spans would drop kerning.
// Longer names animate as a single unit instead: at this length the stagger already runs ~890ms
// (duration + 14 steps), and every character past it adds both a cell and another 35ms.
const WHOLE_NAME_CHARACTERS = 15;

// clip window bleed past each character's advance box, so kerned ink overhang survives
const CLIP_PAD_RATIO = 0.75;

// grace past the last animation's end before the backstop assumes the run was interrupted
const CLEANUP_BACKSTOP_MS = 250;

// scripts whose glyphs render identically in isolation; anything else reshapes across characters, so it animates whole
const SAFE_TEXT_PATTERN =
  /^[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Common}\p{Script=Inherited}]*$/u;

// grapheme clusters keep flags, zwj emoji, and combining marks whole; code points are the
// fallback where Intl.Segmenter is missing, since constructing it at module scope would throw
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

// measures each character's kerned slot; null unless the node is a single plain text node
// laid out on one line. long names, and reshaping scripts (arabic joining, indic conjuncts,
// thai stacking) which can't be split without mangling the word, come back as one slot instead
function measureText(node) {
  const textNode = node.firstChild;
  if (node.childNodes.length !== 1 || textNode?.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const text = textNode.textContent;
  if (text.length === 0) {
    return null;
  }

  // one rect per line box, so anything but a single rect means the name wrapped and the slots
  // would be measured against a box that spans both lines
  const rects = node.getClientRects();
  if (rects.length !== 1) {
    return null;
  }

  const baseRect = rects[0];
  const characters = splitGraphemes(text);
  const range = document.createRange();

  if (characters.length > WHOLE_NAME_CHARACTERS || !SAFE_TEXT_PATTERN.test(text)) {
    // the whole name is one slot, measured off the text rather than the element box: the two
    // differ on scripts that draw outside their line box, and the box would land the copy a
    // pixel off the real text
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

// copies animation clocks by name so the effect textures stay in phase across the swaps
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
  // the overlay takes over the host's filter for the run — see .textAnimHost in the stylesheet
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

  // visibility-only hide: the text node never moves, so the platform's react can touch it freely
  node.classList.add(effects.textAnimHost);
  node.appendChild(overlay);

  // isolated copies can land a hair off their slot; measure the residuals and counter them (reads then writes, one layout)
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

  // the copies' texture clocks start at zero; sync them to the host's so the phase never jumps
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

    // hand the phase back so the swap out is as continuous as the swap in
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

  // backstop for a run that never finishes: a cancelled animation (a display:none ancestor, a
  // detached node) fires no animationend, which would leave the host hidden. the deadline comes
  // from the animations themselves so the stylesheet stays the only place timing is defined
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
