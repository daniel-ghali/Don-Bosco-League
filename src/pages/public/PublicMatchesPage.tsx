import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, Calendar, ChevronRight, Trophy, LayoutGrid, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── TeamCrest Component ─────────────────────────────────── */
const TeamCrest = ({ name, size = 32 }: { name: string; size?: number }) => (
  <motion.div 
    whileHover={{ scale: 1.05, rotate: 2 }}
    style={{
      width: size, height: size, borderRadius: size / 4,
    }}
    className="bg-secondary border border-border flex items-center justify-center flex-shrink-0 shadow-md font-display font-bold text-foreground"
  >
    <span style={{ fontSize: size * 0.45 }}>{name?.charAt(0)?.toUpperCase() ?? "?"}</span>
  </motion.div>
);

/* ─── Main page ──────────────────────────────────────────────────── */
const PublicMatchesPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [gameweeks, setGameweeks] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedGameweek, setSelectedGameweek] = useState<string>("all");
  const [motmPlayer, setMotmPlayer] = useState<{ name: string; last_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── filters ─────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchFilters = async () => {
      const { data: sData } = await supabase.from("seasons").select("*").order("number");
      const { data: gwData } = await supabase.from("gameweeks").select("*, seasons(number)").order("number");
      setSeasons(sData || []);
      setGameweeks(gwData || []);
    };
    fetchFilters();
  }, []);

  /* ── matches + MOTM ──────────────────────────────────────────── */
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);

      const { data: motmData } = await supabase
        .from("matches")
        .select("motm_player:players!matches_motm_player_id_fkey(name, last_name)")
        .not("motm_player_id", "is", null)
        .order("date", { ascending: false })
        .limit(1)
        .single();
      
      if (motmData?.motm_player) setMotmPlayer(motmData.motm_player as any);

      let query = supabase
        .from("matches")
        .select("*, team1:teams!matches_team1_id_fkey(name, logo_url), team2:teams!matches_team2_id_fkey(name, logo_url), gameweeks(number, season_id, seasons(number)), team_match_stats(team_id, goals_scored)")
        .order("date", { ascending: false });

      if (selectedGameweek !== "all") query = query.eq("gameweek_id", selectedGameweek);

      const { data } = await query;
      let filtered = data || [];
      if (selectedSeason !== "all") {
        filtered = filtered.filter((m: any) => m.gameweeks?.season_id === selectedSeason);
      }
      setMatches(filtered);
      setLoading(false);
    };
    fetchMatches();
  }, [selectedSeason, selectedGameweek]);

  const getScore = (match: any) => {
    const stats = match.team_match_stats || [];
    const t1 = stats.find((s: any) => s.team_id === match.team1_id);
    const t2 = stats.find((s: any) => s.team_id === match.team2_id);
    if (t1 && t2) return { t1: t1.goals_scored, t2: t2.goals_scored };
    return null;
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } catch { return d; }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="relative z-10 space-y-12">
        
        {/* ── 1. Hero Bento Grid ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Hero Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden group border border-border"
          >
            <img
              src="/football_crowd_hero.png"
              alt="Don Bosco Stadium"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 sm:p-10 space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success text-success-foreground font-bold tracking-wider uppercase text-xs"
              >
                <Zap size={14} />
                Live Coverage
              </motion.div>
              <h1 className="font-display text-4xl sm:text-6xl tracking-wide leading-none text-foreground max-w-2xl">
                Don Bosco Football<br />
                <span className="text-muted-foreground">Digital Stream</span>
              </h1>
            </div>
          </motion.div>

          {/* MOTM Feature Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-secondary to-muted border border-border flex flex-col group"
          >
            <div className="relative flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-success/20 blur-2xl rounded-full transition-colors" />
                <div className="relative w-32 h-32 rounded-2xl border-2 border-border overflow-hidden bg-card text-card-foreground flex items-center justify-center shadow-lg">
                  <img
                    src="/player_motm.png"
                    alt="Man of the Match"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-success text-success-foreground p-2 rounded-xl shadow-lg border border-border">
                  <Trophy size={16} />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Featured Performer</p>
                <h3 className="font-display text-2xl tracking-wide leading-none truncate w-full">
                  {motmPlayer ? `${motmPlayer.name} ${motmPlayer.last_name}` : "Selection Pending"}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-card/50 backdrop-blur-xl border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Man of the Match</span>
                <span className="text-success">Latest</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── 2. Filters & Actions ───────────────────────────────────── */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-secondary border border-border text-foreground">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide uppercase">Latest Matches</h2>
              <p className="text-sm text-muted-foreground font-medium">Season statistics and results</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 p-1.5 bg-secondary border border-border rounded-xl">
              <div className="px-3 text-muted-foreground">
                <Filter size={14} />
              </div>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="h-9 w-[120px] bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-wider">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {seasons.map(s => <SelectItem key={s.id} value={s.id}>Season {s.number}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <Select value={selectedGameweek} onValueChange={setSelectedGameweek}>
                <SelectTrigger className="h-9 w-[130px] bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-wider">
                  <SelectValue placeholder="Gameweek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {gameweeks.map(gw => <SelectItem key={gw.id} value={gw.id}>GW {gw.number}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* ── 3. Matches Grid ────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl border border-border bg-card animate-pulse" />
                ))
              ) : matches.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-secondary text-muted-foreground">
                    <Zap size={32} />
                  </div>
                  <p className="text-muted-foreground font-medium">No matches available for this selection</p>
                </div>
              ) : (
                matches.map((m, idx) => {
                  const score = getScore(m);
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative"
                    >
                      <Link 
                        to={`/matches/${m.id}`}
                        className="block h-full p-5 rounded-2xl bg-card border border-border hover:border-success/30 transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-4">
                            {/* Team 1 */}
                            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                              <TeamCrest name={m.team1?.name} size={48} />
                              <span className="text-sm font-semibold truncate w-full text-center">
                                {m.team1?.name}
                              </span>
                            </div>

                            {/* Score/VS */}
                            <div className="flex flex-col items-center gap-1.5 px-4 w-28">
                              {score ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="font-display text-3xl font-black">{score.t1}</span>
                                  <span className="text-muted-foreground font-black text-xl">:</span>
                                  <span className="font-display text-3xl font-black">{score.t2}</span>
                                </div>
                              ) : (
                                <div className="font-display text-2xl text-muted-foreground tracking-wider mb-2">VS</div>
                              )}
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Full Time</span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                              <TeamCrest name={m.team2?.name} size={48} />
                              <span className="text-sm font-semibold truncate w-full text-center">
                                {m.team2?.name}
                              </span>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-muted-foreground" />
                              {m.date ? m.date.slice(0, 5) : "--:--"}
                            </span>
                            <div className="w-[3px] h-[3px] bg-muted-foreground rounded-full" />
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-muted-foreground" />
                              {formatDate(m.date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-success opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Details <ChevronRight size={12} />
                          </div>
                        </div>

                        {/* Decorative accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-success/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PublicMatchesPage;
