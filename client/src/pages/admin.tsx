import { useState, createContext, useContext, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  type SiteContent,
  type SiteLink,
  type SiteImage,
  type ContactMessage,
} from "@shared/schema";
import {
  FileText,
  Link2,
  ImageIcon,
  Plus,
  Trash2,
  Save,
  Upload,
  Edit3,
  X,
  ExternalLink,
  Lock,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";

type TabType = "content" | "links" | "images" | "messages";

const AdminAuthContext = createContext<{ token: string; logout: () => void }>({
  token: "",
  logout: () => {},
});

function useAdminToken() {
  return useContext(AdminAuthContext).token;
}

function adminFetch(token: string, url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
}

async function adminApiRequest(token: string, method: string, url: string, data?: unknown) {
  const res = await adminFetch(token, url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  return res;
}

function CopyButton({ text, label = "Copy URL" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Button size="sm" variant="outline" onClick={copy} className="gap-1.5 text-xs h-7 px-2">
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    text: "bg-slate-100 text-slate-600",
    richtext: "bg-blue-100 text-blue-700",
    heading: "bg-purple-100 text-purple-700",
    color: "bg-orange-100 text-orange-700",
    url: "bg-cyan-100 text-cyan-700",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${colors[type] ?? "bg-slate-100 text-slate-500"}`}>
      {type}
    </span>
  );
}

function AdminLoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (pw: string) => {
      console.log(`[DEBUG] [AdminLoginForm] CMS login attempt...`);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.warn(`[DEBUG] [AdminLoginForm] CMS login failed: ${data.message}`);
        throw new Error(data.message || "Invalid password");
      }
      return data;
    },
    onSuccess: (data: { token: string }) => {
      console.log(`[DEBUG] [AdminLoginForm] CMS login successful.`);
      onLogin(data.token);
    },
    onError: (err: Error) => {
      console.error(`[DEBUG] [AdminLoginForm] CMS login error:`, err);
      toast({ title: "Access Denied", description: err.message || "Invalid administrator password.", variant: "destructive" });
    },
  });

  return (
    <Layout>
      <div className="flex-grow flex items-center justify-center py-20">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Admin Access</CardTitle>
            <p className="text-slate-500 text-sm mt-1">Enter the administrator password to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(password); }} className="space-y-4">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Administrator password" data-testid="input-admin-password" autoComplete="off" />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending || !password} data-testid="button-admin-login">
                <ShieldCheck className="w-4 h-4 mr-2" />
                {loginMutation.isPending ? "Verifying..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function ContentManager() {
  const token = useAdminToken();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [newItem, setNewItem] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["general", "landing", "technology", "about", "contact", "footer", "branding"]));
  const blankForm = { key: "", value: "", type: "text", section: "general", label: "" };
  const [formData, setFormData] = useState(blankForm);

  const { data: content = [], isLoading, error: contentError } = useQuery<SiteContent[]>({
    queryKey: ["/api/admin/content"],
    queryFn: async () => {
      console.log(`[DEBUG] [ContentManager] Fetching site content blocks...`);
      const res = await adminFetch(token, "/api/admin/content");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (contentError) {
    console.error(`[DEBUG] [ContentManager] Content fetch error:`, contentError);
  }

  const createMutation = useMutation({
    mutationFn: async (data: typeof blankForm) => {
      console.log(`[DEBUG] [ContentManager] Creating block: ${data.key}`);
      const res = await adminApiRequest(token, "POST", "/api/admin/content", data);
      return res.json();
    },
    onSuccess: () => {
      console.log(`[DEBUG] [ContentManager] Block creation successful.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Saved", description: "Content block created." });
      setNewItem(false);
      setFormData(blankForm);
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [ContentManager] Creation error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof blankForm }) => {
      console.log(`[DEBUG] [ContentManager] Updating block ID ${id}...`);
      const res = await adminApiRequest(token, "PUT", `/api/admin/content/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      console.log(`[DEBUG] [ContentManager] Update successful.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Saved", description: "Content block updated." });
      setEditingId(null);
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [ContentManager] Update error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`[DEBUG] [ContentManager] Deleting block ID ${id}...`);
      await adminApiRequest(token, "DELETE", `/api/admin/content/${id}`);
    },
    onSuccess: () => {
      console.log(`[DEBUG] [ContentManager] Delete successful.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Deleted", description: "Content block removed." });
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [ContentManager] Delete error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (item: SiteContent) => {
      const res = await adminApiRequest(token, "POST", "/api/admin/content", {
        key: `${item.key}-copy`,
        value: item.value,
        type: item.type,
        section: item.section,
        label: `${item.label} (Copy)`,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({ title: "Duplicated", description: "Content block cloned." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const startEdit = (item: SiteContent) => {
    setEditingId(item.id);
    setFormData({ key: item.key, value: item.value, type: item.type, section: item.section, label: item.label });
    setNewItem(false);
  };

  const cancelEdit = () => { setEditingId(null); setFormData(blankForm); };

  const filtered = content.filter(c =>
    !search ||
    c.key.toLowerCase().includes(search.toLowerCase()) ||
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.section.toLowerCase().includes(search.toLowerCase()) ||
    c.value.toLowerCase().includes(search.toLowerCase())
  );

  const sections = Array.from(new Set(filtered.map(c => c.section))).sort();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section); else next.add(section);
      return next;
    });
  };

  const ContentForm = ({ onSave, onCancel, isPending }: { onSave: () => void; onCancel: () => void; isPending: boolean }) => (
    <div className="space-y-4 bg-blue-50/60 border border-primary/20 rounded-xl p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Unique Key</label>
          <Input value={formData.key} onChange={e => setFormData({ ...formData, key: e.target.value })}
            placeholder="e.g. hero-title" autoComplete="off" data-testid="input-content-key" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Label (display name)</label>
          <Input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g. Hero Section Title" autoComplete="off" data-testid="input-content-label" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Section / Page</label>
          <select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white" data-testid="select-content-section">
            <option value="general">general</option>
            <option value="landing">landing</option>
            <option value="technology">technology</option>
            <option value="about">about</option>
            <option value="contact">contact</option>
            <option value="footer">footer</option>
            <option value="branding">branding</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Content Type</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white" data-testid="select-content-type">
            <option value="text">Plain Text</option>
            <option value="heading">Heading</option>
            <option value="richtext">Rich Text / HTML</option>
            <option value="color">Color (hex)</option>
            <option value="url">URL / Link</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Value</label>
        {formData.type === "color" ? (
          <div className="flex items-center gap-3">
            <input type="color" value={formData.value || "#14558F"}
              onChange={e => setFormData({ ...formData, value: e.target.value })}
              className="w-12 h-10 rounded border border-slate-200 cursor-pointer p-0.5 bg-white" />
            <Input value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}
              placeholder="#14558F" className="font-mono flex-1" autoComplete="off" />
            <div className="w-10 h-10 rounded border border-slate-200 flex-shrink-0"
              style={{ backgroundColor: formData.value || "#14558F" }} />
          </div>
        ) : formData.type === "richtext" ? (
          <Textarea value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}
            placeholder="<p>HTML content here...</p>" rows={6} className="font-mono text-sm"
            data-testid="textarea-content-value" autoComplete="off" />
        ) : (
          <Textarea value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}
            placeholder="Content value..." rows={3} data-testid="textarea-content-value" autoComplete="off" />
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={isPending || !formData.key || !formData.value} data-testid="button-save-content">
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel-content">
          <X className="w-4 h-4 mr-2" />Cancel
        </Button>
      </div>
    </div>
  );

  if (isLoading) return <div className="text-slate-400 py-12 text-center">Loading content blocks...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search content..." className="pl-9" data-testid="input-content-search" />
        </div>
        <Button onClick={() => { setNewItem(true); setEditingId(null); setFormData(blankForm); }}
          className="flex items-center gap-2 flex-shrink-0" data-testid="button-add-content">
          <Plus className="w-4 h-4" />New Content Block
        </Button>
      </div>

      {newItem && (
        <ContentForm
          onSave={() => createMutation.mutate(formData)}
          onCancel={() => { setNewItem(false); setFormData(blankForm); }}
          isPending={createMutation.isPending}
        />
      )}

      {filtered.length === 0 && !newItem && (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">{search ? "No content matches your search." : "No content blocks yet. Click \"New Content Block\" to get started."}</p>
          </CardContent>
        </Card>
      )}

      {sections.map(section => {
        const items = filtered.filter(c => c.section === section);
        const isOpen = expandedSections.has(section);
        return (
          <div key={section} className="border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              data-testid={`button-toggle-section-${section}`}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="font-semibold text-slate-800 capitalize">{section}</span>
                <span className="text-xs text-slate-400 font-mono">({items.length})</span>
              </div>
              {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            </button>

            {isOpen && (
              <div className="divide-y divide-slate-100">
                {items.map(item => (
                  <div key={item.id}>
                    <div className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-slate-800 text-sm">{item.label || item.key}</span>
                            <TypeBadge type={item.type} />
                            <span className="font-mono text-xs text-slate-400">{item.key}</span>
                          </div>
                          {item.type === "color" ? (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: item.value }} />
                              <span className="font-mono text-xs text-slate-500">{item.value}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500 truncate mt-1 max-w-lg">{item.value}</p>
                          )}
                          <p className="text-[10px] text-slate-300 mt-1">
                            Updated {new Date(item.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(item)}
                            className="h-8 px-2 text-slate-500 hover:text-primary" title="Edit"
                            data-testid={`button-edit-content-${item.id}`}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => duplicateMutation.mutate(item)}
                            className="h-8 px-2 text-slate-500 hover:text-blue-600" title="Duplicate"
                            data-testid={`button-duplicate-content-${item.id}`}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}
                            className="h-8 px-2 text-slate-400 hover:text-red-600" title="Delete"
                            data-testid={`button-delete-content-${item.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {editingId === item.id && (
                      <div className="px-5 py-4 bg-blue-50/40 border-t border-primary/10">
                        <ContentForm
                          onSave={() => updateMutation.mutate({ id: item.id, data: formData })}
                          onCancel={cancelEdit}
                          isPending={updateMutation.isPending}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LinksManager() {
  const token = useAdminToken();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const blankForm = { label: "", url: "", section: "footer" as string, order: 0, isActive: true };
  const [formData, setFormData] = useState(blankForm);

  const { data: links = [], isLoading, error: linksError } = useQuery<SiteLink[]>({
    queryKey: ["/api/admin/links"],
    queryFn: async () => {
      console.log(`[DEBUG] [LinksManager] Fetching site links...`);
      const res = await adminFetch(token, "/api/admin/links");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (linksError) {
    console.error(`[DEBUG] [LinksManager] Links fetch error:`, linksError);
  }

  const createMutation = useMutation({
    mutationFn: async (data: typeof blankForm) => {
      console.log(`[DEBUG] [LinksManager] Creating link: ${data.label}`);
      const res = await adminApiRequest(token, "POST", "/api/admin/links", data);
      return res.json();
    },
    onSuccess: () => {
      console.log(`[DEBUG] [LinksManager] Link created.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/links"] });
      toast({ title: "Saved", description: "Link created." });
      setShowForm(false);
      setFormData(blankForm);
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [LinksManager] Create error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof blankForm> }) => {
      console.log(`[DEBUG] [LinksManager] Updating link ID ${id}...`);
      const res = await adminApiRequest(token, "PATCH", `/api/admin/links/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      console.log(`[DEBUG] [LinksManager] Link updated.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/links"] });
      toast({ title: "Saved", description: "Link updated." });
      setEditingId(null);
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [LinksManager] Update error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`[DEBUG] [LinksManager] Deleting link ID ${id}...`);
      await adminApiRequest(token, "DELETE", `/api/admin/links/${id}`);
    },
    onSuccess: () => {
      console.log(`[DEBUG] [LinksManager] Link deleted.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/links"] });
      toast({ title: "Deleted", description: "Link removed." });
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [LinksManager] Delete error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const startEdit = (link: SiteLink) => {
    setEditingId(link.id);
    setFormData({ label: link.label, url: link.url, section: link.section, order: link.order, isActive: link.isActive });
    setShowForm(false);
  };

  const LinkForm = ({ onSave, onCancel, isPending }: { onSave: () => void; onCancel: () => void; isPending: boolean }) => (
    <div className="space-y-4 bg-blue-50/60 border border-primary/20 rounded-xl p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Label</label>
          <Input value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g. Our Blog" autoComplete="off" data-testid="input-link-label" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">URL</label>
          <Input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com" autoComplete="off" data-testid="input-link-url" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Section</label>
          <select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white" data-testid="select-link-section">
            <option value="header">header</option>
            <option value="footer">footer</option>
            <option value="sidebar">sidebar</option>
            <option value="general">general</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Display Order</label>
          <Input type="number" value={formData.order}
            onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
            data-testid="input-link-order" autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Status</label>
          <select value={formData.isActive ? "active" : "inactive"}
            onChange={e => setFormData({ ...formData, isActive: e.target.value === "active" })}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={isPending || !formData.label || !formData.url} data-testid="button-save-link">
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save Link"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />Cancel
        </Button>
      </div>
    </div>
  );

  if (isLoading) return <div className="text-slate-400 py-12 text-center">Loading links...</div>;

  const sections = Array.from(new Set(links.map(l => l.section))).sort();

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Site Links</h2>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData(blankForm); }}
          className="flex items-center gap-2" data-testid="button-add-link">
          <Plus className="w-4 h-4" />Add Link
        </Button>
      </div>

      {showForm && (
        <LinkForm
          onSave={() => createMutation.mutate(formData)}
          onCancel={() => { setShowForm(false); setFormData(blankForm); }}
          isPending={createMutation.isPending}
        />
      )}

      {links.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <Link2 className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">No links yet. Click "Add Link" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        sections.map(section => (
          <div key={section}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pl-1">{section}</h3>
            <div className="space-y-2">
              {links.filter(l => l.section === section).map(link => (
                <div key={link.id}>
                  <Card className={link.isActive ? "" : "opacity-60"}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ExternalLink className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="font-semibold text-slate-800 text-sm">{link.label}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">order: {link.order}</span>
                            {!link.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">INACTIVE</span>}
                          </div>
                          <a href={link.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate block mt-0.5">{link.url}</a>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(link)}
                            className="h-7 px-2 text-slate-500 hover:text-primary" title="Edit"
                            data-testid={`button-edit-link-${link.id}`}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => updateMutation.mutate({ id: link.id, data: { isActive: !link.isActive } })}
                            className="h-7 px-2 text-slate-500" title={link.isActive ? "Deactivate" : "Activate"}
                            data-testid={`button-toggle-link-${link.id}`}>
                            {link.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(link.id)}
                            className="h-7 px-2 text-slate-400 hover:text-red-600" title="Delete"
                            data-testid={`button-delete-link-${link.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {editingId === link.id && (
                    <div className="mt-2">
                      <LinkForm
                        onSave={() => updateMutation.mutate({ id: link.id, data: formData })}
                        onCancel={() => { setEditingId(null); setFormData(blankForm); }}
                        isPending={updateMutation.isPending}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ImagesManager() {
  const token = useAdminToken();
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadSection, setUploadSection] = useState("general");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images = [], isLoading, error: imagesError } = useQuery<SiteImage[]>({
    queryKey: ["/api/admin/images"],
    queryFn: async () => {
      console.log(`[DEBUG] [ImagesManager] Fetching site images...`);
      const res = await adminFetch(token, "/api/admin/images");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (imagesError) {
    console.error(`[DEBUG] [ImagesManager] Images fetch error:`, imagesError);
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      console.log(`[DEBUG] [ImagesManager] Uploading image: ${selectedFile.name}`);
      const fd = new FormData();
      fd.append("image", selectedFile);
      fd.append("name", uploadName || selectedFile.name);
      fd.append("altText", uploadAlt);
      fd.append("section", uploadSection);
      const res = await adminFetch(token, "/api/admin/images", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload failed");
      return res.json();
    },
    onSuccess: () => {
      console.log(`[DEBUG] [ImagesManager] Upload successful.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/images"] });
      toast({ title: "Uploaded", description: "Image uploaded successfully." });
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadName("");
      setUploadAlt("");
      setUploadSection("general");
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [ImagesManager] Upload error:`, e);
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`[DEBUG] [ImagesManager] Deleting image ID ${id}...`);
      await adminApiRequest(token, "DELETE", `/api/admin/images/${id}`);
    },
    onSuccess: () => {
      console.log(`[DEBUG] [ImagesManager] Delete successful.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/images"] });
      toast({ title: "Deleted", description: "Image removed." });
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [ImagesManager] Delete error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadName(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = e => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    if (!showUpload) setShowUpload(true);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const sections = Array.from(new Set(images.map(img => img.section))).sort();

  if (isLoading) return <div className="text-slate-400 py-12 text-center">Loading images...</div>;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Image Library</h2>
        <Button onClick={() => { setShowUpload(!showUpload); if (!showUpload) fileInputRef.current?.click(); }}
          className="flex items-center gap-2" data-testid="button-upload-image">
          <Upload className="w-4 h-4" />Upload Image
        </Button>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl transition-all ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : showUpload ? "border-primary/30 bg-blue-50/30" : "border-slate-200 bg-slate-50/50 cursor-pointer hover:border-primary/40"}`}
        onClick={() => { if (!showUpload) { setShowUpload(true); } }}
        data-testid="dropzone-image-upload"
      >
        {showUpload ? (
          <div className="p-5 space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50"}`}
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={previewUrl} alt="Preview" className="max-h-36 max-w-xs rounded-lg shadow object-contain" />
                  <p className="text-xs text-slate-500">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                  <p className="text-sm font-medium">Click to browse or drag and drop here</p>
                  <p className="text-xs">JPEG, PNG, WebP, GIF — max 5 MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              data-testid="input-file-upload" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Image Name</label>
                <Input value={uploadName} onChange={e => setUploadName(e.target.value)}
                  placeholder="My Image" autoComplete="off" data-testid="input-image-name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Alt Text</label>
                <Input value={uploadAlt} onChange={e => setUploadAlt(e.target.value)}
                  placeholder="Descriptive alt text" autoComplete="off" data-testid="input-image-alt" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Section</label>
                <select value={uploadSection} onChange={e => setUploadSection(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm bg-white" data-testid="select-image-section">
                  <option value="general">general</option>
                  <option value="landing">landing</option>
                  <option value="technology">technology</option>
                  <option value="about">about</option>
                  <option value="branding">branding</option>
                  <option value="pillar">pillar</option>
                  <option value="hero">hero</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending || !selectedFile}
                data-testid="button-confirm-upload">
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="outline" onClick={() => { setShowUpload(false); setSelectedFile(null); setPreviewUrl(null); }}>
                <X className="w-4 h-4 mr-2" />Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-slate-400">
            Drop an image file here to begin uploading
          </div>
        )}
      </div>

      {images.length === 0 && !showUpload && (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">No images uploaded yet.</p>
          </CardContent>
        </Card>
      )}

      {sections.map(section => (
        <div key={section}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 pl-1">{section}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.filter(img => img.section === section).map(img => (
              <div key={img.id}
                className="group relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:border-primary/40 hover:shadow-md transition-all"
                data-testid={`card-image-${img.id}`}>
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img src={img.url} alt={img.altText || img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-slate-700 truncate" data-testid={`text-image-name-${img.id}`}>{img.name}</p>
                  {img.altText && <p className="text-[10px] text-slate-400 truncate mt-0.5">{img.altText}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <CopyButton text={`${window.location.origin}${img.url}`} label="URL" />
                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(img.id)}
                      className="h-7 px-2 text-slate-400 hover:text-red-600 ml-auto"
                      data-testid={`button-delete-image-${img.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesManager() {
  const token = useAdminToken();
  const { toast } = useToast();

  const { data: messages = [], isLoading, error: messagesError } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/messages"],
    queryFn: async () => {
      console.log(`[DEBUG] [MessagesManager] Fetching contact messages...`);
      const res = await adminFetch(token, "/api/admin/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (messagesError) {
    console.error(`[DEBUG] [MessagesManager] Messages fetch error:`, messagesError);
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`[DEBUG] [MessagesManager] Deleting message ID ${id}...`);
      await adminApiRequest(token, "DELETE", `/api/admin/messages/${id}`);
    },
    onSuccess: () => {
      console.log(`[DEBUG] [MessagesManager] Delete successful.`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      toast({ title: "Deleted", description: "Message removed." });
    },
    onError: (e: Error) => {
      console.error(`[DEBUG] [MessagesManager] Delete error:`, e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  });

  if (isLoading) return <div className="text-slate-400 py-12 text-center">Loading messages...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Contact Messages</h2>
        <span className="text-xs text-slate-400 font-mono">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-sm">No messages yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <Card key={msg.id} data-testid={`card-message-${msg.id}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="font-bold text-slate-900" data-testid={`text-message-name-${msg.id}`}>{msg.name}</span>
                      {msg.email && (
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                          data-testid={`link-message-email-${msg.id}`}>
                          <Mail className="w-3.5 h-3.5" />{msg.email}
                        </a>
                      )}
                      {msg.phone && (
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Phone className="w-3.5 h-3.5" />{msg.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap"
                      data-testid={`text-message-body-${msg.id}`}>{msg.message}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(msg.id)}
                    className="text-slate-400 hover:text-red-600 flex-shrink-0 h-8 px-2"
                    data-testid={`button-delete-message-${msg.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("content");

  if (!token) {
    return <AdminLoginForm onLogin={(t) => setToken(t)} />;
  }

  const logout = () => {
    console.log(`[DEBUG] [AdminPage] Sign out triggered.`);
    fetch("/api/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setToken(null);
  };

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "content", label: "Content", icon: FileText },
    { key: "links", label: "Links", icon: Link2 },
    { key: "images", label: "Images", icon: ImageIcon },
    { key: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <AdminAuthContext.Provider value={{ token, logout }}>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-10 w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900" data-testid="text-admin-title">
                Site Administration
              </h1>
              <p className="text-slate-500 text-sm mt-1">Manage content, media, links, and inquiries</p>
            </div>
            <Button variant="outline" onClick={logout} className="flex items-center gap-2" data-testid="button-admin-logout">
              <LogOut className="w-4 h-4" />Sign Out
            </Button>
          </div>

          <div className="flex gap-0 mb-8 border-b border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === tab.key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
                data-testid={`tab-${tab.key}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === "content" && <ContentManager />}
            {activeTab === "links" && <LinksManager />}
            {activeTab === "images" && <ImagesManager />}
            {activeTab === "messages" && <MessagesManager />}
          </div>
        </div>
      </Layout>
    </AdminAuthContext.Provider>
  );
}
