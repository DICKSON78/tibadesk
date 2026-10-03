import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, FormGroup, Typography,
} from "@mui/material";
import { ArrowBack, Delete, Edit, OpenInNew, Share } from "@mui/icons-material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../hooks";

const BlogPostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFB, setShareFB] = useState(false);
  const [shareIG, setShareIG] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await window.axios.get(`/api/marketing/blog-posts/${id}`);
      setPost(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleShareClick = () => {
    setShareFB(false);
    setShareIG(false);
    setShareModalOpen(true);
  };

  const handleShareFromModal = async () => {
    if (!shareFB && !shareIG) { setShareModalOpen(false); return; }

    const platforms = [];
    if (shareFB) platforms.push("facebook");
    if (shareIG) platforms.push("instagram");

    setSharing(true);
    try {
      const res = await window.axios.post(`/api/marketing/blog-posts/${id}/share`, { platforms });
      addToast({ message: res.data?.message || "Shared successfully", severity: "success" });
      fetchPost();
    } catch (e) {
      addToast({ message: e.response?.data?.message || "Error sharing", severity: "warning" });
    } finally {
      setSharing(false);
      setShareModalOpen(false);
    }
  };

  const handleUnshare = async (platform) => {
    const label = platform === "facebook" ? "Facebook" : "Instagram";
    if (!confirm(`Remove this post from ${label}?`)) return;
    try {
      await window.axios.post(`/api/marketing/blog-posts/${id}/unshare/${platform}`);
      addToast({ message: `Unshared from ${label}`, severity: "success" });
      fetchPost();
    } catch (e) {
      addToast({ message: e.response?.data?.message || `Error unsharing from ${label}`, severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await window.axios.delete(`/api/marketing/blog-posts/${id}`);
      addToast({ message: "Post deleted successfully", severity: "success" });
      navigate("/marketing/blog");
    } catch (e) {
      addToast({ message: "Error deleting post", severity: "error" });
    }
  };

  if (loading) return <Box p={3} textAlign="center">Loading...</Box>;
  if (!post) return <Typography>Not found</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/marketing/blog")}>Back</Button>
        <Box display="flex" gap={1}>
          {post.status === "published" && (
            <Button variant="outlined" startIcon={<Share />} onClick={handleShareClick} disabled={sharing}>
              Share
            </Button>
          )}
          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/marketing/blog/${id}/edit`)}>
            Edit
          </Button>
          {post.status === "published" && (
            <Button variant="outlined" startIcon={<OpenInNew />} onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
              View on Site
            </Button>
          )}
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setDeleteConfirm(true)}>
            Delete
          </Button>
        </Box>
      </Box>
      <Card>
        <CardContent>
          <Typography variant="h4">{post.title}</Typography>
          <Box display="flex" gap={1} my={1} flexWrap="wrap" alignItems="center">
            {post.category && <Chip label={post.category} size="small" />}
            <Chip label={post.status} size="small" color={post.status === "published" ? "success" : "warning"} />
            {post.shared_to_facebook && (
              <Chip
                icon={<FacebookIcon sx={{ color: "#fff !important", fontSize: 16 }} />}
                label="Facebook"
                size="small"
                deletable
                onDelete={() => handleUnshare("facebook")}
                sx={{ bgcolor: "#1877F2", color: "#fff", "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } } }}
              />
            )}
            {post.shared_to_instagram && (
              <Chip
                icon={<InstagramIcon sx={{ color: "#fff !important", fontSize: 16 }} />}
                label="Instagram"
                size="small"
                deletable
                onDelete={() => handleUnshare("instagram")}
                sx={{ bgcolor: "#E4405F", color: "#fff", "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } } }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            By {post.creator?.name} {post.published_at ? `• ${new Date(post.published_at).toLocaleDateString()}` : ""}
          </Typography>
          {post.excerpt && <Typography variant="subtitle1" color="text.secondary" mb={2}>{post.excerpt}</Typography>}
          {post.featured_image && <Box component="img" src={post.featured_image} alt="" sx={{ width: "100%", maxHeight: 500, objectFit: "cover", borderRadius: 2, mb: 2 }} />}
          {post.video_url && (
            <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9", bgcolor: "#000", borderRadius: 2, overflow: "hidden", mb: 2, boxShadow: "0 8px 30px rgba(0,0,0,.15)" }}>
              <video src={post.video_url} controls playsInline style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "block" }} />
            </Box>
          )}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </CardContent>
      </Card>

      <Dialog open={shareModalOpen} onClose={() => setShareModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Share to Social Media</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose where to share this post:
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareFB}
                  onChange={(e) => setShareFB(e.target.checked)}
                  sx={{ color: "#1877F2", "&.Mui-checked": { color: "#1877F2" } }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <FacebookIcon sx={{ color: "#1877F2" }} />
                  <Typography variant="body2">Facebook</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareIG}
                  onChange={(e) => setShareIG(e.target.checked)}
                  sx={{ color: "#E4405F", "&.Mui-checked": { color: "#E4405F" } }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <InstagramIcon sx={{ color: "#E4405F" }} />
                  <Typography variant="body2">Instagram</Typography>
                </Box>
              }
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleShareFromModal} disabled={sharing}>
            {sharing ? "Sharing..." : "Share"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this post? This will also remove it from any connected social media accounts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogPostView;
