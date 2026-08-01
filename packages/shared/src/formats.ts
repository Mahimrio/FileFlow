export type FormatCategory =
  | "documents"
  | "images"
  | "spreadsheets"
  | "slides"
  | "vectors"
  | "video"
  | "audio";

export interface FormatDefinition {
  id: string; // e.g. "pdf"
  label: string; // e.g. "PDF"
  category: FormatCategory;
  phase1: boolean; // true if live in Phase 1
}

export const FORMATS: FormatDefinition[] = [
  // Documents (Phase 1)
  { id: "pdf", label: "PDF", category: "documents", phase1: true },
  { id: "docx", label: "DOCX", category: "documents", phase1: true },
  { id: "doc", label: "DOC", category: "documents", phase1: true },
  { id: "txt", label: "TXT", category: "documents", phase1: true },
  { id: "rtf", label: "RTF", category: "documents", phase1: true },
  { id: "odt", label: "ODT", category: "documents", phase1: true },
  { id: "html", label: "HTML", category: "documents", phase1: true },
  { id: "md", label: "Markdown", category: "documents", phase1: true },

  // Spreadsheets (Phase 1)
  { id: "xlsx", label: "XLSX", category: "spreadsheets", phase1: true },
  { id: "xls", label: "XLS", category: "spreadsheets", phase1: true },
  { id: "csv", label: "CSV", category: "spreadsheets", phase1: true },
  { id: "ods", label: "ODS", category: "spreadsheets", phase1: true },

  // Slides (Phase 1)
  { id: "pptx", label: "PPTX", category: "slides", phase1: true },
  { id: "ppt", label: "PPT", category: "slides", phase1: true },
  { id: "odp", label: "ODP", category: "slides", phase1: true },

  // Common Images (Phase 1)
  { id: "png", label: "PNG", category: "images", phase1: true },
  { id: "jpg", label: "JPG", category: "images", phase1: true },
  { id: "jpeg", label: "JPEG", category: "images", phase1: true },
  { id: "webp", label: "WEBP", category: "images", phase1: true },
  { id: "gif", label: "GIF", category: "images", phase1: true },
  { id: "bmp", label: "BMP", category: "images", phase1: true },
  { id: "tiff", label: "TIFF", category: "images", phase1: true },

  // Obscure Images / RAW (Phase 2)
  { id: "heic", label: "HEIC", category: "images", phase1: false },
  { id: "raw", label: "RAW", category: "images", phase1: false },
  { id: "cr2", label: "CR2", category: "images", phase1: false },
  { id: "nef", label: "NEF", category: "images", phase1: false },

  // Vectors (Phase 2)
  { id: "svg", label: "SVG", category: "vectors", phase1: false },
  { id: "ai", label: "AI", category: "vectors", phase1: false },
  { id: "eps", label: "EPS", category: "vectors", phase1: false },
  { id: "fig", label: "Figma", category: "vectors", phase1: false },

  // Video (Phase 2)
  { id: "mp4", label: "MP4", category: "video", phase1: false },
  { id: "mov", label: "MOV", category: "video", phase1: false },
  { id: "avi", label: "AVI", category: "video", phase1: false },
  { id: "webm", label: "WEBM", category: "video", phase1: false },
  { id: "mkv", label: "MKV", category: "video", phase1: false },
  { id: "flv", label: "FLV", category: "video", phase1: false },

  // Audio (Phase 2)
  { id: "mp3", label: "MP3", category: "audio", phase1: false },
  { id: "wav", label: "WAV", category: "audio", phase1: false },
  { id: "ogg", label: "OGG", category: "audio", phase1: false },
  { id: "flac", label: "FLAC", category: "audio", phase1: false },
  { id: "aac", label: "AAC", category: "audio", phase1: false },
  { id: "m4a", label: "M4A", category: "audio", phase1: false },
];
