"use client";

import { useEffect, useState } from "react";
import type { Rule, Language, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RuleForm } from "./rule-form";
import { RulesTable } from "./rules-table";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASEURL ?? "";

export function RulesManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const [langsRes, catsRes, rulesRes] = await Promise.all([
          fetch(`${BASE_URL}/language`),
          fetch(`${BASE_URL}/categories`),
          fetch(`${BASE_URL}/rules`),
        ]);

        if (!langsRes.ok || !catsRes.ok || !rulesRes.ok) {
          throw new Error("Failed to load metadata");
        }

        const [langs, cats, rules] = await Promise.all([
          langsRes.json(),
          catsRes.json(),
          rulesRes.json(),
        ]);

        setLanguages(langs);
        setCategories(cats);
        setRules(rules);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    };

    fetchMetaData();
  }, []);

  const createRule = async (ruleData: Omit<Rule, "id">): Promise<Rule> => {
    const res = await fetch(`${BASE_URL}/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ruleData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create rule.");
    }

    return await res.json();
  };

  const handleAddRule = async (newRule: Rule) => {
    try {
      const { id, ...ruleData } = newRule; // Ignore temp id
      const createdRule = await createRule(ruleData);
      setRules((prev) => [...prev, createdRule]);
      toast({ title: "Success", description: "Rule created successfully." });
      setIsRuleFormOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const updateRule = async (ruleData: Rule): Promise<Rule> => {
    const res = await fetch(`${BASE_URL}/rules/${ruleData.id}`, {
      method: "PUT", // or PATCH depending on your backend
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ruleData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update rule.");
    }

    return await res.json();
  };

  const handleUpdateRule = async (updatedRule: Rule) => {
    try {
      const savedRule = await updateRule(updatedRule);
      setRules((prev) =>
        prev.map((r) => (r.id === savedRule.id ? savedRule : r)),
      );
      toast({ title: "Success", description: "Rule updated successfully." });
      setIsRuleFormOpen(false);
      setEditingRule(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const deleteRule = async (ruleId: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/rules/${ruleId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to delete rule.");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast({ title: "Deleted", description: "Rule deleted successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openEditForm = (rule: Rule) => {
    setEditingRule(rule);
    setIsRuleFormOpen(true);
  };

  const openNewForm = () => {
    setEditingRule(null);
    setIsRuleFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={openNewForm}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Rule
        </Button>
      </div>

      <Dialog open={isRuleFormOpen} onOpenChange={setIsRuleFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {editingRule ? "Edit Rule" : "Create New Rule"}
            </DialogTitle>
            <DialogDescription>
              {editingRule
                ? "Modify the details of the existing rule."
                : "Define a new validation rule for the system."}
            </DialogDescription>
          </DialogHeader>
          <RuleForm
            languages={languages}
            categories={categories}
            initialData={editingRule}
            onSubmit={editingRule ? handleUpdateRule : handleAddRule}
            onCancel={() => {
              setIsRuleFormOpen(false);
              setEditingRule(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <RulesTable
        rules={rules}
        languages={languages}
        categories={categories}
        onEditRule={openEditForm}
        onDeleteRule={handleDeleteRule}
      />
    </div>
  );
}
