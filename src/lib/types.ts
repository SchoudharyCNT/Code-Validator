export interface Language {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  languageId: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export type RuleSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface Rule {
  id: string;
  languageId: string;
  categoryId: string;
  subcategoryId?: string;
  title: string;
  description: string;
  codeExample?: string;
  severity: RuleSeverity;
  validationType?: string;
  validationValue?: string;
}

// For the validator form dropdowns
export interface LanguageOption {
  name: string;
  categories: string[];
}

export interface AvailableLanguagesAndCategories {
  languages: LanguageOption[];
}
