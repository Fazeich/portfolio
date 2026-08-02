# Agent Context Management

## Important Instructions

- **Selective Context Usage**: DO NOT use the entire context for every task. Use ONLY the specific context files that are relevant to the current task to avoid token overflow and maintain focus.
- **Synchronized Updates**: Every time code is modified, the corresponding context files MUST be updated immediately.
    - If a component/utility/theme object is **added**, add its description and path to the relevant context file.
    - If a component/utility/theme object is **edited**, update its description in the relevant context file.
    - If a component/utility/theme object is **deleted**, remove its entry from the relevant context file.
- **Path Requirements**: Every entry in the context files must include the directory path where the file/component is located.
- **Be concise in reasoning**: Keep reasoning brief and focused.
- **Be concise in answers**: Keep answers direct and concise.
- **Folder Structure Adherence**: Always follow the current folder structure.

## Context Structure

1. **General Context** (`docs/agents/context/general.md`):
   - Abstract overview of the project.
   - High-level architectural decisions.
   - General project purpose and goals.

2. **Component Context** (`docs/agents/context/components.md`):
   - Detailed descriptions of all UI/logic components.
   - Includes directory paths.

3. **Utility Context** (`docs/agents/context/utilities.md`):
   - Descriptions of all helper functions, services, and utilities.
   - Includes directory paths.

4. **Theme Context** (`docs/agents/context/theme.md`):
   - Description of the current styling/theming system, design tokens, and theme-related objects.
   - Includes directory paths.

## Project Conventions

- **`src/lib`** holds shared code (types, utils, hooks, physics, world, styles, theme, constants) imported by 2+ components.
- Each component may have its own `lib/` folder with files used exclusively by that component. If a file inside a component's `lib/` is imported elsewhere, it must be moved to the common `src/lib`.
- Fast-changing game state lives in mutable refs (never in React state). Discrete events (score, HP, phase, boost) flow through Effector.
- Before finishing any task, verify with `npm run lint`, `npm run typecheck`, and `npm run build`.
