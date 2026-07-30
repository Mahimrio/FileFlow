import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StyleGuide() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 space-y-16">
      <div>
        <h1 className="text-4xl font-heading font-bold mb-2">Style Guide</h1>
        <p className="text-muted-foreground">Design system reference for FileFlow.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-semibold border-b pb-2">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="Background" variable="bg-background" />
          <ColorSwatch name="Foreground" variable="bg-foreground" text="text-background" />
          <ColorSwatch name="Card" variable="bg-card" />
          <ColorSwatch name="Card Foreground" variable="bg-card-foreground" text="text-card" />
          <ColorSwatch name="Primary" variable="bg-primary" text="text-primary-foreground" />
          <ColorSwatch name="Secondary" variable="bg-secondary" text="text-secondary-foreground" />
          <ColorSwatch name="Muted" variable="bg-muted" text="text-muted-foreground" />
          <ColorSwatch name="Accent" variable="bg-accent" text="text-accent-foreground" />
          <ColorSwatch name="Destructive" variable="bg-destructive" text="text-destructive-foreground" />
          <ColorSwatch name="Border" variable="bg-border" />
          <ColorSwatch name="Input" variable="bg-input" />
          <ColorSwatch name="Ring" variable="bg-ring" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-semibold border-b pb-2">Typography</h2>
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight lg:text-5xl">Heading 1</h1>
            <p className="text-sm text-muted-foreground mt-1">Font: Outfit (var(--font-heading)), 4xl/5xl</p>
          </div>
          <div>
            <h2 className="text-3xl font-heading font-semibold tracking-tight">Heading 2</h2>
            <p className="text-sm text-muted-foreground mt-1">Font: Outfit, 3xl</p>
          </div>
          <div>
            <h3 className="text-2xl font-heading font-semibold tracking-tight">Heading 3</h3>
            <p className="text-sm text-muted-foreground mt-1">Font: Outfit, 2xl</p>
          </div>
          <div>
            <h4 className="text-xl font-heading font-semibold tracking-tight">Heading 4</h4>
            <p className="text-sm text-muted-foreground mt-1">Font: Outfit, xl</p>
          </div>
          <div>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Body paragraph. The quick brown fox jumps over the lazy dog. Files are automatically deleted 24 hours after conversion.
            </p>
            <p className="text-sm text-muted-foreground mt-1">Font: Inter (var(--font-sans)), base</p>
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Small text block.</p>
            <p className="text-sm text-muted-foreground mt-1">Font: Inter, sm</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Muted text block.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-semibold border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center mt-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default Size</Button>
          <Button size="lg">Large Size</Button>
          <Button size="icon">
            <span className="sr-only">Icon</span>
            +
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-semibold border-b pb-2">Inputs</h2>
        <div className="max-w-sm space-y-4">
          <Input type="email" placeholder="Email address" />
          <Input type="file" />
          <Input disabled placeholder="Disabled input" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-semibold border-b pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({ name, variable, text = "text-foreground" }: { name: string, variable: string, text?: string }) {
  return (
    <div className="border rounded-md overflow-hidden flex flex-col">
      <div className={`h-24 ${variable} flex items-center justify-center`}>
        <span className={`text-sm font-medium ${text}`}>Sample</span>
      </div>
      <div className="p-3 bg-card text-card-foreground">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{variable.replace("bg-", "")}</div>
      </div>
    </div>
  );
}
