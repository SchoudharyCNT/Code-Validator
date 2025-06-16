import Link from "next/link";
import { CodeXml } from "lucide-react";

export function Navbar() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <CodeXml className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">CodeCheck AI</h1>
        </Link>
        <div className="space-x-4">
          <Link
            href="/validator"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Code Validator
          </Link>
          <Link
            href="/manage-rules"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Manage Rules
          </Link>
        </div>
      </nav>
    </header>
  );
}
