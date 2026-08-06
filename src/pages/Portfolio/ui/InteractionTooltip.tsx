import { useEffect, useRef } from "react";

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  keyHint: string;
}

export const InteractionTooltip = ({
  getState,
}: {
  getState: () => TooltipState;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const state = getState();
      const el = wrapperRef.current;

      if (!el) {
        raf = requestAnimationFrame(tick);

        return;
      }

      if (state.visible) {
        el.style.display = "block";
        el.style.left = `${state.x}px`;
        el.style.top = `${state.y}px`;

        if (labelRef.current) {
          labelRef.current.textContent = state.label;
        }

        if (keyRef.current) {
          keyRef.current.textContent = state.keyHint;
        }
      } else {
        el.style.display = "none";
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [getState]);

  return (
    <div
      ref={wrapperRef}
      style={{
        display: "none",
        position: "fixed",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 20,
        fontFamily: "'Exo 2', sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          color: "#e2e8f0",
          padding: "6px 16px",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1.5,
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <div ref={labelRef}>3D Snake</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 3,
          }}
        >
          <span
            ref={keyRef}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 24,
              padding: "0 4px",
              height: 24,
              background: "#facc15",
              color: "#1e293b",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            E
          </span>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            Interact
          </span>
        </div>
      </div>
    </div>
  );
};
