
"use client";

import type { FormEvent } from "react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Rule, Language, Category, RuleSeverity } from "@/lib/types";
import {
  suggestRule,
  type SuggestRuleOutput,
} from "@/ai/flows/rule-suggestion";
import { Loader2, Sparkles } from "lucide-react";

interface RuleFormProps {
  onSubmit: (rule: Omit<Rule, "id"> | Rule) => void;
  onCancel: () => void;
  initialData?: Rule | null;
  languages: Language[];
  categories: Category[];
}

const defaultRule: Omit<Rule, "id"> = {
  languageId: "",
  categoryId: "",
  title: "",
  description: "",
  codeExample: "",
  severity: "MEDIUM",
  validationType: "",
  validationValue: "",
};

export const RuleForm = ({
  onSubmit,
  onCancel,
  initialData,
  languages,
  categories: allCategories,
}: RuleFormProps) => {
  const [rule, setRule] = useState<Omit<Rule, "id"> | Rule>(() => {
    const base = initialData ? { ...defaultRule, ...initialData } : { ...defaultRule };
    return {
      ...base,
      validationType: initialData?.validationType || "",
      validationValue: initialData?.validationValue || "",
    };
  });
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const base = initialData ? { ...defaultRule, ...initialData } : { ...defaultRule };
    setRule({
        ...base,
        validationType: initialData?.validationType || "",
        validationValue: initialData?.validationValue || ""
    });
  }, [initialData]);

  useEffect(() => {
    if (rule.languageId) {
      const filtered = allCategories.filter(
        (c) => c.languageId === rule.languageId
      );
      setAvailableCategories(filtered);
      if (rule.categoryId && !filtered.some((c) => c.id === rule.categoryId)) {
        setRule((prev) => ({ ...prev, categoryId: "" }));
      }
    } else {
      setAvailableCategories([]);
      setRule((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [rule.languageId, rule.categoryId, allCategories]);


  const handleChange = (
    field: keyof Rule, 
    value: string | RuleSeverity
  ) => {
    setRule((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { languageId, categoryId, title, description, severity } = rule;
    if (!languageId || !categoryId || !title || !description || !severity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    onSubmit(rule);
  };

  const handleAISuggest = async () => {
    if (
      !rule.languageId ||
      !rule.categoryId ||
      !rule.codeExample ||
      !rule.description
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please provide Language, Category, Code Example, and Description for AI suggestions.",
        variant: "destructive",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const selectedLanguage = languages.find((l) => l.id === rule.languageId);
      const selectedCategory = allCategories.find(
        (c) => c.id === rule.categoryId
      );

      if (!selectedLanguage || !selectedCategory) {
        toast({
          title: "Error",
          description: "Selected language or category not found.",
          variant: "destructive",
        });
        setIsSuggesting(false);
        return;
      }

      const suggestionInput = {
        language: selectedLanguage.name,
        category: selectedCategory.name,
        codeExample: rule.codeExample || "",
        description: rule.description,
      };

      const suggestion: SuggestRuleOutput = await suggestRule(suggestionInput);

      setRule((prev) => ({
        ...prev,
        title: suggestion.title || prev.title,
        description: suggestion.description || prev.description,
        severity: suggestion.severity || prev.severity,
      }));

      toast({
        title: "AI Suggestion Applied",
        description: "Rule details have been updated with AI suggestions.",
      });
    } catch (error) {
      console.error("AI suggestion failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get AI suggestions.";
      toast({
        title: "AI Suggestion Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rule-language">Language *</Label>
          <Select
            value={rule.languageId}
            onValueChange={(value) => handleChange("languageId", value)}
          >
            <SelectTrigger id="rule-language">
              <SelectValue placeholder="Select language..." />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rule-category">Category *</Label>
          <Select
            value={rule.categoryId}
            onValueChange={(value) => handleChange("categoryId", value)}
            disabled={!rule.languageId || availableCategories.length === 0}
          >
            <SelectTrigger id="rule-category">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="rule-title">Title *</Label>
        <Input
          id="rule-title"
          value={rule.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g., Avoid hardcoded passwords"
        />
      </div>

      <div>
        <Label htmlFor="rule-description">Description *</Label>
        <Textarea
          id="rule-description"
          value={rule.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Explain the rule and its importance..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="rule-code-example">Code Example (optional)</Label>
        <Textarea
          id="rule-code-example"
          className="font-code"
          value={rule.codeExample || ""}
          onChange={(e) => handleChange("codeExample", e.target.value)}
          placeholder="const password = 'secret';"
          rows={4}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rule-validation-type">Validation Type (optional)</Label>
          <Input
            id="rule-validation-type"
            value={rule.validationType || ""}
            onChange={(e) => handleChange("validationType", e.target.value)}
            placeholder="e.g., Regex, AST_Selector"
          />
        </div>
        <div>
          <Label htmlFor="rule-validation-value">Validation Value (optional)</Label>
          <Input
            id="rule-validation-value"
            value={rule.validationValue || ""}
            onChange={(e) => handleChange("validationValue", e.target.value)}
            placeholder="e.g., /password\\s*=\\s*['\"].*['\"]/"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rule-severity">Severity *</Label>
        <Select
          value={rule.severity}
          onValueChange={(value) =>
            handleChange("severity", value as RuleSeverity)
          }
        >
          <SelectTrigger id="rule-severity">
            <SelectValue placeholder="Select severity..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HIGH">HIGH</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="LOW">LOW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleAISuggest}
          disabled={isSuggesting}
          className="w-full sm:w-auto"
        >
          {isSuggesting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Suggest with AI
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          {initialData ? "Update Rule" : "Save Rule"}
        </Button>
      </div>
    </form>
  );
};
