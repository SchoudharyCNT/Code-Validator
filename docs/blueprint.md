# **App Name**: CodeCheck AI

## Core Features:

- Code Input: Accept user-provided code snippets via a code editor component.
- Language Selection: Allow users to select the programming language (e.g., JavaScript, Python) from a dropdown menu.
- Category Selection: Allow users to select a validation category (e.g., Security, Performance, Style) from a dropdown menu.
- AI-Powered Validation: Use LangChain and OpenAI to analyze the code snippet against predefined rules and identify violations, formatting the result in markdown.
- Results Display: Display validation results with identified issues, line numbers, and suggested fixes in a clear format with expandable markdown.
- Chat History: Optionally, store chat history (code snippets and AI responses) for context in subsequent validations. The chat history will be incorporated as a tool for the AI to provide more relevant, detailed output. Display of chat history will depend on future implementation plans.
- Rule Management Interface: Implement a rule management interface (create, read, update, delete) for adding/editing validation rules. Each rule will specify the target language, category, a description, and optionally code examples. Enable selection of severity level. Present a sortable, filterable table of existing rules.

## Style Guidelines:

- Primary color: Teal (#26A69A) to evoke a sense of reliability and trustworthiness in the validation process.
- Background color: Very light grayish-teal (#F0F4F3).
- Accent color: A muted, contrasting orange (#FF7043) for attention-grabbing highlights in key areas, like validation results and the submission button.
- Headline font: 'Space Grotesk' (sans-serif) for a clean, tech-forward feel in headers and titles; body font: 'Inter' for easy readability in the results and input fields.
- Code font: 'Source Code Pro' for the display of code snippets and rule examples.
- Use simple, line-based icons from a set like Font Awesome or Material Icons to represent languages, categories, and validation results (e.g., a checkmark for success, an exclamation mark for warnings).
- Subtle animations (e.g., a progress bar or spinner) during the validation process to indicate activity. Smooth transitions when displaying results.
