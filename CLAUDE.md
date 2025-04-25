# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` - Run development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Code Style Guidelines

- **Formatting**: Follow NextJS/React conventions with proper indentation
- **Imports**: Group imports by 1) React/Next, 2) External libraries, 3) Internal components/utils
- **Types**: Use TypeScript with strict type checking. Prefer interfaces for object types
- **Naming**:
  - React components: PascalCase
  - Functions/variables: camelCase
  - Files: kebab-case for pages, PascalCase for components
- **Components**: Create reusable components in app/components directory
- **Error Handling**: Use try/catch for API calls with appropriate error messages
- **Supabase**: Use the client from app/lib/supabase for client-side calls
- **CSS**: Use Tailwind CSS for styling with appropriate class naming

## Project Structure

- App Router pattern with layout.tsx for shared layouts
- API routes in app/api directory
- UI components in app/components directory
- Utilities and types in app/lib directory
