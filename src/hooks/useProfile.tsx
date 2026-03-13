import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useProfile = () => {
  const { session } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  const fetchDisplayName = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .maybeSingle();
    const fullName = data?.display_name ?? null;
    const names = fullName ? fullName.split(' ').slice(0, 2).join(' ') : null;
    setDisplayName(names);
  }, [session?.user?.id]);

  const updateDisplayName = async (newName: string) => {
    if (!session?.user?.id) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newName })
      .eq("id", session.user.id);
    if (error) {
      console.error("Error updating display name:", error);
      return false;
    }
    // Directly update the state with the truncated name
    const names = newName ? newName.split(' ').slice(0, 2).join(' ') : null;
    setDisplayName(names);
    return true;
  };

  useEffect(() => {
    fetchDisplayName();
  }, [fetchDisplayName]);

  return { displayName, updateDisplayName };
};
