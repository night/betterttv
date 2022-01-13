export default function repositionPopover(htmlElementRef, boundingQuerySelector, topPadding) {
  const popoverElement = htmlElementRef.current;
  if (popoverElement == null) {
    return;
  }

  const chatTextArea = document.querySelector(boundingQuerySelector);
  if (chatTextArea == null) {
    return;
  }

  const {x, y} = chatTextArea.getBoundingClientRect();
  const rightX = x + chatTextArea.offsetWidth;

  const popoverTop = `${y - popoverElement.offsetHeight - topPadding}px`;
  const wantedPopoverLeft = rightX - popoverElement.offsetWidth;
  const popoverLeft = `${wantedPopoverLeft < 0 ? x : wantedPopoverLeft}px`;

  if (popoverTop !== popoverElement.style.top) {
    popoverElement.style.top = popoverTop;
  }
  if (popoverLeft !== popoverElement.style.left) {
    popoverElement.style.left = popoverLeft;
  }
}
