import { model } from "./config.mjs";
import { runOpencode, parseLastText } from "./generator.mjs";
import { ROOT } from "./config.mjs";

const extractJson = (text) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start < 0 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
};

export const judge = ({
  before,
  after,
  element,
  rubric,
  timeoutMs = 5 * 60 * 1000,
}) => {
  const prompt = [
    "You are a strict art director scoring a 3D voxel scene.",
    `Element under review: ${element}.`,
    "Compare the two attached screenshots: the FIRST is BEFORE, the SECOND is AFTER.",
    "Rubric criteria:",
    rubric,
    "Return ONLY a JSON object, no prose, in this exact shape:",
    '{"score": <0-10 integer>, "criteria": {"<name>": <0-10 integer>}, "notes": "<short>"}',
    `Score the AFTER image against the rubric. Target is >= 8/10.`,
  ].join("\n");

  const args = [
    "run",
    prompt,
    "--model",
    model,
    "--format",
    "json",
    "--file",
    before,
    "--file",
    after,
  ];

  const result = runOpencode(args, { cwd: ROOT, timeoutMs });
  const text = parseLastText(result.output);
  const parsed = extractJson(text);

  return {
    ok: Boolean(parsed),
    element,
    score: parsed?.score ?? null,
    criteria: parsed?.criteria ?? null,
    notes: parsed?.notes ?? "",
    before,
    after,
    raw: text,
  };
};
