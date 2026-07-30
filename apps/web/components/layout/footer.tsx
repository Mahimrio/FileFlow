import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto px-4 md:px-6">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Files are automatically deleted 24 hours after conversion. We don't read, share, or store your content beyond that.
        </p>
      </div>
    </footer>
  );
}
