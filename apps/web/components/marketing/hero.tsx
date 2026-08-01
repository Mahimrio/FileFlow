import { Dropzone } from "@/components/upload/dropzone";

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
          <Dropzone />
        </div>
      </div>
    </section>
  );
}
