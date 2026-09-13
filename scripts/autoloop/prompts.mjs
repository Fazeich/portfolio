export const artDirection = `
# Art Direction — Voxel Open World (autoloop)

Цель: каждый элемент карты >= 8/10 по рубрике. Стиль — воксельный, low-poly, яркий
"diorman", консистентный с текущими моделями персонажа и машины.

Разрешено концептуально: открытый бесконечный процедурный террейн, явные биомы,
снятие забора, случайные пьедесталы с существующими мини-играми.

Запрещено: внешние GLTF-ассеты, тяжёлые текстуры-файлы; только процедурная генерация.
`;

export const rubric = `
- silhouette: читаемость формы и контраст относительно фона (0-10)
- material: разнообразие и уместность материалов, отсутствие "пластиковости" (0-10)
- texture-detail: surface-детализация, absence of flat untextured faces (0-10)
- lighting-response: как элемент реагирует на свет/тени (0-10)
- biome-consistency: согласованность с биомом и соседними элементами (0-10)
- performance: элемент не ломает бюджет draw calls / triangles (0-10)
`;

export const implementPrompt = ({ task, element, constraints }) => {
  return [
    "Ты — автономный разработчик в autoloop-цикле проекта portfolio (React + Vite + Three).",
    "Соблюдай строго AGENTS.md и структуру FSD. Обновляй context-доки при изменениях.",
    "Не добавляй внешние ассеты (GLTF/текстуры-файлы) — только процедурная генерация.",
    "",
    `Задача: ${task.id} :: ${task.text}`,
    element ? `Элемент карты: ${element}` : "",
    constraints ? `Ограничения: ${constraints}` : "",
    "",
    "DoD:",
    "- изменения только в рамках задачи; никакого легаси; shared-код в src/lib;",
    "- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` должны проходить;",
    "- не ломать perf-бюджет (60/45 FPS, <=300 draw calls, <=150k tris);",
    "- обновить соответствующие docs/agents/context/*.",
    "",
    "В конце дай короткое резюме изменений.",
  ]
    .filter(Boolean)
    .join("\n");
};

export const plannerPrompt = ({ context, gitLog }) => {
  return [
    "Ты планируешь следующие улучшения карты (воксельный открытый мир) для autoloop.",
    "Верни СТРОГО JSON-массив из 3 задач вида:",
    '[{"id":"PP-###","text":"краткая задача с DoD"}]',
    "Задачи должны быть маленькими, проверяемыми и не дублировать уже сделанное.",
    "",
    "Контекст:",
    context,
    "",
    "Последние коммиты:",
    gitLog,
  ].join("\n");
};
