import { UploadCloud, FileType2, Download } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-semibold text-xl">1. Upload your file</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Drag and drop any file directly into the browser. Your connection is fully encrypted.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileType2 className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-semibold text-xl">2. Choose a format</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Select your desired target format. We automatically filter to compatible types.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Download className="h-8 w-8" />
            </div>
            <h3 className="font-heading font-semibold text-xl">3. Download the result</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Grab your converted file instantly. All files are securely deleted after 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
