import { keyframes } from "@emotion/react";

export const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export const fadeUp = keyframes`
  from { opacity: 0; transform: translate3d(0, 28px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

export const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translate3d(0, 24px, 0); }
  to { opacity: 1; transform: scale(1) translate3d(0, 0, 0); }
`;

export const auroraDrift = keyframes`
  0% { transform: translate3d(0, 0, 0) scale(1); }
  33% { transform: translate3d(7%, -9%, 0) scale(1.16); }
  66% { transform: translate3d(-9%, 7%, 0) scale(0.94); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
`;

export const slowSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

export const pulseGlow = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.75); }
`;

export const ringPulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1.05); }
`;

export const headlinePan = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

export const reducedMotion = {
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none !important",
    transition: "none !important",
  },
} as const;

export const entrance = (delay = 0, duration = 750) => ({
  animation: `${fadeUp} ${duration}ms ${EASE} ${delay}ms both`,
});
