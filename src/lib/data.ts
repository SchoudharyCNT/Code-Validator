import type { Language, Category, Subcategory, Rule, AvailableLanguagesAndCategories, RuleSeverity } from './types';

export const mockLanguages: Language[] = [
  { id: 'lang_js', name: 'JavaScript' },
  { id: 'lang_py', name: 'Python' },
  { id: 'lang_java', name: 'Java' },
];

export const mockCategories: Category[] = [
  { id: 'cat_sec_js', name: 'Security', languageId: 'lang_js' },
  { id: 'cat_perf_js', name: 'Performance', languageId: 'lang_js' },
  { id: 'cat_style_js', name: 'Style', languageId: 'lang_js' },
  { id: 'cat_sec_py', name: 'Security', languageId: 'lang_py' },
  { id: 'cat_bp_py', name: 'Best Practices', languageId: 'lang_py' },
];

export const mockSubcategories: Subcategory[] = [
  { id: 'subcat_auth_js', name: 'Authentication', categoryId: 'cat_sec_js' },
  { id: 'subcat_xss_js', name: 'XSS Prevention', categoryId: 'cat_sec_js' },
  { id: 'subcat_loops_py', name: 'Loop Optimization', categoryId: 'cat_bp_py' },
];

export const mockRules: Rule[] = [
  {
    id: 'rule_001',
    languageId: 'lang_js',
    categoryId: 'cat_sec_js',
    subcategoryId: 'subcat_auth_js',
    title: 'Avoid hardcoded credentials',
    description: 'Hardcoding credentials in code can lead to serious security breaches. Use environment variables instead.',
    codeExample: "const password = '123456';",
    severity: 'HIGH' as RuleSeverity,
    validationType: 'Regex',
    validationValue: "password\\s*=\\s*['\\\"](?!{{|process.env|config.)",
  },
  {
    id: 'rule_002',
    languageId: 'lang_js',
    categoryId: 'cat_perf_js',
    title: 'Minimize DOM manipulations',
    description: 'Frequent DOM manipulations can slow down web page performance. Batch updates or use virtual DOM libraries.',
    codeExample: "for (let i = 0; i < 1000; i++) { document.getElementById('el').innerHTML += i; }",
    severity: 'MEDIUM' as RuleSeverity,
    validationType: 'Manual',
    validationValue: '',
  },
  {
    id: 'rule_003',
    languageId: 'lang_py',
    categoryId: 'cat_bp_py',
    title: 'Use list comprehensions for clarity',
    description: 'List comprehensions are often more readable and efficient than explicit for loops for creating lists.',
    codeExample: "squares = []\nfor x in range(10):\n  squares.append(x**2)",
    severity: 'LOW' as RuleSeverity,
    validationType: '',
    validationValue: '',
  },
];

export const mockAvailableLanguagesAndCategories: AvailableLanguagesAndCategories = {
  languages: [
    {
      name: 'JavaScript',
      categories: ['Security', 'Performance', 'Readability', 'Style'],
    },
    {
      name: 'Python',
      categories: ['Security', 'Performance', 'Best Practices', 'Style'],
    },
    {
      name: 'Java',
      categories: ['Security', 'Performance', 'Concurrency', 'Readability'],
    }
  ],
};
