import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import DataTable, { Column } from "@/components/DataTable";
import FormDialog from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player { id: string; name: string; last_name: string; position: string; price: number; team_id: string; photo?: string; teams?: { name: string } }
interface Team { id: string; name: string; }

const POSITIONS = ["GK", "DEF", "MID", "FWD"];

const PlayersPage = () => {
  const [data, setData] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState({ name: "", last_name: "", position: "", price: "", team_id: "", photo: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchData = async () => {
    const [playersRes, teamsRes] = await Promise.all([
      supabase.from("players").select("*, teams(name)").order("last_name"),
      supabase.from("teams").select("*").order("name"),
    ]);
    if (playersRes.error) toast({ title: t("error"), description: playersRes.error.message, variant: "destructive" });
    else setData(playersRes.data || []);
    setTeams(teamsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", last_name: "", position: "", price: "", team_id: "", photo: "" }); setDialogOpen(true); };
  const openEdit = (p: Player) => { setEditing(p); setForm({ name: p.name, last_name: p.last_name, position: p.position, price: String(p.price), team_id: p.team_id, photo: p.photo || "" }); setDialogOpen(true); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let photoUrl = form.photo;

    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(fileName, photoFile);
      if (uploadError) {
        toast({ title: t("error"), description: uploadError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName);
      photoUrl = publicUrl;
    }

    const payload = { ...form, price: parseFloat(form.price), photo: photoUrl };
    const { error } = editing
      ? await supabase.from("players").update(payload).eq("id", editing.id)
      : await supabase.from("players").insert(payload);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else { setDialogOpen(false); setPhotoFile(null); fetchData(); }
    setSaving(false);
  };

  const handleDelete = async (p: Player) => {
    if (!confirm(t("deletePlayer"))) return;
    const { error } = await supabase.from("players").delete().eq("id", p.id);
    if (error) toast({ title: t("error"), description: error.message, variant: "destructive" });
    else fetchData();
  };

  const columns: Column<Player>[] = [
    { key: "name", label: t("firstName") },
    { key: "last_name", label: t("lastName") },
    { key: "position", label: t("position"), render: (p) => <span className="stat-badge bg-primary/10 text-primary">{p.position}</span> },
    { key: "price", label: t("price"), render: (p) => <span className="font-bold text-white">{Number(p.price).toFixed(1)}M</span> },
    { key: "photo", label: "Photo", render: (p) => p.photo ? <img src={p.photo} alt="Photo" className="w-8 h-8 rounded" /> : <span className="text-muted-foreground">No photo</span> },
    { key: "team_id", label: t("team"), render: (p) => p.teams?.name ?? "?" },
  ];

  return (
    <>
      <DataTable title={t("players")} columns={columns} data={data} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} loading={loading} />
      <FormDialog open={dialogOpen} onOpenChange={setDialogOpen} title={editing ? t("editPlayer") : t("addPlayer")} onSubmit={handleSubmit} loading={saving}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("firstName")}</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>{t("lastName")}</Label>
            <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("position")}</Label>
            <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))} required>
              <SelectTrigger><SelectValue placeholder={t("position")} /></SelectTrigger>
              <SelectContent>{POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("price")}</Label>
            <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("team")}</Label>
          <Select value={form.team_id} onValueChange={v => setForm(f => ({ ...f, team_id: v }))} required>
            <SelectTrigger><SelectValue placeholder={t("selectTeam")} /></SelectTrigger>
            <SelectContent>{teams.map(tm => <SelectItem key={tm.id} value={tm.id}>{tm.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Photo</Label>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {form.photo && <p className="text-sm text-muted-foreground">Current: {form.photo}</p>}
        </div>
      </FormDialog>
    </>
  );
};

export default PlayersPage;
