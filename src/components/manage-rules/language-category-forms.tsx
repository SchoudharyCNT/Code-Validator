"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Language, Category, Subcategory } from '@/lib/types';
import { mockLanguages, mockCategories, mockSubcategories } from '@/lib/data'; // Using mock data
import { PlusCircle, Trash2, LanguagesIcon, FolderPlus, ShapesIcon } from 'lucide-react';

// Mock server actions (replace with actual server actions later)
const createLanguageAction = async (name: string): Promise<Language> => {
  console.log("Creating language:", name);
  const newLang = { id: `lang_${Date.now()}`, name };
  // In a real app, this would interact with a backend.
  // For mock, we'll just return it and expect the component to update its state.
  return newLang;
};

const createCategoryAction = async (languageId: string, name: string): Promise<Category> => {
  console.log("Creating category:", name, "for lang:", languageId);
  const newCat = { id: `cat_${Date.now()}`, name, languageId };
  return newCat;
};

const createSubcategoryAction = async (categoryId: string, name: string): Promise<Subcategory> => {
  console.log("Creating subcategory:", name, "for cat:", categoryId);
  const newSubcat = { id: `subcat_${Date.now()}`, name, categoryId };
  return newSubcat;
};


export function LanguageCategoryForms() {
  const [languages, setLanguages] = useState<Language[]>(mockLanguages);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(mockSubcategories);

  const [newLanguageName, setNewLanguageName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedLangForCat, setSelectedLangForCat] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCatForSubcat, setSelectedCatForSubcat] = useState('');
  
  const { toast } = useToast();

  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) {
      toast({ title: "Error", description: "Language name cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      const newLang = await createLanguageAction(newLanguageName.trim());
      setLanguages(prev => [...prev, newLang]);
      setNewLanguageName('');
      toast({ title: "Success", description: `Language "${newLang.name}" added.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add language.", variant: "destructive" });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !selectedLangForCat) {
      toast({ title: "Error", description: "Category name and language selection are required.", variant: "destructive" });
      return;
    }
    try {
      const newCat = await createCategoryAction(selectedLangForCat, newCategoryName.trim());
      setCategories(prev => [...prev, newCat]);
      setNewCategoryName('');
      setSelectedLangForCat('');
      toast({ title: "Success", description: `Category "${newCat.name}" added.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add category.", variant: "destructive" });
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCatForSubcat) {
      toast({ title: "Error", description: "Subcategory name and category selection are required.", variant: "destructive" });
      return;
    }
     try {
      const newSubcat = await createSubcategoryAction(selectedCatForSubcat, newSubcategoryName.trim());
      setSubcategories(prev => [...prev, newSubcat]);
      setNewSubcategoryName('');
      setSelectedCatForSubcat('');
      toast({ title: "Success", description: `Subcategory "${newSubcat.name}" added.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add subcategory.", variant: "destructive" });
    }
  };

  const handleDeleteLanguage = (id: string) => {
    setLanguages(prev => prev.filter(lang => lang.id !== id));
    // Also delete related categories and subcategories
    const relatedCategoryIds = categories.filter(cat => cat.languageId === id).map(cat => cat.id);
    setCategories(prev => prev.filter(cat => cat.languageId !== id));
    setSubcategories(prev => prev.filter(subcat => !relatedCategoryIds.includes(subcat.categoryId)));
    toast({ title: "Deleted", description: "Language and related items deleted." });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    // Also delete related subcategories
    setSubcategories(prev => prev.filter(subcat => subcat.categoryId !== id));
     toast({ title: "Deleted", description: "Category and related subcategories deleted." });
  };

  const handleDeleteSubcategory = (id: string) => {
    setSubcategories(prev => prev.filter(subcat => subcat.id !== id));
    toast({ title: "Deleted", description: "Subcategory deleted." });
  };


  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Languages */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><LanguagesIcon className="h-6 w-6 text-primary" /> Manage Languages</CardTitle>
          <CardDescription>Add or remove programming languages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-language">New Language Name</Label>
            <Input id="new-language" value={newLanguageName} onChange={(e) => setNewLanguageName(e.target.value)} placeholder="e.g., JavaScript" />
          </div>
          <Button onClick={handleAddLanguage} className="w-full bg-primary hover:bg-primary/90"><PlusCircle className="mr-2 h-4 w-4" /> Add Language</Button>
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {languages.map(lang => (
              <div key={lang.id} className="flex justify-between items-center p-2 border rounded-md">
                <span>{lang.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteLanguage(lang.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><FolderPlus className="h-6 w-6 text-primary" /> Manage Categories</CardTitle>
          <CardDescription>Add categories for specific languages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-language-for-cat">Language</Label>
            <Select value={selectedLangForCat} onValueChange={setSelectedLangForCat}>
              <SelectTrigger id="select-language-for-cat"><SelectValue placeholder="Select language..." /></SelectTrigger>
              <SelectContent>{languages.map(lang => <SelectItem key={lang.id} value={lang.id}>{lang.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-category">New Category Name</Label>
            <Input id="new-category" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Security" />
          </div>
          <Button onClick={handleAddCategory} disabled={!selectedLangForCat} className="w-full bg-primary hover:bg-primary/90"><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
           <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-2 border rounded-md">
                <span>{cat.name} ({languages.find(l => l.id === cat.languageId)?.name})</span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subcategories */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline"><ShapesIcon className="h-6 w-6 text-primary" /> Manage Subcategories</CardTitle>
          <CardDescription>Add subcategories under existing categories.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-category-for-subcat">Category</Label>
            <Select value={selectedCatForSubcat} onValueChange={setSelectedCatForSubcat}>
              <SelectTrigger id="select-category-for-subcat"><SelectValue placeholder="Select category..." /></SelectTrigger>
              <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name} ({languages.find(l => l.id === cat.languageId)?.name})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-subcategory">New Subcategory Name</Label>
            <Input id="new-subcategory" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder="e.g., Authentication" />
          </div>
          <Button onClick={handleAddSubcategory} disabled={!selectedCatForSubcat} className="w-full bg-primary hover:bg-primary/90"><PlusCircle className="mr-2 h-4 w-4" /> Add Subcategory</Button>
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {subcategories.map(subcat => {
                const parentCategory = categories.find(c => c.id === subcat.categoryId);
                const parentLanguage = parentCategory ? languages.find(l => l.id === parentCategory.languageId) : null;
                return (
                    <div key={subcat.id} className="flex justify-between items-center p-2 border rounded-md">
                        <span>{subcat.name} ({parentCategory?.name} - {parentLanguage?.name})</span>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSubcategory(subcat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                );
            })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
