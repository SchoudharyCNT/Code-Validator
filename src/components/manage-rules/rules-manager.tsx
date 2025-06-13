"use client";

import { useState } from 'react';
import type { Rule, Language, Category, Subcategory } from '@/lib/types';
import { mockRules, mockLanguages, mockCategories, mockSubcategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { RuleForm } from './rule-form';
import { RulesTable } from './rules-table';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function RulesManager() {
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [languages] = useState<Language[]>(mockLanguages);
  const [categories] = useState<Category[]>(mockCategories);
  const [subcategories] = useState<Subcategory[]>(mockSubcategories);
  
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const handleAddRule = (newRule: Rule) => {
    setRules(prev => [...prev, { ...newRule, id: `rule_${Date.now()}` }]);
    setIsRuleFormOpen(false);
  };

  const handleUpdateRule = (updatedRule: Rule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    setIsRuleFormOpen(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
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
        <Button onClick={openNewForm} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Rule
        </Button>
      </div>

      <Dialog open={isRuleFormOpen} onOpenChange={setIsRuleFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">
              {editingRule ? 'Edit Rule' : 'Create New Rule'}
            </DialogTitle>
            <DialogDescription>
              {editingRule ? 'Modify the details of the existing rule.' : 'Define a new validation rule for the system.'}
            </DialogDescription>
          </DialogHeader>
          <RuleForm
            languages={languages}
            categories={categories}
            subcategories={subcategories}
            onSubmit={editingRule ? handleUpdateRule : handleAddRule}
            initialData={editingRule}
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
        subcategories={subcategories}
        onEditRule={openEditForm}
        onDeleteRule={handleDeleteRule}
      />
    </div>
  );
}
