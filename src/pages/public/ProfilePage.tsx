import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { session } = useAuth();
  const { displayName, updateDisplayName } = useProfile();
  const { toast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from("profiles")
      .select("email")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setEmail(data?.email ?? null));
  }, [session?.user?.id]);

  const handleEdit = () => {
    setEditName(displayName || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const success = await updateDisplayName(editName.trim());
    setIsSaving(false);

    if (success) {
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Name updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName("");
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <Card className="bg-[#111] border-[#222]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" /> My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#888] uppercase tracking-wider">Name</p>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="text-[#888] hover:text-white h-6 px-2"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#222] border-[#333] text-white"
                  placeholder="Enter your name"
                  disabled={isSaving}
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="border-[#333] text-[#888] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <p className="text-white text-lg font-semibold">{displayName ?? "—"}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Email</p>
            <p className="text-[#b0b0b0] flex items-center gap-2">
              <Mail className="w-4 h-4" /> {email ?? session?.user?.email ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
