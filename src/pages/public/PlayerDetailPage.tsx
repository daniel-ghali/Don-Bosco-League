import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, ArrowLeft } from "lucide-react";

const PlayerDetailPage = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState<any>(null);
  const [seasonStats, setSeasonStats] = useState<any[]>([]);
  const [matchStats, setMatchStats] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [motmMatches, setMotmMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [pRes, ssRes, msRes, rRes, motmRes] = await Promise.all([
        supabase.from("players").select("*, teams(name)").eq("id", id!).single(),
        supabase.from("player_season_stats").select("*, seasons(number)").eq("player_id", id!),
        supabase
          .from("player_match_stats")
          .select("*, matches(date, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name))")
          .eq("player_id", id!)
          .order("match_id"),
        supabase
          .from("player_season_stats")
          .select("*, players(name, last_name, teams(name))")
          .order("goals", { ascending: false })
          .limit(10),
        supabase.from("matches").select("id").eq("motm_player_id", id!),
      ]);
      setPlayer(pRes.data);
      setSeasonStats(ssRes.data || []);
      setMatchStats(msRes.data || []);
      setRankings(rRes.data || []);
      setMotmMatches(motmRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading player details...</div>;
  if (!player) return <div className="text-center py-20 text-muted-foreground">Player not found</div>;

  const sumFrom = (list: any[], key: string) => list.reduce((acc, item) => acc + (item[key] || 0), 0);

  const totalGoals = seasonStats.length ? sumFrom(seasonStats, "goals") : sumFrom(matchStats, "goals");
  const totalAssists = seasonStats.length ? sumFrom(seasonStats, "assists") : sumFrom(matchStats, "assists");
  const totalYellow = seasonStats.length ? sumFrom(seasonStats, "yellow_cards") : sumFrom(matchStats, "yellow_cards");
  const totalRed = seasonStats.length ? sumFrom(seasonStats, "red_cards") : sumFrom(matchStats, "red_cards");
  const totalSaves = seasonStats.length ? sumFrom(seasonStats, "total_saves") : sumFrom(matchStats, "total_saves");
  const totalMinutes = sumFrom(matchStats, "minutes_played");

  const matchesPlayed = matchStats.length;
  const motmCount = motmMatches.length;

  const clampRating = (value: number) => Math.max(40, Math.min(99, Math.round(value)));

  const shooting = clampRating(45 + totalGoals * 4 + (matchesPlayed ? (totalGoals / matchesPlayed) * 8 : 0));
  const passing = clampRating(45 + totalAssists * 4 + (matchesPlayed ? (totalAssists / matchesPlayed) * 8 : 0));
  const defending = clampRating(45 + totalSaves * 2 + (100 - totalRed * 5 - totalYellow * 1.5) / 4);
  const physical = clampRating(45 + (matchesPlayed ? totalMinutes / matchesPlayed : 0) / 2);
  const overall = clampRating((shooting + passing + defending + physical) / 4);

  const attributes = [
    { label: "Shooting", value: shooting },
    { label: "Passing", value: passing },
    { label: "Defending", value: defending },
    { label: "Physical", value: physical },
    { label: "Overall", value: overall },
  ];

  const statKeys = [
    "goals",
    "assists",
    "clean_sheets",
    "yellow_cards",
    "red_cards",
    "own_goals",
    "total_saves",
    "penalties_saved",
    "penalties_missed",
  ];

  const quickStats = [
    { label: "Team", value: player.teams?.name || "-" },
    { label: "Goals", value: totalGoals },
    { label: "Assists", value: totalAssists },
    { label: "Yellow Cards", value: totalYellow },
    { label: "MOTM", value: motmCount },
    { label: "Red Cards", value: totalRed },
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-12">
      <Link 
        to="/players" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium mb-2"
      >
        <ArrowLeft size={16} />
        Back to Players
      </Link>

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
        <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Every touch, tackle and goal tells a story.
        </p>
        <span className="hidden sm:inline px-3 py-1 bg-success/10 text-success rounded-full text-[10px] font-bold uppercase tracking-widest">
          Fantasy Coming Soon
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          {/* Main Card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 blur-3xl rounded-bl-full pointer-events-none" />
            
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-secondary border border-border flex items-center justify-center shrink-0 shadow-md">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            
            <div className="flex-1 w-full text-center md:text-left z-10">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Player Profile
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-black tracking-wide leading-none mb-3">
                {player.name} {player.last_name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {player.position && (
                  <span className="px-3 py-1 rounded-full bg-secondary border border-border text-foreground text-xs font-bold uppercase tracking-wider">
                    {player.position}
                  </span>
                )}
                <span className="text-sm font-bold text-muted-foreground">
                  #{player.number ?? player.shirt_number ?? "10"}
                </span>
                {player.teams?.name && (
                  <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    {player.teams.name}
                  </span>
                )}
                {player.price != null && (
                  <span className="text-sm font-black text-success ml-2">
                    ${player.price}
                  </span>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-auto z-10">
              <div className="rounded-2xl border border-success/30 bg-success/10 px-6 py-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-success">
                  Matches Played
                </p>
                <p className="mt-2 font-display text-4xl font-black text-success-foreground">
                  {matchesPlayed}
                </p>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
              Attributes
            </h2>
            <div className="space-y-5">
              {attributes.map(attr => (
                <div key={attr.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-foreground">{attr.label}</span>
                    <span className="text-success">{attr.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-1000"
                      style={{ width: `${attr.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Rankings block */}
          {rankings.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Goal Rankings
                </h2>
              </div>
              <div className="space-y-2">
                {rankings.slice(0, 6).map((r, index) => {
                  const isCurrent = r.player_id === player.id;
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isCurrent ? "bg-success/10 border border-success/20" : "hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"}`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className={`font-bold ${isCurrent ? "text-success-foreground" : "text-foreground"}`}>
                            {r.players?.name} {r.players?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {r.players?.teams?.name}
                          </p>
                        </div>
                      </div>
                      <span className={`text-lg font-black ${isCurrent ? "text-success" : "text-muted-foreground"}`}>
                        {r.goals}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-3">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-secondary/50 p-4 flex flex-col hover:border-success/30 transition-colors"
                >
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">
                    {stat.label}
                  </span>
                  <span className="font-display text-2xl font-black truncate">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Season Stats Table */}
          {seasonStats.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-3">
                Season Stats
              </h3>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="text-left py-2 pb-3 font-medium">Season</th>
                      {statKeys.map(k => (
                        <th key={k} className="text-center px-2 py-2 pb-3 font-medium">
                          {k.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seasonStats.map((s, index) => (
                      <tr
                        key={s.id}
                        className={index % 2 === 1 ? "bg-secondary/30" : ""}
                      >
                        <td className="py-3 font-bold text-xs uppercase text-muted-foreground">
                          S{s.seasons?.number}
                        </td>
                        {statKeys.map(k => (
                          <td key={k} className="text-center px-2 py-3 font-medium">
                            {s[k]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match History Table */}
      {matchStats.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-3">
            Match History
          </h3>
          <div className="overflow-x-auto -mx-6 px-6 md:-mx-8 md:px-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="text-left py-2 pb-3 w-16">Match</th>
                  <th className="text-left px-4 py-2 pb-3">Date</th>
                  <th className="text-left px-4 py-2 pb-3">Opponent</th>
                  <th className="text-center px-2 py-2 pb-3 w-16 text-success">Goals</th>
                  <th className="text-center px-2 py-2 pb-3 w-16 text-info">Assists</th>
                  <th className="text-center px-2 py-2 pb-3 w-16 text-destructive">Red</th>
                  <th className="text-center px-2 py-2 pb-3 w-16 text-warning">Yellow</th>
                </tr>
              </thead>
              <tbody>
                {matchStats.map((s, index) => {
                  const home = s.matches?.team1?.name;
                  const away = s.matches?.team2?.name;
                  const teamName = player.teams?.name;
                  const opponent =
                    teamName && home && away
                      ? home === teamName
                        ? away
                        : home
                      : home && away
                      ? `${home} vs ${away}`
                      : "-";
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors`}
                    >
                      <td className="py-4 text-muted-foreground font-bold text-xs">{index + 1}</td>
                      <td className="px-4 py-4 text-muted-foreground text-xs font-medium">
                        {s.matches?.date
                          ? new Date(s.matches.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-4 font-bold">{opponent}</td>
                      <td className="text-center px-2 py-4 font-black text-success">{s.goals}</td>
                      <td className="text-center px-2 py-4 font-black text-info">{s.assists}</td>
                      <td className="text-center px-2 py-4 font-black">{s.red_cards > 0 ? s.red_cards : "-"}</td>
                      <td className="text-center px-2 py-4 font-black">{s.yellow_cards > 0 ? s.yellow_cards : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetailPage;
