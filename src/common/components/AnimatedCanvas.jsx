import {useDocumentVisibility} from '@mantine/hooks';
import {useInView} from 'framer-motion';
import React, {useRef} from 'react';

const CANVAS_WIDTH = 16;
const CANVAS_HEIGHT = 16;

const FRAME_RATE = 60;
const FRAME_INTERVAL = 1000 / FRAME_RATE;

export default function AnimatedCanvas({width = CANVAS_WIDTH, height = CANVAS_HEIGHT, className, ...props}) {
  const ref = useRef(null);
  const timeRef = React.useRef(Math.random() * 1000);
  const documentState = useDocumentVisibility();
  const isVisible = useInView(ref);

  React.useEffect(() => {
    if (ref.current == null || documentState !== 'visible' || !isVisible) {
      return;
    }

    const context = ref.current.getContext('2d');
    if (context == null) {
      return;
    }

    const imageData = context.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

    function drawAnimatedImage() {
      if (ref.current == null || context == null || timeRef.current == null) {
        return;
      }

      const t = timeRef.current;
      const cosT = Math.cos(t / 4);
      const sinT = Math.sin(t / 3);
      const innerSin = Math.sin(t / 9);

      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const x2 = x * x;
        const dx = x - 100;

        for (let y = 0; y < CANVAS_HEIGHT; y++) {
          const index = (x + y * CANVAS_WIDTH) * 4;

          const y2 = y * y;
          const dy = y - 100;
          const distSq = dx * dx + dy * dy;

          const red = Math.floor(200 + 127 * Math.sin((x2 - y2) / 300 + t));
          const green = Math.floor(32 + 120 * Math.sin((x2 * cosT + y2 * sinT) / 300));
          const blue = Math.floor(192 + 63 * Math.sin(5 * innerSin + distSq / 1100));

          imageData.data[index] = red; // Red channel
          imageData.data[index + 1] = green; // Green channel
          imageData.data[index + 2] = blue; // Blue channel
          imageData.data[index + 3] = 196; // Alpha channel
        }
      }

      context.putImageData(imageData, 0, 0);
      timeRef.current = t + 0.01;
    }

    const requestDrawAnimatedImage = () => window.requestAnimationFrame(drawAnimatedImage);
    const interval = setInterval(() => requestDrawAnimatedImage(), FRAME_INTERVAL);
    return () => clearInterval(interval);
  }, [documentState, isVisible, ref]);

  return <canvas width={width} height={height} ref={ref} className={className} {...props} />;
}
