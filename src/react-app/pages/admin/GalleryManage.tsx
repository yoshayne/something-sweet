import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import AdminLayout from "@/react-app/components/admin/AdminLayout";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";
import { Upload, Trash2, Pencil, Star, Image as ImageIcon, X, EyeOff, Eye } from "lucide-react";
import { galleryItems as staticGalleryItems, type GalleryItem as StaticGalleryItem } from "@/data/gallery";

interface UploadedImage {
  id: number;
  title: string;
  category: string;
  description: string;
  r2_key: string;
  filename: string;
  content_type: string;
  size: number;
  is_featured: number;
  created_at: string;
}

// Combined type for display
interface DisplayImage {
  id: string;
  title: string;
  category: string;
  description?: string;
  image: string;
  isPlaceholder: boolean;
  isFeatured: boolean;
  isHidden?: boolean;
  uploadedImage?: UploadedImage;
}

const categories = [
  { value: "cakes", label: "Cakes" },
  { value: "cupcakes", label: "Cupcakes" },
  { value: "cookies", label: "Cookies" },
  { value: "seasonal", label: "Seasonal" },
];

export default function GalleryManage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showRemoved, setShowRemoved] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [editImage, setEditImage] = useState<UploadedImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("cakes");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFeatured, setUploadFeatured] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch uploaded images
    const imagesRes = await fetch("/api/gallery");
    const images = await imagesRes.json();
    setUploadedImages(images);
    
    // Fetch hidden placeholder IDs
    const hiddenRes = await fetch("/api/gallery/hidden");
    const hidden = await hiddenRes.json();
    setHiddenIds(hidden);
    
    setLoading(false);
  };

  // Combine static and uploaded images
  const allImages: DisplayImage[] = [
    // Static placeholder images
    ...staticGalleryItems.map((item: StaticGalleryItem) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      image: item.image,
      isPlaceholder: true,
      isFeatured: item.featured || false,
      isHidden: hiddenIds.includes(item.id),
    })),
    // Uploaded images
    ...uploadedImages.map((img) => ({
      id: `uploaded-${img.id}`,
      title: img.title,
      category: img.category,
      description: img.description,
      image: getImageUrl(img.r2_key),
      isPlaceholder: false,
      isFeatured: img.is_featured === 1,
      uploadedImage: img,
    })),
  ];

  // Filter images
  const filteredImages = allImages.filter((img) => {
    // Filter by category
    if (filterCategory !== "all" && img.category !== filterCategory) return false;
    // "Deleted" (hidden) placeholders are removed from the admin view unless
    // the user opts to show them (so they can be restored).
    if (img.isPlaceholder && img.isHidden && !showRemoved) return false;
    return true;
  });

  // Count stats
  const placeholderCount = staticGalleryItems.length;
  const hiddenCount = hiddenIds.length;
  const uploadedCount = uploadedImages.length;

  function getImageUrl(r2Key: string) {
    const key = r2Key.replace("gallery/", "");
    return `/api/gallery/image/${key}`;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      const reader = new FileReader();
      reader.onload = (e) => setUploadPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setShowUploadModal(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);
    formData.append("category", uploadCategory);
    formData.append("description", uploadDescription);
    formData.append("is_featured", uploadFeatured.toString());

    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Upload failed" }));
        alert(error.error || "Failed to upload image. Please try again.");
        setUploading(false);
        return;
      }

      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle("");
      setUploadCategory("cakes");
      setUploadDescription("");
      setUploadFeatured(false);
      setShowUploadModal(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editImage) return;
    
    try {
      const res = await fetch(`/api/gallery/${editImage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editImage.title,
          category: editImage.category,
          description: editImage.description,
          is_featured: editImage.is_featured,
        }),
      });
      
      if (!res.ok) {
        alert("Failed to update image. Please try again.");
        return;
      }
      
      setEditImage(null);
      fetchData();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update image. Please check your connection.");
    }
  };

  const handleDeleteUploaded = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete image. Please try again.");
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete image. Please check your connection.");
    }
  };

  const handleToggleHidden = async (itemId: string, isCurrentlyHidden: boolean) => {
    try {
      const res = isCurrentlyHidden
        ? await fetch(`/api/gallery/hidden/${itemId}`, { method: "DELETE" })
        : await fetch(`/api/gallery/hidden/${itemId}`, { method: "POST" });
      
      if (!res.ok) {
        alert("Failed to update visibility. Please try again.");
        return;
      }
      fetchData();
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to update visibility. Please check your connection.");
    }
  };

  // Remove every visible placeholder at once (reversible — restore from
  // "Show removed placeholders"). Useful when the client wants to start fresh.
  const handleRemoveAllPlaceholders = async () => {
    const visible = staticGalleryItems.filter((i) => !hiddenIds.includes(i.id));
    if (visible.length === 0) return;
    if (
      !confirm(
        `Remove all ${visible.length} placeholder image(s) from the gallery?\n\nThey won't show on your site, but you can restore them later with "Show removed placeholders".`
      )
    )
      return;

    setBulkBusy(true);
    try {
      await Promise.all(
        visible.map((i) => fetch(`/api/gallery/hidden/${i.id}`, { method: "POST" }))
      );
      await fetchData();
    } catch (err) {
      console.error("Bulk remove error:", err);
      alert("Failed to remove all placeholders. Please try again.");
    } finally {
      setBulkBusy(false);
    }
  };

  // Permanently delete every uploaded image (image file + database record).
  const handleDeleteAllUploaded = async () => {
    if (uploadedImages.length === 0) return;
    if (
      !confirm(
        `Permanently delete all ${uploadedImages.length} uploaded image(s)?\n\nThis removes them from storage and cannot be undone.`
      )
    )
      return;

    setBulkBusy(true);
    try {
      for (const img of uploadedImages) {
        await fetch(`/api/gallery/${img.id}`, { method: "DELETE" });
      }
      await fetchData();
    } catch (err) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete all images. Please try again.");
    } finally {
      setBulkBusy(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">Gallery Images</h1>
            <p className="text-sm text-gray mt-1">
              Manage images that appear on your Gallery page. Delete placeholder images and upload your own.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/gallery" target="_blank">
              <Button variant="outline" size="sm">
                View Gallery
              </Button>
            </Link>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black hover:bg-charcoal text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-light-gray/50 rounded-lg p-4">
            <p className="text-2xl font-semibold text-black">{uploadedCount}</p>
            <p className="text-sm text-gray">Your Images</p>
          </div>
          <div className="bg-light-gray/50 rounded-lg p-4">
            <p className="text-2xl font-semibold text-black">{placeholderCount - hiddenCount}</p>
            <p className="text-sm text-gray">Visible Placeholders</p>
          </div>
          <div className="bg-light-gray/50 rounded-lg p-4">
            <p className="text-2xl font-semibold text-black">{hiddenCount}</p>
            <p className="text-sm text-gray">Removed Placeholders</p>
          </div>
        </div>

        {/* Bulk actions — clear the gallery to start over */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAllPlaceholders}
            disabled={bulkBusy || placeholderCount - hiddenCount === 0}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Remove All Placeholders
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAllUploaded}
            disabled={bulkBusy || uploadedCount === 0}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All My Images
          </Button>
          {bulkBusy && <span className="text-sm text-gray">Working…</span>}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray">Category:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${
                  filterCategory === "all"
                    ? "bg-black text-white"
                    : "bg-light-gray text-charcoal hover:bg-gray/20"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCategory(cat.value)}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${
                    filterCategory === cat.value
                      ? "bg-black text-white"
                      : "bg-light-gray text-charcoal hover:bg-gray/20"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRemoved}
              onChange={(e) => setShowRemoved(e.target.checked)}
              className="rounded border-gray"
            />
            <span className="text-sm text-gray">Show removed placeholders</span>
          </label>
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-light-gray animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16 bg-light-gray/50 rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto text-gray/50 mb-4" />
            <p className="text-gray">No images to display</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 bg-black hover:bg-charcoal text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Image
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`group relative aspect-square bg-light-gray rounded-lg overflow-hidden ${
                  image.isHidden ? "opacity-50" : ""
                }`}
              >
                <img
                  src={image.image}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {image.isPlaceholder && (
                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Placeholder
                    </div>
                  )}
                  {image.isFeatured && (
                    <div className="bg-gold-mid text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  {image.isHidden && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Removed
                    </div>
                  )}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-medium truncate">{image.title}</p>
                  <p className="text-white/70 text-xs capitalize">{image.category}</p>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {image.isPlaceholder ? (
                      // Placeholder actions: delete (hide) or restore. Placeholders
                      // are built-in demo images, so "delete" removes them from the
                      // site and can be undone via "Show removed placeholders".
                      image.isHidden ? (
                        <button
                          onClick={() => handleToggleHidden(image.id, true)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleHidden(image.id, false)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      )
                    ) : (
                      // Uploaded image actions: edit and delete
                      <>
                        <button
                          onClick={() => image.uploadedImage && setEditImage(image.uploadedImage)}
                          className="flex-1 bg-white text-black text-xs py-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => image.uploadedImage && handleDeleteUploaded(image.uploadedImage.id)}
                          className="bg-red-500 text-white text-xs px-3 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {uploadPreview && (
                <div className="relative aspect-video bg-light-gray rounded-lg overflow-hidden">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter image title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                <Textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Add a short description"
                  rows={2}
                />
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadFeatured}
                  onChange={(e) => setUploadFeatured(e.target.checked)}
                  className="rounded border-gray"
                />
                <span className="text-sm">Mark as featured (shows on homepage)</span>
              </label>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="flex-1 bg-black hover:bg-charcoal text-white"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editImage} onOpenChange={(open) => !open && setEditImage(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
            </DialogHeader>
            {editImage && (
              <div className="space-y-4 mt-4">
                <div className="aspect-video bg-light-gray rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(editImage.r2_key)}
                    alt={editImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray">
                  <span>{editImage.filename}</span>
                  <span>{formatFileSize(editImage.size)}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <Input
                    value={editImage.title}
                    onChange={(e) => setEditImage({ ...editImage, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <Select
                    value={editImage.category}
                    onValueChange={(v) => setEditImage({ ...editImage, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <Textarea
                    value={editImage.description || ""}
                    onChange={(e) => setEditImage({ ...editImage, description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editImage.is_featured === 1}
                    onChange={(e) => setEditImage({ ...editImage, is_featured: e.target.checked ? 1 : 0 })}
                    className="rounded border-gray"
                  />
                  <span className="text-sm">Mark as featured (shows on homepage)</span>
                </label>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditImage(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    className="flex-1 bg-black hover:bg-charcoal text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
