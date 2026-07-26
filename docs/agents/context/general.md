# General Context

## Project Overview
This project is a personal portfolio website built with React, Vite, and Effector for state management. It features highly interactive elements, including a Windows-like desktop environment and various landing pages.

## Core Technologies
- **Framework**: React
- **Build Tool**: Vite
- **State Management**: Effector
- **Styling**: Custom CSS-in-JS / styled-components (based on `styles.ts` patterns) and potentially Ant Design.
- **Routing**: Custom router implementation in `src/lib/router.tsx`.

## Architecture
The project follows a modular structure:
- `src/components`: Feature-specific components.
- `src/pages`: Page-level components.
- `src/shared`: Reusable, atomic components.
- `src/widgets`: Large, composite components.
- `src/stores`: Effector stores for application state.
- `src/lib`: Core utilities, constants, and configuration.
- `src/declarations`: TypeScript type declarations.
