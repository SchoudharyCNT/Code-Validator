import { ValidatorForm } from '@/components/validator/validator-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function CodeValidatorPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Code Validator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Check your code for compliance with best practices and coding standards.
        </p>
      </header>
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Validate Your Code
          </CardTitle>
          <CardDescription>
            Select a language, category, and paste your code below to get an AI-powered analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ValidatorForm />
        </CardContent>
      </Card>
    </div>
  );
}
