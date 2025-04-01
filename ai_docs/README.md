# AI Documentation

This directory serves as an AI-optimized knowledge base for the Student Points Tracker project. It's designed to help AI agents understand and work with the codebase more effectively while remaining human-readable.

## Structure

- `/concepts` - Core concepts and domain knowledge
- `/architecture` - System architecture and technical decisions
- `/decisions` - Project decisions and their rationale

## Purpose

This directory acts as an encyclopedia for the project, containing:
- Important concepts and their relationships
- Architectural decisions and patterns
- Project-specific terminology
- AI agent notes and observations
- Reference points for different parts of the application

## Usage

### For AI Agents
- Use this directory as the primary source of project knowledge
- Reference relevant files when making changes or suggestions
- Add notes when discovering useful patterns or concepts
- Update existing documentation when making significant changes
- Add comments to track when and why documentation was modified
- Fix any inconsistencies you find in the documentation
- Add new documentation for features or patterns you discover
- Include code examples when they would be helpful
- Cross-reference related concepts to maintain documentation coherence

### For Humans
- Use as a reference for understanding the project
- Maintain documentation when making architectural changes
- Add context to complex decisions
- Track project evolution

## Maintenance

1. Keep documentation up to date with code changes
2. Add new concepts as they emerge
3. Document architectural decisions when made
4. Include examples where helpful
5. Cross-reference related concepts
6. Add timestamps to significant updates
7. Add comments explaining why changes were made
8. Fix any inconsistencies or outdated information
9. Ensure all code examples are current and working

## File Naming Convention

- Use kebab-case for filenames
- Include category prefix (e.g., `concept-`, `arch-`, `decision-`)
- Add date suffix for versioned documents (e.g., `-2024-04-01`)

## Example Structure

```
ai_docs/
├── concepts/
│   ├── concept-points-system.md
│   └── concept-student-roles.md
├── architecture/
│   ├── arch-data-flow.md
│   └── arch-state-management.md
└── decisions/
    ├── decision-vite-migration.md
    └── decision-testing-framework.md
```

## Documentation Comments

When making changes to documentation, include a comment block at the top of the file:

```markdown
<!--
Last Updated: YYYY-MM-DD
Updated By: [AI Agent Name/ID]
Changes Made:
- Change 1
- Change 2
- Change 3
Reason for Changes:
[Brief explanation of why changes were needed]
-->
```

This helps track the evolution of the documentation and provides context for future updates. 