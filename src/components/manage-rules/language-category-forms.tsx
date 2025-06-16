"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Language, Category, Subcategory } from "@/lib/types";
import { PlusCircle, Trash2, LanguagesIcon, FolderPlus } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:8080/v1";

// --- API actions --- //
const createLanguageAction = async (name: string): Promise<Language> => {
  const res = await fetch(`${BASE_URL}/language`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (res.status === 201) return await res.json();
  const err = await res.json();
  throw new Error(err.message || "Failed to create language.");
};

const deleteLanguageAction = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/language/${id}`, {
    method: "DELETE",
  });
  if (res.status !== 204) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete language.");
  }
};

const fetchLanguages = async (): Promise<Language[]> => {
  const res = await fetch(`${BASE_URL}/language`);
  if (!res.ok) throw new Error("Failed to load languages.");
  return await res.json();
};

const createCategoryAction = async (
  languageId: string,
  name: string
): Promise<Category> => {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ languageId, name }),
  });

  if (res.status === 201) return await res.json();
  const err = await res.json();
  throw new Error(err.message || "Failed to create category.");
};

const deleteCategoryAction = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "DELETE",
  });
  if (res.status !== 204) {
    const err = await res.json();
    throw new Error(err.message || "Failed to delete category.");
  }
};

// --- Component --- //
export function LanguageCategoryForms() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [newLanguageName, setNewLanguageName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedLangForCat, setSelectedLangForCat] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const langs = await fetchLanguages();
        setLanguages(langs);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    })();
  }, []);

  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) {
      toast({
        title: "Error",
        description: "Language name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      const newLang = await createLanguageAction(newLanguageName.trim());
      setLanguages((prev) => [...prev, newLang]);
      setNewLanguageName("");
      toast({
        title: "Success",
        description: `Language "${newLang.name}" added.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    try {
      await deleteLanguageAction(id);
      setLanguages((prev) => prev.filter((lang) => lang.id !== id));

      const relatedCatIds = categories
        .filter((c) => c.languageId === id)
        .map((c) => c.id);

      setCategories((prev) => prev.filter((c) => c.languageId !== id));
      setSubcategories((prev) =>
        prev.filter((s) => !relatedCatIds.includes(s.categoryId))
      );

      toast({
        title: "Deleted",
        description: "Language and related data deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !selectedLangForCat) {
      toast({
        title: "Error",
        description: "Category name and language are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const newCat = await createCategoryAction(
        selectedLangForCat,
        newCategoryName.trim()
      );
      setCategories((prev) => [...prev, newCat]);
      setNewCategoryName("");
      setSelectedLangForCat("");
      toast({
        title: "Success",
        description: `Category "${newCat.name}" added.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategoryAction(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSubcategories((prev) => prev.filter((s) => s.categoryId !== id));
      toast({
        title: "Deleted",
        description: "Category and related subcategories deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Languages */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <LanguagesIcon className="h-6 w-6 text-primary" /> Manage Languages
          </CardTitle>
          <CardDescription>
            Add or remove programming languages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-language">New Language Name</Label>
            <Input
              id="new-language"
              value={newLanguageName}
              onChange={(e) => setNewLanguageName(e.target.value)}
              placeholder="e.g., JavaScript"
            />
          </div>
          <Button
            onClick={handleAddLanguage}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Language
          </Button>
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <span>{lang.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteLanguage(lang.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <FolderPlus className="h-6 w-6 text-primary" /> Manage Categories
          </CardTitle>
          <CardDescription>
            Add categories for specific languages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-language-for-cat">Language</Label>
            <Select
              value={selectedLangForCat}
              onValueChange={setSelectedLangForCat}
            >
              <SelectTrigger id="select-language-for-cat">
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
          <div className="space-y-2">
            <Label htmlFor="new-category">New Category Name</Label>
            <Input
              id="new-category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Security"
            />
          </div>
          <Button
            onClick={handleAddCategory}
            disabled={!selectedLangForCat}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-2 border rounded-md"
              >
                <span>
                  {cat.name} (
                  {languages.find((l) => l.id === cat.languageId)?.name})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
