export function Hero() {
  return (
    <section className="py-20 md:py-28 text-center px-4 md:px-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Universal File Converter
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          Instantly transform documents, images, spreadsheets, and more between over 180 formats with unparalleled precision.
        </p>
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 transition-colors hover:border-primary/50 hover:bg-muted/40">
            <p className="text-sm font-medium text-muted-foreground">
              Drag & drop a file, or click to browse
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
