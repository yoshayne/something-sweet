import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";
import { Upload, Trash2, Pencil, Image as ImageIcon, Eye } from "lucide-react";
import { Textarea } from "@/react-app/components/ui/textarea";

interface SiteImage {
  id: number;
  location: string;
  title: string;
  description: string;
  r2_key: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

const imageLocations = [
  {
    section: "Homepage",
    locations: [
      { value: "homepage_hero", label: "Hero Background", description: "Main hero section background image" },
      { value: "homepage_special", label: "This Week's Special", description: "Featured product image in the 'This Week's Special' section" },
    ]
  },
  {
    section: "About Page",
    locations: [
      { value: "about_main", label: "Main Photo", description: "Large photo in the About section header" },
      { value: "about_secondary", label: "Secondary Photo", description: "Supporting photo in the About section" },
      { value: "about_kitchen", label: "Kitchen/Workspace", description: "Photo showing your kitchen or workspace" },
    ]
  },
];

export default function SiteImages() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<SiteImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/site-images");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error("Failed to fetch site images:", err);
    }
  };

  const handleUploadClick = (location: string) => {
    setSelectedLocation(location);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLocation) return;

    const locationConfig = imageLocations
      .flatMap(s => s.locations)
      .find(l => l.value === selectedLocation);

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("location", selectedLocation);
    formData.append("title", locationConfig?.label || file.name);

    try {
      const res = await fetch("/api/site-images", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchImages();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      setSelectedLocation(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (image: SiteImage) => {
    if (!confirm(`Delete "${image.title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/site-images/${image.location}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchImages();
      } else {
        alert("Failed to delete image");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete image");
    }
  };

  const handleEditSave = async () => {
    if (!editingImage) return;

    try {
      const res = await fetch(`/api/site-images/${editingImage.location}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });

      if (res.ok) {
        await fetchImages();
        setEditingImage(null);
      } else {
        alert("Failed to update image");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update image");
    }
  };

  const getImageForLocation = (location: string): SiteImage | undefined => {
    return images.find(img => img.location === location);
  };

  const getImageUrl = (image: SiteImage): string => {
    return `/api/files/${image.r2_key}`;
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-black">Site Images</h1>
            <p className="text-sm text-gray mt-1">
              Upload images for specific sections of your website. Each slot has one image — uploading a new one will replace the current.
            </p>
          </div>

          {/* Image Sections */}
          {imageLocations.map((section) => (
            <div key={section.section} className="bg-white rounded-xl border border-gray/10 overflow-hidden">
              <div className="px-4 md:px-6 py-4 bg-[#0C0C0C]">
                <h2 className="text-lg font-semibold text-white">{section.section}</h2>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="grid gap-4 md:gap-6">
                  {section.locations.map((loc) => {
                    const image = getImageForLocation(loc.value);
                    
                    return (
                      <div 
                        key={loc.value}
                        className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6 p-3 md:p-4 bg-cream/30 rounded-lg border border-gray/10"
                      >
                        {/* Image Preview */}
                        <div className="w-20 h-16 md:w-40 md:h-28 rounded-lg overflow-hidden bg-gray/10 flex-shrink-0 relative group">
                          {image ? (
                            <>
                              <img 
                                src={getImageUrl(image)} 
                                alt={image.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setPreviewImage(image)}
                                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                >
                                  <Eye className="w-4 h-4 text-black" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray/50">
                              <ImageIcon className="w-5 h-5 md:w-8 md:h-8" />
                            </div>
                          )}
                        </div>

                        {/* Info + Actions */}
                        <div className="flex-1 min-w-0">
                          {/* Title row with edit/delete icons */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-black text-sm md:text-base">{loc.label}</h3>
                            {image && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingImage(image);
                                    setEditTitle(image.title);
                                    setEditDescription(image.description || "");
                                  }}
                                  className="p-1.5 rounded-md hover:bg-gray/10 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-gray" />
                                </button>
                                <button
                                  onClick={() => handleDelete(image)}
                                  className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray mt-0.5 line-clamp-2 md:line-clamp-none">{loc.description}</p>
                          {image && (
                            <p className="text-xs text-gray/60 mt-1 truncate">
                              {image.filename}
                            </p>
                          )}
                          
                          {/* Upload/Replace button */}
                          <Button
                            onClick={() => handleUploadClick(loc.value)}
                            disabled={uploading && selectedLocation === loc.value}
                            className="w-full md:w-auto mt-2 bg-black hover:bg-charcoal text-white"
                            size="sm"
                          >
                            <Upload className="w-4 h-4 mr-1 md:mr-2" />
                            {image ? "Replace" : "Upload"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-4">
              {/* Image preview */}
              <div className="w-full h-40 rounded-lg overflow-hidden bg-gray/10">
                <img
                  src={getImageUrl(editingImage)}
                  alt={editingImage.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-black">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1"
                  placeholder="Enter a title for this image"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-black">Description (optional)</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1"
                  placeholder="Add a description or notes about this image"
                  rows={3}
                />
              </div>
              
              <p className="text-xs text-gray">
                {editingImage.filename} • {(editingImage.size / 1024).toFixed(1)} KB
              </p>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingImage(null)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSave} className="bg-black hover:bg-charcoal text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="mt-4">
              <img
                src={getImageUrl(previewImage)}
                alt={previewImage.title}
                className="w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
