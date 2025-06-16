"use server";

/**
 * @fileOverview Rule suggestion AI agent.
 *
 * - suggestRule - A function that handles the rule suggestion process.
 * - SuggestRuleInput - The input type for the suggestRule function.
 * - SuggestRuleOutput - The return type for the suggestRule function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SuggestRuleInputSchema = z.object({
  language: z.string().describe("The programming language for the rule."),
  category: z
    .string()
    .describe("The category of the rule (e.g., Security, Performance)."),
  subcategory: z
    .string()
    .optional()
    .describe("The subcategory of the rule (optional)."),
  codeExample: z
    .string()
    .describe("An example of code that violates the rule."),
  description: z
    .string()
    .describe("A description of the desired behavior or coding practice."),
});
export type SuggestRuleInput = z.infer<typeof SuggestRuleInputSchema>;

const SuggestRuleOutputSchema = z.object({
  title: z.string().describe("The suggested title for the rule."),
  description: z
    .string()
    .describe("The suggested detailed description for the rule."),
  severity: z
    .enum(["HIGH", "MEDIUM", "LOW"])
    .describe("The severity level of the rule."),
});
export type SuggestRuleOutput = z.infer<typeof SuggestRuleOutputSchema>;

export async function suggestRule(
  input: SuggestRuleInput,
): Promise<SuggestRuleOutput> {
  return suggestRuleFlow(input);
}

const prompt = ai.definePrompt({
  name: "suggestRulePrompt",
  input: { schema: SuggestRuleInputSchema },
  output: { schema: SuggestRuleOutputSchema },
  prompt: `You are an AI assistant helping to generate code validation rules.

  Based on the provided code example, description of desired coding practice, programming language, and category, suggest a title, a detailed description, and a severity level for a new code validation rule.

  Language: {{{language}}}
  Category: {{{category}}}
  Subcategory: {{{subcategory}}}
  Code Example: {{{codeExample}}}
  Description of Desired Behavior: {{{description}}}

  Ensure that the title is concise and informative. The description should clearly explain the rule and the potential consequences of violating it. The severity level should reflect the impact of violating the rule (Error, Warning, or Info).`,
});

const suggestRuleFlow = ai.defineFlow(
  {
    name: "suggestRuleFlow",
    inputSchema: SuggestRuleInputSchema,
    outputSchema: SuggestRuleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  },
);
