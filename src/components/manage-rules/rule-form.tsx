"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Rule, Language, Category, Subcategory, RuleSeverity } from '@/lib/types';
import { suggestRule, type SuggestRuleOutput } from '@/ai/flows/rule-suggestion';
import { Loader2, Sparkles } from 'lucide-react';

interface RuleFormProps {
  onSubmit: (rule: Rule) => void;
  onCancel: () => void;
  initialData?: Rule | null;
  languages: Language[];
  categories: Category[];
  subcategories: Subcategory[];
}

const defaultRule: Omit<Rule, 'id'> = {
  languageId: '',
  categoryId: '',
  subcategoryId: undefined,
  title: '',
  description: '',
  codeExample: '',
  severity: 'Warning',
};

export function RuleForm({ onSubmit, onCancel, initialData, languages, categories: allCategories, subcategories: allSubcategories }: RuleFormProps) {
  const [rule, setRule] = useState<Omit<Rule, 'id'>>(initialData || defaultRule);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setRule(initialData);
    } else {
      setRule(defaultRule);
    }
  }, [initialData]);

  useEffect(() => {
    if (rule.languageId) {
      setAvailableCategories(allCategories.filter(c => c.languageId === rule.languageId));
      // If current category is not valid for new language, reset it
      if (!allCategories.find(c => c.id === rule.categoryId && c.languageId === rule.languageId)) {
        setRule(prev => ({ ...prev, categoryId: '', subcategoryId: undefined }));
      }
    } else {
      setAvailableCategories([]);
      setRule(prev => ({ ...prev, categoryId: '', subcategoryId: undefined }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule.languageId, allCategories]);

  useEffect(() => {
    if (rule.categoryId) {
      setAvailableSubcategories(allSubcategories.filter(s => s.categoryId === rule.categoryId));
      // If current subcategory is not valid for new category, reset it
       if (rule.subcategoryId && !allSubcategories.find(s => s.id === rule.subcategoryId && s.categoryId === rule.categoryId)) {
        setRule(prev => ({ ...prev, subcategoryId: undefined }));
      }
    } else {
      setAvailableSubcategories([]);
      setRule(prev => ({ ...prev, subcategoryId: undefined }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rule.categoryId, allSubcategories]);


  const handleChange = (field: keyof Omit<Rule, 'id'>, value: string | undefined) => {
    setRule(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!rule.languageId || !rule.categoryId || !rule.title || !rule.description || !rule.severity) {
        toast({ title: "Error", description: "Please fill in all required fields (Language, Category, Title, Description, Severity).", variant: "destructive" });
        return;
    }
    onSubmit(rule as Rule); // Cast to Rule, ID will be handled by parent
  };

  const handleAISuggest = async () => {
    if (!rule.languageId || !rule.categoryId || !rule.codeExample || !rule.description) {
      toast({
        title: "Missing Information",
        description: "Please provide Language, Category, Code Example, and a basic Description to get AI suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const selectedLanguage = languages.find(l => l.id === rule.languageId);
      const selectedCategory = availableCategories.find(c => c.id === rule.categoryId);
      const selectedSubcategory = rule.subcategoryId ? availableSubcategories.find(s => s.id === rule.subcategoryId) : undefined;

      if (!selectedLanguage || !selectedCategory) {
        toast({ title: "Error", description: "Selected language or category not found.", variant: "destructive" });
        setIsSuggesting(false);
        return;
      }

      const suggestionInput = {
        language: selectedLanguage.name,
        category: selectedCategory.name,
        subcategory: selectedSubcategory?.name,
        codeExample: rule.codeExample || '',
        description: rule.description,
      };
      
      const suggestion: SuggestRuleOutput = await suggestRule(suggestionInput);
      
      setRule(prev => ({
        ...prev,
        title: suggestion.title || prev.title,
        description: suggestion.description || prev.description,
        severity: suggestion.severity || prev.severity,
      }));
      toast({ title: "AI Suggestion Applied", description: "Rule details have been updated with AI suggestions." });
    } catch (error) {
      console.error("AI suggestion failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI suggestions.";
      toast({ title: "AI Suggestion Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rule-language">Language *</Label>
          <Select value={rule.languageId} onValueChange={(value) => handleChange('languageId', value)}>
            <SelectTrigger id="rule-language"><SelectValue placeholder="Select language..." /></SelectTrigger>
            <SelectContent>{languages.map(lang => <SelectItem key={lang.id} value={lang.id}>{lang.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rule-category">Category *</Label>
          <Select value={rule.categoryId} onValueChange={(value) => handleChange('categoryId', value)} disabled={!rule.languageId}>
            <SelectTrigger id="rule-category"><SelectValue placeholder="Select category..." /></SelectTrigger>
            <SelectContent>{availableCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="rule-subcategory">Subcategory (Optional)</Label>
        <Select value={rule.subcategoryId} onValueChange={(value) => handleChange('subcategoryId', value)} disabled={!rule.categoryId}>
          <SelectTrigger id="rule-subcategory"><SelectValue placeholder="Select subcategory..." /></SelectTrigger>
          <SelectContent>{availableSubcategories.map(subcat => <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="rule-title">Title *</Label>
        <Input id="rule-title" value={rule.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="e.g., Avoid hardcoded passwords" />
      </div>
      <div>
        <Label htmlFor="rule-description">Description *</Label>
        <Textarea id="rule-description" value={rule.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Explain the rule and its importance..." rows={3} />
      </div>
      <div>
        <Label htmlFor="rule-code-example">Code Example (that violates the rule)</Label>
        <Textarea id="rule-code-example" className="font-code" value={rule.codeExample} onChange={(e) => handleChange('codeExample', e.target.value)} placeholder="const password = 'secret';" rows={4} />
      </div>
      <div>
        <Label htmlFor="rule-severity">Severity *</Label>
        <Select value={rule.severity} onValueChange={(value) => handleChange('severity', value as RuleSeverity)}>
          <SelectTrigger id="rule-severity"><SelectValue placeholder="Select severity..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Error">Error</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleAISuggest} disabled={isSuggesting} className="w-full sm:w-auto">
          {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Suggest with AI
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary/90">{initialData ? 'Update Rule' : 'Save Rule'}</Button>
      </div>
    </form>
  );
}
