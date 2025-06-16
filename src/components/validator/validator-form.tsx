"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  FileText,
  XCircle,
} from "lucide-react";
import {
  codeValidation,
  type CodeValidationOutput,
} from "@/ai/flows/code-validation";
import type {
  AvailableLanguagesAndCategories,
  LanguageOption,
} from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:8080/v1";

export function ValidatorForm() {
  const [languagesData, setLanguagesData] =
    useState<AvailableLanguagesAndCategories>({
      languages: [],
    });
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [validationResult, setValidationResult] =
    useState<CodeValidationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLanguagesAndCategories = async () => {
      setIsLoadingMeta(true);
      try {
        const [languagesRes, categoriesRes] = await Promise.all([
          fetch(`${BASE_URL}/language`),
          fetch(`${BASE_URL}/categories`),
        ]);

        if (!languagesRes.ok || !categoriesRes.ok) {
          throw new Error("Failed to load languages or categories");
        }

        const languages = await languagesRes.json();
        const categories = await categoriesRes.json();

        const languagesWithCategories = languages.map((lang: any) => ({
          ...lang,
          categories: categories
            .filter((cat: any) => cat.languageId === lang.id)
            .map((cat: any) => cat.name),
        }));

        setLanguagesData({ languages: languagesWithCategories });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Unable to load metadata.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMeta(false);
      }
    };

    fetchLanguagesAndCategories();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      const langObj = languagesData.languages.find(
        (l) => l.name === selectedLanguage
      );
      setCategories(langObj ? langObj.categories : []);
      setSelectedCategory("");
    } else {
      setCategories([]);
    }
  }, [selectedLanguage, languagesData]);

  const handleValidate = async () => {
    if (!selectedLanguage || !selectedCategory || !code) {
      setError("Please select a language, category, and provide code.");
      toast({
        title: "Validation Error",
        description: "Please select a language, category, and provide code.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setIsLoading(true);
    setValidationResult(null);

    try {
      const res = await fetch(`${BASE_URL}/code/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          category: selectedCategory,
          code,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Validation failed.");
      }

      const raw = await res.text();

      // ✅ Step 1: Extract content inside ```json ... ```
      const match = raw.match(/```json\s*([\s\S]*?)\s*```/);
      if (!match) {
        throw new Error("Could not parse validator response. Invalid format.");
      }

      // ✅ Step 2: Unescape JSON string (remove \\n, \\" etc.)
      const unescapedJson = match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\t/g, "\t");

      // ✅ Step 3: Parse it into real JSON
      const parsed = JSON.parse(unescapedJson);

      setValidationResult(parsed);

      toast({
        title: parsed.passed ? "Code Passed Validation" : "Validation Complete",
        description: parsed.summary || "Validation finished.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during validation.";
      setError(errorMessage);
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedLanguage("");
    setSelectedCategory("");
    setCode("");
    setValidationResult(null);
    setError(null);
    toast({
      title: "Form Cleared",
      description: "All input fields and results have been cleared.",
    });
  };

  if (isLoadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading languages and categories...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="language-select">Programming Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger id="language-select" className="w-full">
              <SelectValue placeholder="Select language..." />
            </SelectTrigger>
            <SelectContent>
              {languagesData.languages.map((lang) => (
                <SelectItem key={lang.name} value={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category-select">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            disabled={!selectedLanguage}
          >
            <SelectTrigger id="category-select" className="w-full">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="code-input">Code Editor</Label>
        <Textarea
          id="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="min-h-[200px] font-code text-sm bg-background border-input focus:border-primary"
          rows={15}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleValidate}
          disabled={isLoading}
          className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            "Validate Code"
          )}
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Clear Form
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive font-headline">
              <XCircle className="h-5 w-5" />
              Validation Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-destructive">{error}</CardContent>
        </Card>
      )}

      {validationResult && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl text-primary">
              <CheckCircle className="h-7 w-7" />
              Validation Results
            </CardTitle>
            {validationResult.summary && validationResult.summary.trim() !== "" && (
              <CardDescription>{validationResult.summary}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.violations.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {validationResult.violations.map((violation, index) => (
                  <AccordionItem
                    value={`item-${index}`}
                    key={index}
                    className="border-border"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 font-medium">
                        {violation.rule.toLowerCase().includes("error") ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : violation.rule.toLowerCase().includes("warning") ? (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-500" />
                        )}
                        <span>
                          {violation.rule}
                          {violation.lineNumbers &&
                          violation.lineNumbers.length > 0
                            ? ` (Line: ${violation.lineNumbers.join(", ")})`
                            : ""}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pl-8 text-sm">
                      {violation.description && violation.description.trim() !== "" && (
                        <p>
                          <strong className="text-foreground">
                            Description:
                          </strong>{" "}
                          {violation.description}
                        </p>
                      )}
                      {violation.suggestion && violation.suggestion.trim() !== "" && (
                        <p>
                          <strong className="text-foreground">
                            Suggestion:
                          </strong>{" "}
                          {violation.suggestion}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                No violations found. Great job!
              </p>
            )}

            {validationResult.rawOutput && (
              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="raw-output" className="border-border">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 font-medium">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      Raw AI Output
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none dark:prose-invert p-4 bg-muted/50 rounded-md max-h-96 overflow-y-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {validationResult.rawOutput}
                    </ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
