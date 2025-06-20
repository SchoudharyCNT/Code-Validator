"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Filter } from "lucide-react";
import type { Rule, Language, Category } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface RulesTableProps {
  rules: Rule[];
  languages: Language[];
  categories: Category[];
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (ruleId: string) => void;
}

const ALL_LANGUAGES_VALUE = "_all_languages_";
const ALL_CATEGORIES_VALUE = "_all_categories_";

export function RulesTable({
  rules,
  languages,
  categories,
  onEditRule,
  onDeleteRule,
}: RulesTableProps) {
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const langMatch = filterLanguage
        ? rule.languageId === filterLanguage
        : true;
      const catMatch = filterCategory
        ? rule.categoryId === filterCategory
        : true;
      const termMatch = searchTerm
        ? rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rule.validationType || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (rule.validationValue || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      return langMatch && catMatch && termMatch;
    });
  }, [rules, filterLanguage, filterCategory, searchTerm]);

  const getLanguageName = (id: string) =>
    languages.find((l) => l.id === id)?.name || "N/A";
  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "N/A";

  const severityVariant = (
    severity: Rule["severity"],
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "secondary";
      case "LOW":
        return "default";
      default:
        return "outline";
    }
  };

  const confirmDelete = (rule: Rule) => {
    setRuleToDelete(rule);
  };

  const handleDeleteConfirm = () => {
    if (ruleToDelete) {
      onDeleteRule(ruleToDelete.id);
      setRuleToDelete(null);
    }
  };

  const handleLanguageFilterChange = (selectedValue: string) => {
    const newLangFilter =
      selectedValue === ALL_LANGUAGES_VALUE ? "" : selectedValue;
    setFilterLanguage(newLangFilter);
    // Reset category filter if "All Languages" is chosen or if the selected language changes
    if (
      newLangFilter === "" ||
      (newLangFilter && newLangFilter !== filterLanguage)
    ) {
      setFilterCategory("");
    }
  };

  const handleCategoryFilterChange = (selectedValue: string) => {
    setFilterCategory(
      selectedValue === ALL_CATEGORIES_VALUE ? "" : selectedValue,
    );
  };

  const availableCategoriesForFilter = useMemo(() => {
    if (!filterLanguage) {
      return categories; // Show all categories if no language is selected
    }
    return categories.filter((c) => c.languageId === filterLanguage);
  }, [categories, filterLanguage]);

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-md">
        <CardHeader className="p-2">
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" /> Filter Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={filterLanguage || ALL_LANGUAGES_VALUE}
            onValueChange={handleLanguageFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by language..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_LANGUAGES_VALUE}>All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterCategory || ALL_CATEGORIES_VALUE}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>
                All Categories
              </SelectItem>
              {availableCategoriesForFilter.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-xl overflow-hidden">
        <Table>
          <TableCaption>A list of configured validation rules.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-headline">Title</TableHead>
              <TableHead className="font-headline">Language</TableHead>
              <TableHead className="font-headline">Category</TableHead>
              <TableHead className="font-headline">Severity</TableHead>
              <TableHead className="font-headline">Validation Type</TableHead>
              <TableHead className="font-headline">Validation Value</TableHead>
              <TableHead className="font-headline text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRules.length > 0 ? (
              filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.title}</TableCell>
                  <TableCell>{getLanguageName(rule.languageId)}</TableCell>
                  <TableCell>{getCategoryName(rule.categoryId)}</TableCell>
                  <TableCell>
                    <Badge variant={severityVariant(rule.severity)}>
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{rule.validationType || "-"}</TableCell>
                  <TableCell>{rule.validationValue || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditRule(rule)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(rule)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No rules found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {ruleToDelete && (
        <AlertDialog
          open={!!ruleToDelete}
          onOpenChange={() => setRuleToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                rule titled "{ruleToDelete.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRuleToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
