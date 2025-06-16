import { RuleManagementTabs } from "@/components/manage-rules/rule-management-tabs";
import { Edit3 } from "lucide-react";

export default function ManageRulesPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">
          Rule Management
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Create, view, update, and delete code validation rules.
        </p>
      </header>
      <RuleManagementTabs />
    </div>
  );
}
