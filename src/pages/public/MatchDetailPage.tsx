import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const StatBar = ({ label, left, right }: { label: string; left: number; right: number }) => {
  const total = left + right || 1;
  const pLeft = (left / total) * 100;
  const pRight = (right / total) * 100;
  return (
    <div className="flex items-center gap-3 text-xs md:text-sm">
      <span className="w-8 text-right font-bold text-info">{left}</span>
      <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-muted">
        <div className="bg-info rounded-l-full" style={{ width: `${pLeft}%` }} />
        <div className="bg-success rounded-r-full" style={{ width: `${pRight}%` }} />
      </div>
      <span className="w-8 font-bold text-success">{right}</span>
      <span className="w-28 text-[10px] md:text-xs text-muted-foreground uppercase font-bold tracking-wider">
        {label}
      </span>
    </div>
  );
};

const PlayerList = ({
  teamName,
  players,
  align,
}: {
  teamName: string | undefined;
  players: any[];
  align: "left" | "right";
}) => {
  const isRight = align === "right";
  return (
    <div>
      <div className={`mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground ${isRight ? "text-right" : ""}`}>
        {teamName || "Team"}
      </div>
      {players.length === 0 ? (
        <p className={`text-xs text-muted-foreground ${isRight ? "text-right" : ""}`}>No player data</p>
      ) : (
        <div className="space-y-2">
          {players.map((p, index) => {
            const number = index + 1;
            const name = `${p.players?.name ?? ""} ${p.players?.last_name ?? ""}`.trim();
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between text-xs md:text-sm ${isRight ? "flex-row-reverse" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary border border-border text-[11px] font-semibold text-foreground">
                    {number}
                  </span>
                  <span className="font-medium truncate max-w-[120px] sm:max-w-none">{name || "Unknown"}</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] text-muted-foreground ${isRight ? "flex-row-reverse" : ""}`}>
                  {p.goals > 0 && <span className="text-success font-bold">⚽ {p.goals}</span>}
                  {p.assists > 0 && <span className="text-info font-bold">🅰 {p.assists}</span>}
                  {p.yellow_cards > 0 && <span className="text-warning font-bold">🟨 {p.yellow_cards}</span>}
                  {p.red_cards > 0 && <span className="text-destructive font-bold">🟥 {p.red_cards}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FormationView = ({
  homePlayers,
  awayPlayers,
}: {
  homePlayers: any[];
  awayPlayers: any[];
}) => {
  const groupByPosition = (players: any[]) => {
    const gk = players.filter(p => p.players?.position === "GK");
    const def = players.filter(p => p.players?.position === "DF");
    const mid = players.filter(p => p.players?.position === "MF");
    const fwd = players.filter(p => p.players?.position === "FW");
    return { gk, def, mid, fwd };
  };

  const home = groupByPosition(homePlayers);
  const away = groupByPosition(awayPlayers);

  const renderLine = (players: any[], colorClass: string) => (
    <div className="flex justify-center gap-3 md:gap-4">
      {players.map((p: any) => {
        const initials = `${p.players?.name?.[0] ?? ""}${p.players?.last_name?.[0] ?? ""}`.toUpperCase() || "?";
        return (
          <div
            key={p.id}
            className={`w-7 h-7 md:w-8 md:h-8 rounded-full border border-border/50 flex items-center justify-center text-[10px] md:text-xs font-bold text-foreground shadow-md ${colorClass}`}
          >
            {initials}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-border">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Formation View
        </p>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider"><span className="text-info">Team 1</span> vs <span className="text-success">Team 2</span></span>
      </div>
      <div className="relative px-4 pb-4 pt-4">
        {/* Pitch Graphic Wrapper */}
        <div className="relative aspect-[3/4] rounded-xl border border-border/50 bg-[#0A0A0F] overflow-hidden">
          {/* Pitch Markings */}
          <div className="absolute inset-x-4 top-1/2 h-px bg-white/10" />
          <div className="absolute inset-y-4 left-1/2 w-px bg-white/5" />
          <div className="absolute inset-4 rounded-full border border-white/10" />
          <div className="absolute inset-x-12 top-0 h-16 border-b border-x border-white/10" />
          <div className="absolute inset-x-12 bottom-0 h-16 border-t border-x border-white/10" />

          {/* Away Team (Top) - Info */}
          <div className="absolute inset-x-4 top-4 space-y-4 md:space-y-6">
            {renderLine(away.gk, "bg-info/30 text-info border-info/50")}
            {renderLine(away.def, "bg-info/30 text-info border-info/50")}
            {renderLine(away.mid, "bg-info/30 text-info border-info/50")}
            {renderLine(away.fwd, "bg-info/30 text-info border-info/50")}
          </div>

          {/* Home Team (Bottom) - Success */}
          <div className="absolute inset-x-4 bottom-4 space-y-4 md:space-y-6">
            {renderLine(home.gk, "bg-success/30 text-success border-success/50")}
            {renderLine(home.def, "bg-success/30 text-success border-success/50")}
            {renderLine(home.mid, "bg-success/30 text-success border-success/50")}
            {renderLine(home.fwd, "bg-success/30 text-success border-success/50")}
          </div>
        </div>
      </div>
    </div>
  );
};

const MatchDetailPage = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [mRes, tsRes, psRes] = await Promise.all([
        supabase.from("matches")
          .select("*, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name), gameweeks(number, seasons(number)), motm_player:players!matches_motm_player_id_fkey(name, last_name)")
          .eq("id", id!)
          .single(),
        supabase.from("team_match_stats")
          .select("*, teams(name)")
          .eq("match_id", id!),
        supabase.from("player_match_stats")
          .select("*, players(name, last_name, position, team_id)")
          .eq("match_id", id!),
      ]);
      setMatch(mRes.data);
      setTeamStats(tsRes.data || []);
      setPlayerStats(psRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading match details...</div>;
  if (!match) return <div className="text-center py-20 text-muted-foreground">Match not found</div>;

  const t1Stats = teamStats.find(s => s.team_id === match.team1_id);
  const t2Stats = teamStats.find(s => s.team_id === match.team2_id);
  const t1Score = t1Stats?.goals_scored ?? 0;
  const t2Score = t2Stats?.goals_scored ?? 0;

  const t1Players = playerStats.filter(p => p.players?.team_id === match.team1_id);
  const t2Players = playerStats.filter(p => p.players?.team_id === match.team2_id);

  const t1Goals = t1Players.filter(p => p.goals > 0);
  const t2Goals = t2Players.filter(p => p.goals > 0);

  const sumStat = (list: any[], key: string) => list.reduce((acc, p) => acc + (p[key] || 0), 0);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-12">
      <Link 
        to="/matches" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-2"
      >
        <ArrowLeft size={16} />
        Back to Matches
      </Link>

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Think you know the best players in Don Bosco?
        </p>
        <span className="hidden sm:inline px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase tracking-widest">
          Fantasy Coming Soon
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
        {/* Main Content Column */}
        <div className="space-y-6">
          {/* Hero Scoreboard */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 font-bold uppercase tracking-wider">
              <span>
                GW{match.gameweeks?.number ?? "?"} · S{match.gameweeks?.seasons?.number ?? "?"}
              </span>
              <span>
                {match.date
                  ? new Date(match.date).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 md:gap-8">
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center shadow-md">
                  <span className="font-display text-3xl md:text-4xl text-foreground font-bold">
                    {match.team1?.name?.charAt(0) ?? "?"}
                  </span>
                </div>
                <p className="text-sm md:text-base font-bold uppercase tracking-wide text-center">
                  {match.team1?.name}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Full Time
                </span>
                <div className="flex items-baseline gap-3">
                  <span className={`font-display text-5xl md:text-7xl font-black ${t1Score > t2Score ? "text-info" : ""}`}>
                    {t1Score}
                  </span>
                  <span className="text-3xl md:text-5xl text-muted-foreground font-black">:</span>
                  <span className={`font-display text-5xl md:text-7xl font-black ${t2Score > t1Score ? "text-success" : ""}`}>
                    {t2Score}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center shadow-md">
                  <span className="font-display text-3xl md:text-4xl text-foreground font-bold">
                    {match.team2?.name?.charAt(0) ?? "?"}
                  </span>
                </div>
                <p className="text-sm md:text-base font-bold uppercase tracking-wide text-center">
                  {match.team2?.name}
                </p>
              </div>
            </div>

            {(t1Goals.length > 0 || t2Goals.length > 0) && (
              <div className="mt-8 border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Goal Timeline
                  </p>
                  <Trophy className="w-4 h-4 text-success" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                  <div className="space-y-2">
                    {t1Goals.map(p => (
                      <p key={p.id} className="flex items-center gap-2">
                        <span className="text-info text-xs">⚽</span>
                        <span className="truncate">
                          {p.players?.name} {p.players?.last_name}
                        </span>
                        {p.minutes_played ? (
                          <span className="text-[10px] text-muted-foreground ml-auto font-bold">
                            {p.minutes_played}'
                          </span>
                        ) : null}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-2 text-right">
                    {t2Goals.map(p => (
                      <p key={p.id} className="flex items-center gap-2 justify-end">
                        {p.minutes_played ? (
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {p.minutes_played}'
                          </span>
                        ) : null}
                        <span className="truncate">
                          {p.players?.name} {p.players?.last_name}
                        </span>
                        <span className="text-success text-xs">⚽</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Players
              </h2>
            </div>
            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <PlayerList teamName={match.team1?.name} players={t1Players} align="left" />
              <PlayerList teamName={match.team2?.name} players={t2Players} align="right" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <FormationView homePlayers={t1Players} awayPlayers={t2Players} />

            <div className="rounded-2xl border border-border bg-card overflow-hidden relative min-h-[260px] group">
              <img
                src="/football_crowd_hero.png"
                alt="Stadium"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success text-success-foreground mb-3">
                  Stadium
                </span>
                <p className="font-display text-2xl tracking-wide font-black">
                  Don Bosco Arena
                </p>
                <p className="text-xs text-muted-foreground mt-2 max-w-[80%]">
                  Where every game writes a new chapter for the league.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-success/30 bg-success/10 text-success-foreground p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-success/20 blur-3xl rounded-full group-hover:bg-success/30 transition-colors" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-success">
                  Man of the Match
                </p>
                <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center shadow-lg">
                  <Trophy size={14} />
                </div>
              </div>
              <p className="font-display text-2xl font-black tracking-wide leading-tight mb-2 text-foreground">
                {match.motm_player
                  ? `${match.motm_player.name} ${match.motm_player.last_name}`
                  : "TBD"}
              </p>
              <p className="text-xs text-muted-foreground">
                Selected for an outstanding performance across the 90 minutes.
              </p>
            </div>
          </div>

          {t1Stats && t2Stats && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 border-b border-border pb-3">
                Match Stats
              </h2>
              <div className="flex items-center justify-between text-xs font-bold uppercase mb-2">
                <span className="text-info max-w-[100px] truncate">{match.team1?.name}</span>
                <span className="text-success max-w-[100px] truncate text-right">{match.team2?.name}</span>
              </div>
              <div className="space-y-4">
                <StatBar label="Goals" left={t1Score} right={t2Score} />
                <StatBar label="Assists" left={sumStat(t1Players, "assists")} right={sumStat(t2Players, "assists")} />
                <StatBar
                  label="Yellow Cards"
                  left={sumStat(t1Players, "yellow_cards")}
                  right={sumStat(t2Players, "yellow_cards")}
                />
                <StatBar
                  label="Red Cards"
                  left={sumStat(t1Players, "red_cards")}
                  right={sumStat(t2Players, "red_cards")}
                />
                <StatBar
                  label="Saves"
                  left={sumStat(t1Players, "total_saves")}
                  right={sumStat(t2Players, "total_saves")}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailPage;
