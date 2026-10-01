"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

type Tone = "milk" | "ink";
const TONES: Record<Tone, { hi: string; mid: string; lo: string }> = {
  milk: { hi: "#ffffff", mid: "#ece9df", lo: "#b9b5a8" },
  ink: { hi: "#58564f", mid: "#1b1b1a", lo: "#000000" },
};

export function Sphere({ size, tone = "ink", style }: { size: number; tone?: Tone; style?: CSSProperties }) {
  const t = TONES[tone];
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 32% 26%, ${t.hi} 0%, ${t.mid} 48%, ${t.lo} 100%)`,
        boxShadow: `0 ${size * 0.35}px ${size * 0.4}px -${size * 0.2}px rgba(10,10,10,.38), inset -${size * 0.06}px -${size * 0.08}px ${size * 0.16}px rgba(0,0,0,.22)`,
        ...style,
      }}
    />
  );
}

export function Ring({ size, tone = "ink", style }: { size: number; tone?: Tone; style?: CSSProperties }) {
  const t = TONES[tone];
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${size * 0.2}px solid ${t.mid}`,
        boxShadow: `inset 0 ${size * 0.04}px ${size * 0.05}px ${t.hi}55, inset 0 -${size * 0.05}px ${size * 0.07}px rgba(0,0,0,.35), 0 ${size * 0.25}px ${size * 0.25}px -${size * 0.12}px rgba(10,10,10,.35)`,
        ...style,
      }}
    />
  );
}

export function Slab({ w, h, tone = "milk", style, rot = 0 }: { w: number; h: number; tone?: Tone; style?: CSSProperties; rot?: number }) {
  const t = TONES[tone];
  return (
    <div
      aria-hidden
      style={{
        width: w,
        height: h,
        borderRadius: h / 2.4,
        transform: `rotate(${rot}deg)`,
        background: `linear-gradient(180deg, ${t.hi} 0%, ${t.mid} 55%, ${t.lo} 100%)`,
        boxShadow: `0 ${h * 0.5}px ${h * 0.6}px -${h * 0.3}px rgba(10,10,10,.35), inset 0 -${h * 0.1}px ${h * 0.2}px rgba(0,0,0,.18)`,
        ...style,
      }}
    />
  );
}

/** A cube you can drag to rotate. Faces are shaded like soft clay. */
export function Cube({ size, tone = "milk", label }: { size: number; tone?: Tone; label?: ReactNode }) {
  const [rot, setRot] = useState({ x: -24, y: 32 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const t = TONES[tone];
  const faces: [string, number][] = [
    ["rotateY(0deg)", 1],
    ["rotateY(90deg)", 0.82],
    ["rotateY(180deg)", 0.7],
    ["rotateY(-90deg)", 0.9],
    ["rotateX(90deg)", 1.08],
    ["rotateX(-90deg)", 0.6],
  ];
  return (
    <div
      role="img"
      aria-label="Draggable 3D cube"
      style={{ width: size, height: size, perspective: size * 4, cursor: "grab", touchAction: "none" }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        drag.current = { x: e.clientX, y: e.clientY };
        setRot((r) => ({ x: r.x - dy * 0.6, y: r.y + dx * 0.6 }));
      }}
      onPointerUp={() => (drag.current = null)}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transition: drag.current ? "none" : "transform .5s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {faces.map(([tf, b], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: size * 0.16,
              transform: `${tf} translateZ(${size / 2}px)`,
              background: `linear-gradient(145deg, ${t.hi}, ${t.mid} 60%, ${t.lo})`,
              filter: `brightness(${b})`,
              boxShadow: `inset 0 0 ${size * 0.12}px rgba(0,0,0,.18)`,
              display: "grid",
              placeItems: "center",
              backfaceVisibility: "hidden",
            }}
          >
            {i === 0 && label}
          </div>
        ))}
      </div>
    </div>
  );
}

type Item = { node: ReactNode; x: string; y: string; depth: number; float?: boolean };

/** A stage that nudges its objects toward the pointer, at different depths. */
export function ClayStage({ items, className = "", children }: { items: Item[]; className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
        ref.current!.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
      }}
      style={{ "--px": 0, "--py": 0 } as CSSProperties}
    >
      {children}
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: it.x,
            top: it.y,
            transform: `translate(calc(var(--px) * ${it.depth}px), calc(var(--py) * ${it.depth}px))`,
            transition: "transform .35s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div className={it.float ? "animate-float" : ""} style={{ animationDelay: `${i * 0.7}s` }}>
            {it.node}
          </div>
        </div>
      ))}
    </div>
  );
}

