import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { name: "Documents", formats: ["PDF", "DOCX", "ODT", "RTF", "TXT", "HTML"] },
  { name: "Images", formats: ["PNG", "JPG", "WEBP", "HEIC", "TIFF", "GIF"] },
  { name: "Video", formats: ["MP4", "MOV", "MKV", "WEBM", "AVI"] },
  { name: "Audio", formats: ["MP3", "WAV", "FLAC", "AAC", "M4A"] },
  { name: "Spreadsheets", formats: ["XLSX", "CSV", "ODS", "XLS"] },
  { name: "Slides", formats: ["PPTX", "ODP", "PDF"] },
  { name: "Vectors", formats: ["SVG", "EPS", "WMF", "EMF"] },
];

export function FormatsGrid() {
  return (
    <section className="py-16 bg-muted/30 px-4 md:px-6 border-y">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Supported formats</h2>
          <p className="mt-4 text-muted-foreground">Convert freely between over 180 formats across seven categories.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-heading font-semibold text-lg mb-4">{cat.name}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.formats.map((ext) => (
                  <Badge key={ext} variant="secondary" className="font-mono text-xs">
                    .{ext.toLowerCase()}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
