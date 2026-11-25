/** Gesture distances are measured in the phone's logical pixels, not the browser's. */
export function phonePoint(clientX: number, clientY: number) {
  const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
  if (!screen) return { x: clientX, y: clientY, width: window.innerWidth, height: window.innerHeight, inside: true };
  const rect = screen.getBoundingClientRect();
  const scale = rect.width / screen.offsetWidth || 1;
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
    width: screen.offsetWidth,
    height: screen.offsetHeight,
    inside: clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom,
  };
}
