"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Search, Loader2, ShoppingCart, History, Star, Trash2, ExternalLink, Heart } from "lucide-react";

const API_BASE = "/_/backend"; // Base path as per vercel.json

export default function Home() {
  const [activeTab, setActiveTab] = useState("search");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // History state
  const [history, setHistory] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setResult("");
    setProducts([]);

    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.recommendation) {
        setResult(data.recommendation);
        setProducts(data.products || []);
      } else {
        setResult("Error: " + (data.error || "Unknown error occurred"));
      }
    } catch (err) {
      setResult("Failed to connect to the agent backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (search = "") => {
    setLoadingHistory(true);
    try {
      const url = search ? `${API_BASE}/api/history?q=${encodeURIComponent(search)}` : `${API_BASE}/api/history`;
      const response = await fetch(url);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const response = await fetch(`${API_BASE}/api/favorites`);
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const toggleFavorite = async (product: any) => {
    try {
      await fetch(`${API_BASE}/api/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: product.title,
          price: product.price,
          rating: product.rating,
          link: product.link,
          source: product.source
        }),
      });
      // Optionally show a toast or update local state
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: "DELETE",
      });
      fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
    if (activeTab === "favorites") fetchFavorites();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-neutral-800">
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
          <div className="h-16 w-16 bg-neutral-900 rounded-2xl flex items-center justify-center border border-neutral-800 shadow-xl mb-4">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Prodi <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Agent</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-2 mb-12">
          {[
            { id: "search", icon: Search, label: "Search" },
            { id: "history", icon: History, label: "History" },
            { id: "favorites", icon: Star, label: "Favorites" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <>
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-16">
              <div className="relative flex items-center group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Best noise-canceling headphones under $200"
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl py-4 pl-12 pr-32 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-lg backdrop-blur-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !query}
                  className="absolute right-2 px-6 py-2 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
                </button>
              </div>
            </form>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-md">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                <p className="text-neutral-400 animate-pulse">Agent is searching & analyzing...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-8">
                {/* Comparison Grid */}
                {products.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col group hover:border-emerald-500/30 transition-all">
                        {product.thumbnail && (
                          <div className="aspect-square w-full mb-4 overflow-hidden rounded-xl bg-neutral-800">
                            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold line-clamp-2 mb-1">{product.title}</h3>
                          <p className="text-emerald-400 font-bold mb-4">{product.price}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => toggleFavorite(product)}
                              className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              title="Favorite"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                            <a 
                              href={product.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-all"
                              title="View Source"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          {product.rating && (
                            <div className="flex items-center text-xs text-neutral-400">
                              <Star className="w-3 h-3 text-amber-400 mr-1 fill-amber-400" />
                              {product.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-8 md:p-10 rounded-3xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-md shadow-2xl overflow-hidden">
                  <div className="prose prose-invert prose-emerald max-w-none">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  fetchHistory(e.target.value);
                }}
                placeholder="Search history..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" />
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-400" /></div>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <div key={item.id} className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/40 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{item.query}</h3>
                      <span className="text-xs text-neutral-500">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-neutral-400 text-sm line-clamp-2 prose prose-invert prose-sm">
                      <ReactMarkdown>{item.recommendation}</ReactMarkdown>
                    </div>
                    <button 
                      onClick={() => {
                        setResult(item.recommendation);
                        setQuery(item.query);
                        setActiveTab("search");
                      }}
                      className="mt-4 text-emerald-400 text-sm font-semibold hover:underline"
                    >
                      View Full Analysis
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="space-y-6">
            {loadingFavorites ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-400" /></div>
            ) : (
              <div className="grid gap-4">
                {favorites.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">No favorites yet.</div>
                )}
                {favorites.map((item) => (
                  <div key={item.id} className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.product_name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="text-emerald-400 font-medium">{item.price}</span>
                        {item.rating && <span className="text-neutral-400">Rating: {item.rating}</span>}
                        <span className="text-neutral-500">{item.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button 
                        onClick={() => removeFavorite(item.id)}
                        className="p-3 rounded-xl bg-neutral-800 text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
