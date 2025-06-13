"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageCategoryForms } from "./language-category-forms";
import { RulesManager } from "./rules-manager";
import { BookType, ListChecks, Settings2 } from "lucide-react";

export function RuleManagementTabs() {
  return (
    <Tabs defaultValue="rules" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-auto md:mx-auto mb-6">
        <TabsTrigger value="rules" className="font-headline">
          <ListChecks className="mr-2 h-5 w-5" /> Manage Rules
        </TabsTrigger>
        <TabsTrigger value="lang-cat" className="font-headline">
          <BookType className="mr-2 h-5 w-5" /> Manage Languages & Categories
        </TabsTrigger>
      </TabsList>
      <TabsContent value="rules">
        <RulesManager />
      </TabsContent>
      <TabsContent value="lang-cat">
        <LanguageCategoryForms />
      </TabsContent>
    </Tabs>
  );
}
