import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useUnit } from "effector-react";
import styled from "styled-components";
import { BEACONS, CAMP, CRYSTALS, energyLeft } from "@/lib/expedition";
import { $expedition, $expeditionNotice, $saveAvailable } from "@/stores/expedition/expedition";
import { TownState } from "../lib/state";
import { resetControls } from "../lib/controls";

const Root = styled.div`
  position: fixed; inset: 0; pointer-events: none; z-index: 40;
  color: #f4f0e5; font-family: "Exo 2", sans-serif;
  button { pointer-events: auto; cursor: pointer; font: inherit; color: inherit; border: 1px solid #ffffff30; background: #ffffff0d; border-radius: 8px; padding: 8px 12px; }
  button:hover { background: #ffffff24; }
  button:focus-visible { outline: 2px solid #ffcf82; outline-offset: 3px; }
`;
const Panel = styled.section`
  position: absolute; top: 22px; left: 22px; width: 290px; padding: 20px;
  border: 1px solid #ffffff26; border-radius: 16px; background: rgb(16 32 39 / var(--hud-opacity, .55)); backdrop-filter: blur(6px);
  box-shadow: 0 12px 40px #10232924;
  h1 { font-size: 22px; margin: 5px 0 10px; }
  p { font-size: 13px; line-height: 1.5; margin: 10px 0; color: #cedbd6; }
  small { color: #ffc980; font-size: 10px; letter-spacing: .18em; }
  progress { width: 100%; height: 6px; accent-color: #8de2bd; }
  @media(max-width: 650px) { top: 10px; left: 10px; width: 230px; padding: 12px; h1 { font-size: 18px; } }
`;
const MapPanel = styled.section`
  position: absolute; right: 22px; top: 22px; width: 310px; padding: 20px;
  border: 1px solid #ffffff26; border-radius: 16px; background: rgb(16 32 39 / var(--hud-opacity, .55)); backdrop-filter: blur(6px); pointer-events: auto;
  h2 { font-size: 22px; font-weight: 500; margin: 6px 0 18px; } small { color: #b4d0ca; font-size: 10px; letter-spacing: .2em; }
  p { font-size: 12px; color: #cedbd6; }
  nav { display: grid; gap: 5px; }
  nav button { display: flex; justify-content: space-between; align-items: center; gap: 8px; text-align: left; font-size: 12px; padding: 10px 12px; background: transparent; border-color: transparent; border-bottom-color: #ffffff16; border-radius: 6px; } nav button[aria-pressed="true"] { background: #a9e5cf18; border-color: #bce8d946; } nav em { font-style: normal; font-size: 10px; color: #aed4c4; }
  @media(max-width: 750px) { top: 10px; right: 10px; width: min(300px, calc(100vw - 52px)); max-height: calc(100vh - 100px); overflow: auto; }
`;
const Footer = styled.div`
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  max-width: calc(100vw - 30px); width: max-content; border-radius: 12px; padding: 12px 18px;
  background: rgb(16 32 39 / var(--hud-opacity, .55)); backdrop-filter: blur(6px); text-align: center; font-size: 12px; line-height: 1.8;
  strong { color: #ffce84; } span { color: #cedbd6; }
`;

const PauseLayer = styled.div`
  position: absolute; inset: 0; display: grid; place-items: center; pointer-events: auto;
  background: rgb(7 17 24 / calc(var(--hud-opacity, .55) * .5));
`;
const PauseCard = styled.section`
  width: min(420px, calc(100vw - 40px)); max-height: calc(100dvh - 40px); overflow: auto;
  padding: 30px; border-radius: 22px; border: 1px solid #ffffff35;
  background: rgb(16 32 39 / var(--hud-opacity, .55)); backdrop-filter: blur(8px);
  box-shadow: 0 24px 90px #0003;
  h2 { margin: 7px 0 24px; font-size: 30px; font-weight: 500; }
  h3 { font-size: 12px; font-weight: 500; color: #b7cfc8; margin: 24px 0 12px; letter-spacing: .1em; }
  small { color: #b7cfc8; font-size: 11px; letter-spacing: .2em; }
  label { display: flex; justify-content: space-between; font-size: 14px; }
  input { width: 100%; accent-color: #b7e6d4; margin: 18px 0 0; cursor: pointer; }
  dl { display: grid; grid-template-columns: 110px 1fr; gap: 12px; font-size: 13px; line-height: 1.4; }
  dt { color: #eed3a3; } dd { margin: 0; color: #e1ebe6; }
  > button { width: 100%; margin-top: 20px; padding: 12px; }
`;
const readTransparency = () => {
  try { const raw = localStorage.getItem("portfolio:hud-transparency"); const value = raw === null ? 45 : Number(raw); return Number.isFinite(value) ? Math.max(0, Math.min(85, value)) : 45; }
  catch { return 45; }
};
export const HubHud = ({ state }: { state: TownState }) => {
  const [save, notice, canSave] = useUnit([$expedition, $expeditionNotice, $saveAvailable]);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [transparency, setTransparency] = useState(readTransparency);
  const menuRef = useRef<HTMLElement>(null);
  const [targetId, setTargetId] = useState(BEACONS[0].id);
  const marker = useRef<SVGCircleElement>(null);
  const navigation = useRef<HTMLParagraphElement>(null);
  const prompt = useRef<HTMLDivElement>(null);
  const target = BEACONS.find((beacon) => beacon.id === targetId) ?? BEACONS[0];
  useLayoutEffect(() => {
    state.paused = menuOpen;
    resetControls();
    if (!menuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => { state.paused = false; resetControls(); previous?.focus(); };
  }, [state, menuOpen]);
  useEffect(() => {
    document.documentElement.style.setProperty("--hud-opacity", String(1 - transparency / 100));
    try { localStorage.setItem("portfolio:hud-transparency", String(transparency)); } catch { /* Settings remain usable without storage. */ }
    return () => { document.documentElement.style.removeProperty("--hud-opacity"); };
  }, [transparency]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "Escape") { event.preventDefault(); setMenuOpen((open) => !open); }
      if (event.code === "KeyM" && !state.paused) { event.preventDefault(); setMapOpen((open) => !open); }
      if (event.code === "Tab" && state.paused) {
        const elements = menuRef.current?.querySelectorAll<HTMLElement>("button, input");
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [state]);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const { x, z } = state.player;
      marker.current?.setAttribute("cx", String(Math.max(-105, Math.min(105, x))));
      marker.current?.setAttribute("cy", String(Math.max(-105, Math.min(105, z))));
      const allLit = save.restored.length === BEACONS.length;
      const destination = allLit ? CAMP : target;
      const dx = destination.x - x, dz = destination.z - z;
      const direction = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"][(Math.round(Math.atan2(dx, -dz) / (Math.PI / 4)) + 8) % 8];
      if (navigation.current) navigation.current.textContent = `${destination.name} · ${Math.round(Math.hypot(dx, dz))} м · ${direction}`;
      const nearby = BEACONS.find((beacon) => Math.hypot(beacon.x - x, beacon.z - z) < 4);
      if (prompt.current) prompt.current.textContent = nearby ? (save.restored.includes(nearby.id) ? `${nearby.name} · маяк восстановлен` : `F · Зажечь «${nearby.name}» · 3 энергии`) : Math.hypot(x - CAMP.x, z - CAMP.z) < 4 ? (allLit ? "F · Завершить экспедицию" : "Лагерь · найдите пять маяков") : "Подойдите к парящему кристаллу, чтобы собрать энергию";
      raf = requestAnimationFrame(tick);
    };
    tick(); return () => cancelAnimationFrame(raf);
  }, [state, target, save, mapOpen]);
  return <Root data-hud>
    <Panel aria-label="Журнал экспедиции" style={{ visibility: menuOpen ? "hidden" : "visible" }}>
      <small>ЭКСПЕДИЦИЯ 01 / ОТКРЫТЫЙ МИР</small>
      <h1>Хранители маяков</h1>
      <div>◈ {energyLeft(save)} энергии <span> · </span> {save.restored.length}/5 маяков</div>
      <progress aria-label="Восстановленные маяки" value={save.restored.length} max={5} />
      <p>{save.completed ? "Долина спасена. Продолжайте исследовать мир." : "Собирайте осколки, зажгите пять маяков и вернитесь к огню лагеря."}</p>
      <p ref={navigation} />
      <button onClick={() => setMapOpen((open) => !open)} aria-expanded={mapOpen}>M · {mapOpen ? "Закрыть карту" : "Карта и цели"}</button>
      <button style={{ marginLeft: 6 }} onClick={() => setMenuOpen(true)}>Esc</button>
      <p role="status" aria-live="polite">{notice}</p>
      <small>{canSave ? "ПРОГРЕСС СОХРАНЯЕТСЯ" : "СОХРАНЕНИЕ НЕДОСТУПНО"}</small>
    </Panel>
    {mapOpen && !menuOpen && <MapPanel aria-label="Карта экспедиции">
      <small>ПОЛЕВОЙ АТЛАС / 01</small><h2>Долина маяков</h2>
      <svg viewBox="-115 -115 230 230" role="img" aria-label="Схема маяков и осколков. Север сверху." style={{ width: "100%", background: "rgb(52 97 94 / calc(var(--hud-opacity, .55) * .45))", borderRadius: 100, border: "1px solid #c8e7db30" }}>
        <circle r="96" fill="none" stroke="#c8e7db20" /><circle r="55" fill="none" stroke="#c8e7db15" />
        {[-100, -50, 0, 50, 100].map((n) => <g key={n} stroke="#ffffff10"><path d={`M ${n} -110 V 110 M -110 ${n} H 110`} /></g>)}
        <text x="0" y="-102" fill="#ccdbd2" fontSize="8" textAnchor="middle">СЕВЕР</text>
        {BEACONS.map((b) => <line key={b.id} x1={CAMP.x} y1={CAMP.z} x2={b.x} y2={b.z} stroke={save.restored.includes(b.id) ? b.color : "#ffffff28"} strokeDasharray="3 4" />)}
        {CRYSTALS.filter((c) => !save.collected.includes(c.id)).map((c) => <circle key={c.id} cx={c.x} cy={c.z} r="1.5" fill="#8de2bd" />)}
        <rect x={CAMP.x - 3} y={CAMP.z - 3} width="6" height="6" fill="#ffce84" />
        {BEACONS.map((b, i) => <g key={b.id}><circle cx={b.x} cy={b.z} r={targetId === b.id ? 7 : 5} fill={save.restored.includes(b.id) ? b.color : "#28484d"} stroke={b.color} /><text x={b.x} y={b.z + 2.5} textAnchor="middle" fill="#fff" fontSize="7">{i + 1}</text></g>)}
        <circle ref={marker} r="3" fill="#fff" stroke="#132b31" strokeWidth="1.5" />
      </svg>
      <p>● Вы &nbsp; ◆ Лагерь &nbsp; · Энергия</p>
      <nav aria-label="Выбрать цель">{BEACONS.map((b, index) => <button key={b.id} aria-pressed={targetId === b.id} onClick={() => { setTargetId(b.id); setMapOpen(false); }}><span>{String(index + 1).padStart(2, "0")} &nbsp; {b.name}</span><em>{save.restored.includes(b.id) ? "Зажжён" : save.discovered.includes(b.id) ? "Открыт" : "Сигнал"}</em></button>)}</nav>
    </MapPanel>}
    {!menuOpen && <Footer><div ref={prompt} /></Footer>}
    {menuOpen && <PauseLayer><PauseCard ref={menuRef} role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <small>ХРАНИТЕЛИ МАЯКОВ</small><h2 id="pause-title">Пауза</h2>
      <label htmlFor="hud-transparency">Прозрачность панелей <output>{transparency}%</output></label>
      <input id="hud-transparency" type="range" min="0" max="85" step="5" value={transparency} onChange={(event) => setTransparency(Number(event.target.value))} />
      <h3>УПРАВЛЕНИЕ</h3>
      <dl><dt>WASD / стрелки</dt><dd>Движение и управление машиной</dd><dt>F</dt><dd>Восстановить маяк / завершить экспедицию</dd><dt>M</dt><dd>Открыть карту на ходу</dd><dt>R</dt><dd>Вернуться в лагерь</dd><dt>Escape</dt><dd>Пауза / продолжить</dd></dl>
      <button onClick={() => setMenuOpen(false)}>Продолжить путешествие</button>
    </PauseCard></PauseLayer>}
  </Root>;
};
