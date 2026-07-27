# General Context

## Project Overview
This project is a personal portfolio website built with React, Vite, and Effector for state management. It features highly interactive elements, including a Windows-like desktop environment and various landing pages.

## Core Technologies
- **Framework**: React
- **Build Tool**: Vite
- **State Management**: Effector
- **Styling**: `styled-components` with a centralized theme system.
- **Routing**: Custom router implementation in `src/lib/router.tsx`.
- **UI Library**: Ant Design (used for components like `Button`, `Tooltip`, `Spin`).

## Architecture
The project follows a modular structure based on Feature-Sliced Design (FSD) principles. **Strict adherence to the current folder structure and hierarchy is mandatory.**

- `src/components`: Feature-specific components (e.g., `Welcome`, `WindowsClone`).
- `src/pages`: Page-level components that compose widgets and components (e.g., `Main`, `Interactive`).
- `src/shared`: Reusable, atomic components (e.g., `Button`, `Paragraph`, `Link`).
- `src/widgets`: Large, composite components (e.g., `Header`).
- `src/stores`: Effector stores for application state management.
- `src/lib`: Core utilities, constants, configuration, theme, global styles, and routing.
- `src/declarations`: TypeScript type declarations.

## Component Pattern
To maintain consistency, every component follows this structure:
- `[component_name]/`
    - `index.ts`: Re-exports the component from the `ui` directory.
    - `ui/`: Contains the main component markup and logic.
    - `lib/`: Contains component-specific files (e.g., `[component_name].styles.ts`, `constants.ts`, `utils.ts`).

**Rules for `lib/` directory:**
- Files are placed in the component's `lib` folder ONLY if they are used exclusively by that component.
- If a file in `lib` is imported by other components, it must be moved to a `lib` folder at the highest common level shared by those components.
