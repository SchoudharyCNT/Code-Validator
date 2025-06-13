
'use server';

/**
 * @fileOverview Code validation flow using Genkit and a language model.
 *
 * - codeValidation - A function that validates code snippets.
 * - CodeValidationInput - The input type for the codeValidation function.
 * - CodeValidationOutput - The return type for the codeValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeValidationInputSchema = z.object({
  language: z.string().describe('The programming language of the code snippet.'),
  category: z.string().describe('The validation category (e.g., Security, Performance, Style).'),
  code: z.string().describe('The code snippet to validate.'),
});
export type CodeValidationInput = z.infer<typeof CodeValidationInputSchema>;

const CodeValidationOutputSchema = z.object({
  summary: z.string().describe('A summary of the validation results.'),
  violations: z
    .array(z.object({
      rule: z.string().describe('The rule that was violated.'),
      description: z.string().describe('A description of the violation.'),
      suggestion: z.string().describe('A suggestion for fixing the violation.'),
      lineNumbers: z.array(z.number()).optional().describe('The line numbers where the violation occurred.'),
    }))
    .describe('A list of violations found in the code snippet.'),
  rawOutput: z.string().optional().describe('The raw output from the language model.'),
});
export type CodeValidationOutput = z.infer<typeof CodeValidationOutputSchema>;

export async function codeValidation(input: CodeValidationInput): Promise<CodeValidationOutput> {
  return codeValidationFlow(input);
}

const codeValidationPrompt = ai.definePrompt({
  name: 'codeValidationPrompt',
  input: {schema: CodeValidationInputSchema},
  output: {schema: CodeValidationOutputSchema},
  prompt: `You are a code validation expert.

You will receive a code snippet, a programming language, and a validation category.
Your task is to analyze the code snippet and identify any violations of the rules and best practices associated with the given category.

Language: {{{language}}}
Category: {{{category}}}
Code:
\`\`\` {{{language}}}\`\`\`
{{{code}}}
\`\`\`

Provide a summary of the validation results and a list of violations found, including the rule violated, a description of the violation, and suggestions for fixing it. Include line numbers if applicable.

Ensure that the output is formatted as a JSON object that matches the CodeValidationOutputSchema schema. The Zod descriptions in the schema MUST be followed.
`,
});

const codeValidationFlow = ai.defineFlow(
  {
    name: 'codeValidationFlow',
    inputSchema: CodeValidationInputSchema,
    outputSchema: CodeValidationOutputSchema,
  },
  async input => {
    const {output} = await codeValidationPrompt(input);
    return output!;
  }
);
