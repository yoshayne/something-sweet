import { useState, useRef } from "react";
import { Upload, X, Link, Image, Loader2 } from "lucide-react";

interface InspirationUploadProps {
  inspirationLinks: string[];
  inspirationImages: string[];
  onLinksChange: (links: string[]) => void;
  onImagesChange: (images: string[]) => void;
}

export default function InspirationUpload({
  inspirationLinks,
  inspirationImages,
  onLinksChange,
  onImagesChange,
}: InspirationUploadProps) {
  const [newLink, setNewLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    if (newLink.trim()) {
      let url = newLink.trim();
      // Add https:// if no protocol specified
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      onLinksChange([...inspirationLinks, url]);
      setNewLink("");
    }
  };

  const handleRemoveLink = (index: number) => {
    onLinksChange(inspirationLinks.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/inspiration", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...inspirationImages, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(inspirationImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Upload Images */}
      <div>
        <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-charcoal mb-2">
          Upload Inspiration Photos
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-light-gray hover:border-gold/50 transition-colors p-6 text-center cursor-pointer rounded"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <span className="text-sm text-gray">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray" />
              <span className="text-sm text-gray">
                Click to upload images
              </span>
              <span className="text-xs text-gray/60">
                JPG, PNG, GIF, WebP • Max 5MB each
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        )}
      </div>

      {/* Uploaded Images Preview */}
      {inspirationImages.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {inspirationImages.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Inspiration ${index + 1}`}
                className="w-full h-full object-cover rounded border border-light-gray"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-charcoal text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Links */}
      <div>
        <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-charcoal mb-2">
          Inspiration Links (Pinterest, Instagram, etc.)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLink();
              }
            }}
            placeholder="https://pinterest.com/..."
            className="flex-1 px-4 py-3 text-sm border border-light-gray focus:border-gold focus:ring-0 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleAddLink}
            disabled={!newLink.trim()}
            className="px-4 py-3 bg-charcoal text-white text-xs font-medium tracking-wider uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Added Links */}
      {inspirationLinks.length > 0 && (
        <div className="space-y-2">
          {inspirationLinks.map((link, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-light-gray/30 rounded"
            >
              <Link className="w-4 h-4 text-gold shrink-0" />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-charcoal hover:text-gold truncate"
              >
                {link}
              </a>
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="p-1 text-gray hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {(inspirationImages.length > 0 || inspirationLinks.length > 0) && (
        <div className="flex items-center gap-4 text-xs text-gray pt-2 border-t border-light-gray">
          {inspirationImages.length > 0 && (
            <span className="flex items-center gap-1">
              <Image className="w-3.5 h-3.5" />
              {inspirationImages.length} photo{inspirationImages.length !== 1 ? "s" : ""}
            </span>
          )}
          {inspirationLinks.length > 0 && (
            <span className="flex items-center gap-1">
              <Link className="w-3.5 h-3.5" />
              {inspirationLinks.length} link{inspirationLinks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
