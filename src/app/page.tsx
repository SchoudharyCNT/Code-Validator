import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, ShieldCheck, Edit3 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-12">
      <section className="mt-8">
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">
          Welcome to CodeCheck AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent assistant for ensuring code quality, security, and
          adherence to best practices. Validate your code snippets and manage
          custom validation rules with ease.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <ShieldCheck className="h-7 w-7 text-primary" />
              Code Validator
            </CardTitle>
            <CardDescription>
              Submit your code snippets and get instant feedback on potential
              issues, based on selected languages and categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/validator">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Go to Validator
                <Lightbulb className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <Edit3 className="h-7 w-7 text-accent" />
              Rule Management
            </CardTitle>
            <CardDescription>
              Create, view, update, and delete custom validation rules. Tailor
              the validation logic to your project's specific needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/manage-rules">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Manage Rules
                <Edit3 className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="w-full max-w-4xl text-left p-6 bg-card rounded-lg shadow-md">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-4">
          How it Works
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">
              Select Language & Category:
            </strong>{" "}
            Choose the programming language and validation focus.
          </li>
          <li>
            <strong className="text-foreground">Input Code:</strong> Paste or
            type your code into the editor.
          </li>
          <li>
            <strong className="text-foreground">Validate:</strong> Let our AI
            analyze your code against predefined and custom rules.
          </li>
          <li>
            <strong className="text-foreground">Review Results:</strong> Get a
            clear summary of violations, descriptions, and suggestions.
          </li>
          <li>
            <strong className="text-foreground">Manage Rules:</strong> Customize
            the validation engine by adding your own rules.
          </li>
        </ol>
      </section>
    </div>
  );
}
