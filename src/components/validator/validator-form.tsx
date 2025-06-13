"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle, Info, Loader2, FileText, XCircle } from 'lucide-react';
import { codeValidation, type CodeValidationOutput } from '@/ai/flows/code-validation';
import { mockAvailableLanguagesAndCategories } from '@/lib/data'; // Using mock data for now
import type { AvailableLanguagesAndCategories, LanguageOption } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';

export function ValidatorForm() {
  const [languagesData, setLanguagesData] = useState<AvailableLanguagesAndCategories>(mockAvailableLanguagesAndCategories);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CodeValidationOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedLanguage) {
      const langObj = languagesData.languages.find(l => l.name === selectedLanguage);
      setCategories(langObj ? langObj.categories : []);
      setSelectedCategory(''); // Reset category when language changes
    } else {
      setCategories([]);
    }
  }, [selectedLanguage, languagesData]);

  const handleValidate = async () => {
    if (!selectedLanguage || !selectedCategory || !code) {
      setError('Please select a language, category, and provide code.');
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
      const result = await codeValidation({
        language: selectedLanguage,
        category: selectedCategory,
        code: code,
      });
      setValidationResult(result);
      toast({
        title: "Validation Complete",
        description: "Code analysis finished.",
      });
    } catch (err) {
      console.error('Validation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during validation.';
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
    setSelectedLanguage('');
    setSelectedCategory('');
    setCode('');
    setValidationResult(null);
    setError(null);
    toast({
        title: "Form Cleared",
        description: "All input fields and results have been cleared.",
      });
  };

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
          <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedLanguage}>
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
        <Button onClick={handleValidate} disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Code'
          )}
        </Button>
        <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
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
          <CardContent className="text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {validationResult && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl text-primary">
              <CheckCircle className="h-7 w-7" />
              Validation Results
            </CardTitle>
            <CardDescription>{validationResult.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResult.violations.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {validationResult.violations.map((violation, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="border-border">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 font-medium">
                        {violation.rule.toLowerCase().includes('error') ? <XCircle className="h-5 w-5 text-destructive" /> : 
                         violation.rule.toLowerCase().includes('warning') ? <AlertCircle className="h-5 w-5 text-yellow-500" /> :
                         <Info className="h-5 w-5 text-blue-500" />}
                        <span>{violation.rule} {violation.lineNumbers && violation.lineNumbers.length > 0 ? `(Line: ${violation.lineNumbers.join(', ')})` : ''}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pl-8 text-sm">
                      <p><strong className="text-foreground">Description:</strong> {violation.description}</p>
                      <p><strong className="text-foreground">Suggestion:</strong> {violation.suggestion}</p>
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
