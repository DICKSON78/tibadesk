import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Typography, MenuItem, Chip,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useToast } from "../../hooks";

const platformIcons = { facebook: "FB", instagram: "IG" };
const platformColors = { facebook: "#1877F2", instagram: "#E4405F" };

const SocialMediaAccounts = () => {
  const addToast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ platform: "facebook", account_name: "", page_id: "", access_token: "" });
  const [saving, setSaving] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await window.axios.get("/api/marketing/social-accounts");
      setAccounts(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleOpen = (account = null) => {
    if (account) {
      setEditTarget(account);
      setForm({ platform: account.platform, account_name: account.account_name, page_id: account.page_id || "", access_token: account.access_token || "" });
    } else {
      setEditTarget(null);
      setForm({ platform: "facebook", account_name: "", page_id: "", access_token: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        await window.axios.put(`/api/marketing/social-accounts/${editTarget.id}`, form);
        addToast({ message: "Account updated.", severity: "success" });
      } else {
        await window.axios.post("/api/marketing/social-accounts", { ...form, is_active: true });
        addToast({ message: "Account added.", severity: "success" });
      }
      setDialogOpen(false);
      fetchAccounts();
    } catch (e) {
      addToast({ message: e.response?.data?.message || "Error saving account", severity: "error" });
    } finally { setSaving(false); }
  };

  const handleToggle = async (account) => {
    try {
      await window.axios.patch(`/api/marketing/social-accounts/${account.id}/toggle`);
      addToast({ message: account.is_active ? "Account deactivated." : "Account activated.", severity: "success" });
      fetchAccounts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this account?")) return;
    try {
      await window.axios.delete(`/api/marketing/social-accounts/${id}`);
      addToast({ message: "Account deleted.", severity: "success" });
      fetchAccounts();
    } catch (e) { console.error(e); }
  };

  if (loading) return <Box p={3} textAlign="center">Loading...</Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Social Media Accounts</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Account</Button>
      </Box>

      <Card>
        <CardContent>
          {accounts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" mb={2}>No accounts connected.</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
                Add Account
              </Button>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Page/User ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Chip label={platformIcons[a.platform]} size="small" sx={{ bgcolor: platformColors[a.platform], color: "#fff", fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{a.account_name}</TableCell>
                    <TableCell>{a.page_id || "-"}</TableCell>
                    <TableCell>
                      <Switch checked={a.is_active} onChange={() => handleToggle(a)} size="small" color="success" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(a)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editTarget ? "Edit Account" : "Add Social Media Account"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField fullWidth select label="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
            </TextField>
            <TextField fullWidth label="Account Name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="e.g. TibaDesk" />
            <TextField fullWidth label={form.platform === "facebook" ? "Page ID" : "Instagram User ID"} value={form.page_id} onChange={(e) => setForm({ ...form, page_id: e.target.value })} placeholder={form.platform === "facebook" ? "383026921560020" : "17841400..."} />
            <TextField fullWidth label="Access Token" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} multiline rows={2} placeholder="Paste your access token here" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.account_name || !form.access_token}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialMediaAccounts;
