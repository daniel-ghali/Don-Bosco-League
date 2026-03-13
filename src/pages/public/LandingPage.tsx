import { Link, useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar, TrendingUp, Star, Target, Award, Zap, ArrowRight, Play, BarChart3, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

const LandingPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleNavigation = (path: string) => {
    if (session) {
      navigate(path);
    } else {
      // For unauthenticated users, redirect to auth first
      navigate('/auth?redirect=' + encodeURIComponent(path));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider text-slate-900 dark:text-white">DON BOSCO</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 -mt-1 font-medium">LEAGUE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('/main')}
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Enter League
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-green-600/5 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg border border-green-200 dark:border-green-800">
            <Trophy className="w-4 h-4" />
            Official School Football Championship
            <Zap className="w-4 h-4" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Welcome to the
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Don Bosco League
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            Experience the ultimate school football championship. Track live standings,
            follow your favorite players, and build your dream fantasy team in Cairo's
            most exciting student sports competition.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              onClick={() => handleNavigation('/main')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold"
            >
              <Trophy className="w-6 h-6 mr-3" />
              Explore League
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleNavigation('/fantasy')}
              className="border-2 border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold"
            >
              <Star className="w-6 h-6 mr-3" />
              Join Fantasy
              <Play className="w-5 h-5 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Everything You Need for the
              <span className="block text-green-600 dark:text-green-400">Perfect Football Experience</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              From live match updates to fantasy football, we've got it all covered in one comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Live Standings</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time league tables and team rankings updated instantly after every match.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Swords className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Match Schedule</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Complete fixture list with live results, goal scorers, and man of the match awards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Player Stats</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Detailed player statistics, performance metrics, and career highlights for every player.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">Fantasy Football</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Build your dream team, compete with friends, and win amazing prizes in our fantasy league.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              League by Numbers
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Impressive statistics from our growing football community
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-6xl font-black text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform duration-300">12</div>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Teams</p>
              <p className="text-slate-600 dark:text-slate-400">Competing Schools</p>
            </div>
            <div className="text-center group">
              <div className="text-6xl font-black text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">200+</div>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Players</p>
              <p className="text-slate-600 dark:text-slate-400">Active Athletes</p>
            </div>
            <div className="text-center group">
              <div className="text-6xl font-semibold text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">50+</div>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Matches</p>
              <p className="text-slate-600 dark:text-slate-400">Games Played</p>
            </div>
            <div className="text-center group">
              <div className="text-6xl font-black text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Goals</p>
              <p className="text-slate-600 dark:text-slate-400">Total Scored</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the Action?
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Whether you're a player, coach, or fan, the Don Bosco League has something for everyone.
            Join our community and be part of Cairo's biggest school football celebration.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              onClick={() => handleNavigation('/main')}
              className="bg-white text-green-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-bold"
            >
              <Target className="w-6 h-6 mr-3" />
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleNavigation('/standings')}
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-bold"
            >
              <Award className="w-6 h-6 mr-3" />
              View Standings
              <BarChart3 className="w-5 h-5 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Don Bosco League</h3>
                <p className="text-slate-400">School Football Championship</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <span>© 2026 Don Bosco School</span>
              <span>Cairo, Egypt</span>
              <span>🏆 Champions League</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;