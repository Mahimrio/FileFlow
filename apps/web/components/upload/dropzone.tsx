"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, FileType, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormatPicker } from "./format-picker";

type UploadState = "idle" | "hover" | "dragging" | "uploading" | "success" | "error";

export function Dropzone() {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedStorageKey, setUploadedStorageKey] = useState("");
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadFile = async (file: File) => {
    setState("uploading");
    setProgress(0);
    setFileName(file.name);
    setErrorMessage("");

    try {
      // 1. Get presigned URL
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, storageKey } = await res.json();

      // 2. Upload to S3/R2 directly using XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));

        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // 3. Save key for Format Picker
      console.log("File uploaded successfully. Storage key:", storageKey);
      setUploadedStorageKey(storageKey);
      setState("success");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred");
      setState("error");
    } finally {
      xhrRef.current = null;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    uploadFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: state !== "idle" && state !== "dragging",
    onDragEnter: () => setState("dragging"),
    onDragLeave: () => setState("idle"),
  });

  // Keep state synced with drag
  if (isDragActive && state === "idle") setState("dragging");
  if (!isDragActive && state === "dragging") setState("idle");

  const variants = {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center p-12 overflow-hidden border-2 border-dashed rounded-2xl transition-colors cursor-pointer bg-card
          ${state === "dragging" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
          ${(state === "uploading" || state === "error") ? "pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {(state === "idle" || state === "dragging") && (
            <motion.div
              key="idle"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className={`p-4 rounded-full ${state === "dragging" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {state === "dragging" ? "Drop file here" : "Drag & drop a file, or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports documents, images, video, and audio
                </p>
              </div>
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div
              key="uploading"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center space-y-6 w-full max-w-md"
            >
              <div className="flex flex-col items-center space-y-2 w-full">
                <FileType className="w-8 h-8 text-primary animate-pulse" />
                <p className="font-medium truncate w-full">{fileName}</p>
              </div>
              
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "tween", ease: "linear", duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center space-y-4 w-full"
            >
              <div className="p-4 rounded-full bg-green-500/10 text-green-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">Upload Complete</p>
                <p className="text-sm text-muted-foreground mt-1 truncate max-w-xs">{fileName}</p>
              </div>
              
              <div className="w-full mt-4" onClick={(e) => e.stopPropagation()}>
                <FormatPicker 
                  sourceExtension={fileName.split(".").pop() || ""}
                  onSelect={async (targetFormat) => {
                    try {
                      const sourceFormat = fileName.split(".").pop() || "";
                      const res = await fetch("/api/jobs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sourceFileName: fileName,
                          sourceFormat,
                          targetFormat,
                          storageKeySource: uploadedStorageKey,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Failed to create job");
                      
                      alert(`Job created successfully! ID: ${data.jobId}\n(The background worker will be added in Prompt 9 to process this!)`);
                    } catch (err: any) {
                      alert(`Error: ${err.message}`);
                    }
                  }}
                />
              </div>

              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setState("idle"); }} className="mt-4">
                Upload another file
              </Button>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">Upload Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setState("idle"); }} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
