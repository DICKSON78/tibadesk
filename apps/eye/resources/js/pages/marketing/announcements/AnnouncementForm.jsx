import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material";
import { Add, FormatAlignLeft, FormatAlignCenter, FormatAlignRight } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useToast } from "../../../hooks";

const AnnouncementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const isEdit = Boolean(id);
  const fileRef = useRef();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", status: "draft",
  });
  const [file, setFile] = useState(null);
  const quillRef = useRef(null);
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const [imgDialogOpen, setImgDialogOpen] = useState(false);
  const [imgDialogMode, setImgDialogMode] = useState("insert");
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlign, setImgAlign] = useState("center");
  const [imgSize, setImgSize] = useState(80);
  const [imgTarget, setImgTarget] = useState(null);

  const getImageStyle = (align, size) => {
    if (align === "center") {
      return `display: block; margin: 24px auto; width: ${size}%; height: auto; border-radius: 8px; max-height: 500px; object-fit: cover;`;
    }
    const margin = align === "left" ? "8px 16px 8px 0" : "8px 0 8px 16px";
    return `float: ${align}; margin: ${margin}; width: ${size}%; height: auto; border-radius: 8px; max-height: 400px; object-fit: cover;`;
  };

  const insertImage = (url, align, size) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    const style = getImageStyle(align, size);
    const html = `<img src="${url}" style="${style}" />`;
    quill.clipboard.dangerouslyPasteHTML(range.index, html, "user");
  };

  const handleImgFilePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingContentImage(true);
    const fd = new FormData();
    fd.append("image", file);
    window.axios.post("/api/marketing/blog-posts/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      setImgUrl(res.data.data.url);
      setImgAlign("center");
      setImgSize(80);
      setImgDialogMode("insert");
      setImgTarget(null);
      setImgDialogOpen(true);
    }).catch(() => {
      addToast({ message: "Image upload failed", severity: "error" });
    }).finally(() => {
      setUploadingContentImage(false);
    });
  };

  const handleImgReplacePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingContentImage(true);
    const fd = new FormData();
    fd.append("image", file);
    window.axios.post("/api/marketing/blog-posts/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((res) => {
      setImgUrl(res.data.data.url);
    }).catch(() => {
      addToast({ message: "Image upload failed", severity: "error" });
    }).finally(() => {
      setUploadingContentImage(false);
    });
  };

  const handleImgDialogInsert = () => {
    if (imgDialogMode === "insert") {
      insertImage(imgUrl, imgAlign, imgSize);
    } else if (imgDialogMode === "edit" && imgTarget) {
      imgTarget.style.cssText = getImageStyle(imgAlign, imgSize);
      imgTarget.src = imgUrl;
    }
    setImgDialogOpen(false);
    setImgUrl("");
    setImgTarget(null);
  };

  const handleImgDialogDelete = () => {
    if (imgTarget) {
      imgTarget.remove();
    }
    setImgDialogOpen(false);
    setImgUrl("");
    setImgTarget(null);
  };

  useEffect(() => {
    const el = quillRef.current?.getEditor()?.root;
    if (!el) return;
    const handler = (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        const img = e.target;
        const style = img.style || {};
        const align = style.float === "left" ? "left" : style.float === "right" ? "right" : "center";
        const size = parseInt(style.width) || 80;
        setImgUrl(img.src);
        setImgAlign(align);
        setImgSize(size);
        setImgTarget(img);
        setImgDialogMode("edit");
        setImgDialogOpen(true);
      }
    };
    el.addEventListener("dblclick", handler);
    return () => el.removeEventListener("dblclick", handler);
  }, [form.description]);

  const [existingFile, setExistingFile] = useState("");
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  useEffect(() => {
    (async () => {
      try {
        const res = await window.axios.get("/api/marketing/categories");
        setCategories(res.data.data || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const res = await window.axios.get(`/api/marketing/announcements/${id}`);
          const d = res.data.data;
          setForm({
            title: d.title || "",
            description: d.description || "",
            category: d.category || "",
            status: d.status || "draft",
          });
          if (d.file_name) setExistingFile(d.file_name);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      })();
    }
  }, [id]);

  const handleCreateCategory = async () => {
    try {
      const res = await window.axios.post("/api/marketing/categories", newCategory);
      setCategories([...categories, res.data.data]);
      setForm({ ...form, category: newCategory.name });
      setDialogOpen(false);
      setNewCategory({ name: "", description: "" });
    } catch (e) {
      addToast({ message: "Error creating category", severity: "error" });
    }
  };

  const handleChange = (e) => {
    if (e.target.value === "__add_new__") {
      setDialogOpen(true);
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("status", form.status);
      if (file) fd.append("file", file);
      if (isEdit) fd.append("_method", "PUT");

      const url = isEdit
        ? `/api/marketing/announcements/${id}`
        : "/api/marketing/announcements";
      await window.axios.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast({ message: isEdit ? "Announcement updated successfully" : "Announcement created successfully", severity: "success" });
      navigate("/marketing/announcements");
    } catch (e) {
      console.error(e);
      addToast({ message: "Error saving announcement", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link", "image"],
        ["clean"],
      ],
      handlers: {
        image: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = handleImgFilePick;
          input.click();
        },
      },
    },
  }), []);

  if (loading) return <Box p={3} textAlign="center">Loading...</Box>;

  return (
    <Box pt={{ xs: 4, sm: 6 }} px={{ xs: 2, sm: 3 }}>
      <Typography variant="h5" mb={2}>{isEdit ? "Edit Announcement" : "New Announcement"}</Typography>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} required />

              <TextField fullWidth select label="Category" name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                ))}
                <MenuItem value="__add_new__">
                  <Box display="flex" alignItems="center" gap={0.5} color="primary.main">
                    <Add fontSize="small" /> Add new category
                  </Box>
                </MenuItem>
              </TextField>

              <Box>
                <Typography variant="subtitle2" mb={0.5}>Description</Typography>
                {uploadingContentImage && (
                  <Typography variant="caption" color="primary" display="block" mb={0.5}>
                    Uploading image...
                  </Typography>
                )}
                <Box sx={{ '& .ql-editor': { minHeight: 250 } }}>
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    modules={quillModules}
                    ref={quillRef}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  Double-click picha kwenye editor ili kubadilisha alignment, size, au kuifuta
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" mb={0.5}>Attachment</Typography>
                <Button variant="outlined" component="label">
                  {file ? file.name : existingFile ? "Change file" : "Choose file"}
                  <input type="file" hidden ref={fileRef} onChange={(e) => setFile(e.target.files[0])} />
                </Button>
                {existingFile && !file && (
                  <Typography variant="caption" ml={1} color="text.secondary">{existingFile}</Typography>
                )}
              </Box>

              <TextField fullWidth select label="Status" name="status" value={form.status} onChange={handleChange}>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>

              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outlined" onClick={() => navigate("/marketing/announcements")}>Cancel</Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Dialog open={imgDialogOpen} onClose={() => setImgDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {imgDialogMode === "insert" ? "Insert Image" : "Edit Image"}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {imgUrl && (
              <Box
                component="img"
                src={imgUrl}
                alt="preview"
                sx={{
                  width: "100%", maxHeight: 250, objectFit: "contain",
                  borderRadius: 2, bgcolor: "#f5f5f5", p: 1,
                }}
              />
            )}
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                fullWidth label="Image URL" size="small"
                value={imgUrl} onChange={(e) => setImgUrl(e.target.value)}
              />
              <Button variant="outlined" size="small" component="label" disabled={uploadingContentImage}>
                {uploadingContentImage ? "..." : "Replace"}
                <input type="file" accept="image/*" hidden onChange={handleImgReplacePick} />
              </Button>
            </Box>
            <Box>
              <Typography variant="caption" display="block" mb={0.5} fontWeight={600}>
                Alignment
              </Typography>
              <ToggleButtonGroup
                value={imgAlign} exclusive
                onChange={(_, v) => v && setImgAlign(v)}
                size="small"
              >
                <ToggleButton value="left"><FormatAlignLeft /></ToggleButton>
                <ToggleButton value="center"><FormatAlignCenter /></ToggleButton>
                <ToggleButton value="right"><FormatAlignRight /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="caption" display="block" mb={0.5} fontWeight={600}>
                Size: {imgSize}%
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {[25, 50, 75, 80, 100].map((s) => (
                  <Button
                    key={s} size="small"
                    variant={imgSize === s ? "contained" : "outlined"}
                    onClick={() => setImgSize(s)}
                    sx={{ minWidth: 48 }}
                  >
                    {s}%
                  </Button>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          {imgDialogMode === "edit" && (
            <Button color="error" onClick={handleImgDialogDelete}>Delete</Button>
          )}
          <Button onClick={() => setImgDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImgDialogInsert} disabled={!imgUrl}>
            {imgDialogMode === "insert" ? "Insert" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Category</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField fullWidth label="Name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required />
            <TextField fullWidth label="Description" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCategory} disabled={!newCategory.name}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementForm;
