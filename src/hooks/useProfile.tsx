import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useProfile = () => {
  const { session } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  const fetchDisplayName = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .maybeSingle();
    const fullName = data?.display_name ?? null;
    const names = fullName ? fullName.split(' ').slice(0, 2).join(' ') : null;
    setDisplayName(names);
  };

  const updateDisplayName = async (newName: string) => {
    if (!session?.user?.id) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: newName })
      .eq("id", session.user.id);
    if (!error) {
      await fetchDisplayName(); // Refresh the display name
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchDisplayName();
  }, [session?.user?.id]);

  return { displayName, updateDisplayName };
};
