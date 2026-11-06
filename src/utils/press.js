export default function isPressOn(element, {clientX, clientY}) {
  const rect = element?.getBoundingClientRect();
  return rect != null && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}
