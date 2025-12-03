export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
