import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, FormGroup, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography,
} from "@mui/material";
import { Add, Delete, Edit, OpenInNew, Share, Visibility } from "@mui/icons-material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks";

const BlogPostList = () => {
  const navigate = useNavigate();
  const addToast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [shareFB, setShareFB] = useState(false);
  const [shareIG, setShareIG] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await window.axios.get("/api/marketing/blog-posts", {
        params: { per_page: rowsPerPage, page: page + 1 },
      });
      setData(res.data.data?.data || []);
      setTotal(res.data.data?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, rowsPerPage]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await window.axios.delete(`/api/marketing/blog-posts/${deleteTarget}`);
      addToast({ message: "Post deleted successfully", severity: "success" });
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      addToast({ message: "Error deleting post", severity: "error" });
      console.error(e);
    }
  };

  const handleShareClick = (row) => {
    setSharePostId(row.id);
    setShareFB(false);
    setShareIG(false);
    setShareModalOpen(true);
  };

  const handleShareFromModal = async () => {
    if (!shareFB && !shareIG) {
      setShareModalOpen(false);
      return;
    }

    const platforms = [];
    if (shareFB) platforms.push("facebook");
    if (shareIG) platforms.push("instagram");

    setSharingId(sharePostId);
    setShareModalOpen(false);
    try {
      const res = await window.axios.post(`/api/marketing/blog-posts/${sharePostId}/share`, { platforms });
      addToast({ message: res.data?.message || "Shared successfully", severity: "success" });
      fetchData();
    } catch (e) {
      const msg = e.response?.data?.message || "Error sharing to social media";
      addToast({ message: msg, severity: "warning" });
    } finally {
      setSharingId(null);
    }
  };

  const handleUnshare = async (row, platform) => {
    const label = platform === "facebook" ? "Facebook" : "Instagram";
    if (!confirm(`Remove this post from ${label}?`)) return;

    try {
      await window.axios.post(`/api/marketing/blog-posts/${row.id}/unshare/${platform}`);
      addToast({ message: `Unshared from ${label}`, severity: "success" });
      fetchData();
    } catch (e) {
      addToast({ message: e.response?.data?.message || `Error unsharing from ${label}`, severity: "error" });
    }
  };

  const statusColor = (s) => s === "published" ? "success" : "warning";

  return (
    <Box pt={{ xs: 4, sm: 6 }} px={{ xs: 2, sm: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5">Blog Content Portal</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage content for the public blog — create, edit, and publish posts
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<OpenInNew />}
            onClick={() => window.open("/blog", "_blank")}
          >
            View Blog
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/marketing/blog/create")}>
            New Post
          </Button>
        </Box>
      </Box>
      <Card>
        {loading ? <Box p={3} textAlign="center">Loading...</Box> : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Social</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Published</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.category || "-"}</TableCell>
                      <TableCell><Chip label={row.status} size="small" color={statusColor(row.status)} /></TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} alignItems="center">
                          {row.shared_to_facebook && (
                            <Chip
                              icon={<FacebookIcon sx={{ color: "#fff !important", fontSize: 16 }} />}
                              label="FB"
                              size="small"
                              deletable
                              onDelete={() => handleUnshare(row, "facebook")}
                              deleteIcon={<Delete sx={{ fontSize: 14 }} />}
                              sx={{ bgcolor: "#1877F2", color: "#fff", "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } } }}
                            />
                          )}
                          {row.shared_to_instagram && (
                            <Chip
                              icon={<InstagramIcon sx={{ color: "#fff !important", fontSize: 16 }} />}
                              label="IG"
                              size="small"
                              deletable
                              onDelete={() => handleUnshare(row, "instagram")}
                              deleteIcon={<Delete sx={{ fontSize: 14 }} />}
                              sx={{ bgcolor: "#E4405F", color: "#fff", "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } } }}
                            />
                          )}
                          {!row.shared_to_facebook && !row.shared_to_instagram && <span style={{ color: "#999", fontSize: 12 }}>-</span>}
                        </Box>
                      </TableCell>
                      <TableCell>{row.creator?.name || "-"}</TableCell>
                      <TableCell>{row.published_at ? new Date(row.published_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell align="center">
                        {row.status === "published" && (
                          <Tooltip title={sharingId === row.id ? "Sharing..." : "Share to Social Media"}>
                            <IconButton size="small" disabled={sharingId === row.id} onClick={() => handleShareClick(row)}>
                              <Share />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/marketing/blog/${row.id}`)}><Visibility /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/marketing/blog/${row.id}/edit`)}><Edit /></IconButton></Tooltip>
                        {row.status === "published" && (
                          <Tooltip title="View on site">
                            <IconButton size="small" onClick={() => window.open(`/blog/${row.slug}`, "_blank")}>
                              <OpenInNew />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteTarget(row.id)}><Delete /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
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
          <Button variant="contained" onClick={handleShareFromModal}>Share</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete this post? This will also remove it from any connected social media accounts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogPostList;
