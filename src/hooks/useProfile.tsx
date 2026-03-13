import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useProfile = () => {
  const { session } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        const fullName = data?.display_name ?? null;
        const names = fullName ? fullName.split(' ').slice(0, 2).join(' ') : null;
        setDisplayName(names);
      });
  }, [session?.user?.id]);

  return { displayName };
};
