import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Plus, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Trash2,
  Edit2,
  Filter,
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Role, UserStatus, TransactionType, User, FinancialRecord } from "./types";

const API_BASE = import.meta.env.VITE_API_URL;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    name: "",
    role: Role.VIEWER
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<any>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categoryTotals: {},
    recentActivity: []
  });
  const [activeTab, setActiveTab] = useState<"dashboard" | "records" | "users">("dashboard");
  const [userRoleFilter, setUserRoleFilter] = useState<Role | null>(null);
  const [recordFilters, setRecordFilters] = useState({
    type: "All Types",
    category: "",
    minAmount: "",
    maxAmount: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [newRecord, setNewRecord] = useState({
    amount: 0,
    type: TransactionType.EXPENSE,
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  // Initial load: check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuth(true);
    }
  }, []);

  useEffect(() => {
    if (isAuth && currentUser) {
      fetchDashboardData();
      fetchRecords();
      if (currentUser.role === Role.ADMIN) {
        fetchUsers();
      }
    }
  }, [isAuth, currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsAuth(true);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setIsAuth(true);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuth(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { "x-user-id": localStorage.getItem("token") || "" }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("token") || "" 
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to update user");
      await fetchUsers();
      // If updating current user, update local state too
      if (currentUser?.id === userId) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`, {
        headers: { "x-user-id": localStorage.getItem("token") || "" }
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data);
      } else {
        setError(data.error || "Failed to fetch summary");
      }
    } catch (err) {
      setError("Failed to fetch summary");
    }
  };

  const fetchRecords = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/records`, {
        headers: { "x-user-id": localStorage.getItem("token") || "" }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setRecords(data);
      } else {
        setError(data.error || "Failed to fetch records");
      }
    } catch (err) {
      setError("Failed to fetch records");
    }
  };

  const validateForm = (data: typeof newRecord) => {
    const errors: Record<string, string> = {};
    
    if (data.amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    
    if (!data.category.trim()) {
      errors.category = "Category is required";
    } else if (/\d/.test(data.category)) {
      errors.category = "Category should not contain numbers";
    } else if (data.category.length < 2) {
      errors.category = "Category must be at least 2 characters";
    }

    if (!data.date) {
      errors.date = "Date is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!validateForm(newRecord)) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/records`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("token") || "" 
        },
        body: JSON.stringify(newRecord)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add record");
      }
      setShowRecordForm(false);
      fetchDashboardData();
      fetchRecords();
      setNewRecord({
        amount: 0,
        type: TransactionType.EXPENSE,
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: ""
      });
      setValidationErrors({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingRecord) return;

    const updateData = {
      amount: editingRecord.amount,
      type: editingRecord.type,
      category: editingRecord.category,
      date: editingRecord.date,
      description: editingRecord.description
    };

    if (!validateForm(updateData)) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/records/${editingRecord.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("token") || "" 
        },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update record");
      }
      setEditingRecord(null);
      fetchDashboardData();
      fetchRecords();
      setValidationErrors({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!currentUser || !recordToDelete) return;
    
    try {
      const res = await fetch(`${API_BASE}/records/${recordToDelete}`, {
        method: "DELETE",
        headers: { "x-user-id": localStorage.getItem("token") || "" }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete record");
      }
      setRecordToDelete(null);
      fetchDashboardData();
      fetchRecords();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isAuth || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 max-w-md w-full border border-slate-200"
        >
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-200 mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              {authMode === "login" ? "Sign in to manage your finances" : "Start your financial journey today"}
            </p>
          </div>

          <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-6">
            {authMode === "register" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={authData.name}
                  onChange={e => setAuthData({...authData, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={authData.email}
                onChange={e => setAuthData({...authData, email: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                required
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {authMode === "register" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role</label>
                <select 
                  value={authData.role}
                  onChange={e => setAuthData({...authData, role: e.target.value as Role})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                >
                  <option value={Role.VIEWER}>Viewer</option>
                  <option value={Role.ANALYST}>Analyst</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 text-white p-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : (authMode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthData({ email: "", password: "", name: "", role: Role.VIEWER });
                setError(null);
              }}
              className="text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors"
            >
              {authMode === "login" ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-500 bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 text-brand-600">
          <Wallet className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-slate-900 font-display">FinTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-500 ease-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-600">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-100">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900 font-display">FinTrack</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === "dashboard"} 
            onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Receipt />} 
            label="Records" 
            active={activeTab === "records"} 
            onClick={() => { setActiveTab("records"); setIsSidebarOpen(false); }} 
          />
          {currentUser.role === Role.ADMIN && (
            <SidebarItem 
              icon={<Users />} 
              label="User Management" 
              active={activeTab === "users"} 
              onClick={() => { setActiveTab("users"); setIsSidebarOpen(false); }} 
            />
          )}
        </nav>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 mb-4 border border-slate-200">
            <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold shadow-sm">
              {currentUser.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="font-bold text-slate-900 truncate leading-tight">{currentUser.name}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{currentUser.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-1">
              {activeTab === "dashboard" ? "Financial Overview" : 
               activeTab === "records" ? "Transaction Records" : "User Management"}
            </h2>
            <p className="text-slate-500 font-medium">Welcome back, {currentUser.name}</p>
          </div>
          
          {activeTab === "records" && currentUser.role === Role.ADMIN && (
            <button 
              onClick={() => setShowRecordForm(true)}
              className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-brand-200 transition-all w-full sm:w-auto active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Record
            </button>
          )}
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 shadow-sm"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors">×</button>
          </motion.div>
        )}

        {activeTab === "dashboard" && summary && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard 
                title="Total Income" 
                value={summary?.totalIncome || 0} 
                icon={<TrendingUp className="text-emerald-600" />} 
                color="green" 
              />
              <StatCard 
                title="Total Expenses" 
                value={summary?.totalExpenses || 0} 
                icon={<TrendingDown className="text-rose-600" />} 
                color="red" 
              />
              <StatCard 
                title="Net Balance" 
                value={summary?.balance || 0} 
                icon={<Wallet className="text-brand-600" />} 
                color="blue" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Category Breakdown */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm card-hover">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                  Category Breakdown
                </h3>
                <div className="space-y-6">
                  {Object.entries(summary?.categoryTotals || {}).map(([cat, amount]: [string, any]) => (
                    <div key={cat} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${amount > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-slate-600 font-bold text-sm md:text-base">{cat}</span>
                        </div>
                        <span className={`font-bold text-sm md:text-base ${amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {amount > 0 ? '+' : ''}{amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '70%' }}
                          className={`h-full rounded-full ${amount > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm card-hover">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {(summary?.recentActivity || []).map((rec: FinancialRecord) => (
                    <div key={rec.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-200">
                      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        rec.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {rec.type === TransactionType.INCOME ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate text-base">{rec.category}</div>
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{rec.date} • {rec.description}</div>
                      </div>
                      <div className={`font-bold text-lg ${rec.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {rec.type === TransactionType.INCOME ? '+' : '-'}
                        {rec.amount.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR'
})}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "records" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                      showFilters ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  { (recordFilters.category || recordFilters.minAmount || recordFilters.maxAmount || recordFilters.type !== "All Types") && (
                    <button 
                      onClick={() => setRecordFilters({ type: "All Types", category: "", minAmount: "", maxAmount: "" })}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                  Showing {records.filter(rec => {
                    const matchesType = recordFilters.type === "All Types" || rec.type.toLowerCase() === recordFilters.type.toLowerCase();
                    const matchesCategory = !recordFilters.category || rec.category.toLowerCase().includes(recordFilters.category.toLowerCase());
                    const matchesMin = !recordFilters.minAmount || rec.amount >= Number(recordFilters.minAmount);
                    const matchesMax = !recordFilters.maxAmount || rec.amount <= Number(recordFilters.maxAmount);
                    return matchesType && matchesCategory && matchesMin && matchesMax;
                  }).length} records
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-b border-slate-100"
                  >
                    <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 bg-white">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                        <select 
                          value={recordFilters.type}
                          onChange={e => setRecordFilters({...recordFilters, type: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        >
                          <option>All Types</option>
                          <option>Income</option>
                          <option>Expense</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <input 
                          type="text" 
                          placeholder="Search category..."
                          value={recordFilters.category}
                          onChange={e => setRecordFilters({...recordFilters, category: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Min Amount</label>
                        <input 
                          type="number" 
                          placeholder="Min..."
                          value={recordFilters.minAmount}
                          onChange={e => setRecordFilters({...recordFilters, minAmount: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Max Amount</label>
                        <input 
                          type="number" 
                          placeholder="Max..."
                          value={recordFilters.maxAmount}
                          onChange={e => setRecordFilters({...recordFilters, maxAmount: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5">Description</th>
                      <th className="px-8 py-5 text-right">Amount</th>
                      {currentUser.role === Role.ADMIN && <th className="px-8 py-5 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.filter(rec => {
                      const matchesType = recordFilters.type === "All Types" || rec.type.toLowerCase() === recordFilters.type.toLowerCase();
                      const matchesCategory = !recordFilters.category || rec.category.toLowerCase().includes(recordFilters.category.toLowerCase());
                      const matchesMin = !recordFilters.minAmount || rec.amount >= Number(recordFilters.minAmount);
                      const matchesMax = !recordFilters.maxAmount || rec.amount <= Number(recordFilters.maxAmount);
                      return matchesType && matchesCategory && matchesMin && matchesMax;
                    }).map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6 text-sm font-semibold text-slate-500">{rec.date}</td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {rec.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-slate-600">{rec.description}</td>
                      <td className={`px-8 py-6 text-right font-bold text-lg ${
                        rec.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {rec.type === TransactionType.INCOME ? '+' : '-'}
                        {rec.amount.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR'
})}
                      </td>
                      {currentUser.role === Role.ADMIN && (
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button 
                              onClick={() => setEditingRecord(rec)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all border border-transparent hover:border-brand-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setRecordToDelete(rec.id)}
                              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

        {activeTab === "users" && currentUser.role === Role.ADMIN && (
          <div className="space-y-10">
            {/* User Summary Stats */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                User Distribution
              </h3>
              {userRoleFilter && (
                <button 
                  onClick={() => setUserRoleFilter(null)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                >
                  <X className="w-3 h-3" />
                  Clear Filter: {userRoleFilter}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button 
                onClick={() => setUserRoleFilter(userRoleFilter === Role.ANALYST ? null : Role.ANALYST)}
                className={`p-8 rounded-3xl border transition-all flex items-center justify-between text-left group ${
                  userRoleFilter === Role.ANALYST 
                    ? 'bg-cyan-50 border-cyan-200 ring-2 ring-cyan-500/20' 
                    : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-md'
                }`}
              >
                <div>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2">Active Analysts</p>
                  <div className="text-4xl font-bold text-slate-900">
                    {availableUsers.filter(u => u.role === Role.ANALYST && u.status === UserStatus.ACTIVE).length}
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  userRoleFilter === Role.ANALYST 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200' 
                    : 'bg-cyan-100 text-cyan-600 group-hover:scale-110'
                }`}>
                  <Users className="w-7 h-7" />
                </div>
              </button>
              <button 
                onClick={() => setUserRoleFilter(userRoleFilter === Role.VIEWER ? null : Role.VIEWER)}
                className={`p-8 rounded-3xl border transition-all flex items-center justify-between text-left group ${
                  userRoleFilter === Role.VIEWER 
                    ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20' 
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2">Active Viewers</p>
                  <div className="text-4xl font-bold text-slate-900">
                    {availableUsers.filter(u => u.role === Role.VIEWER && u.status === UserStatus.ACTIVE).length}
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  userRoleFilter === Role.VIEWER 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-emerald-100 text-emerald-600 group-hover:scale-110'
                }`}>
                  <Users className="w-7 h-7" />
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableUsers
                .filter(user => !userRoleFilter || user.role === userRoleFilter)
                .map(user => (
                <motion.div 
                  key={user.id} 
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-hover relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full -mr-16 -mt-16 z-0" />
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl shadow-inner">
                        {user.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-slate-900 leading-tight">{user.name}</h4>
                        <p className="text-sm text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 mb-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        user.role === Role.ADMIN ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                        user.role === Role.ANALYST ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === UserStatus.ACTIVE ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${user.status === UserStatus.ACTIVE ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Management Actions */}
                  <div className="relative z-10 grid grid-cols-2 gap-3 mt-auto">
                    <button 
                      onClick={() => handleUpdateUser(user.id, { 
                        status: user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE 
                      })}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                        user.status === UserStatus.ACTIVE 
                          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                    >
                      {user.status === UserStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                    </button>
                    
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Record Modal */}
      <AnimatePresence>
        {showRecordForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
            >
              <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-100">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Add New Record</h3>
                </div>
                <button 
                  onClick={() => { setShowRecordForm(false); setValidationErrors({}); }} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddRecord} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Type</label>
                    <select 
                      value={newRecord.type}
                      onChange={e => setNewRecord({...newRecord, type: e.target.value as TransactionType})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                    >
                      <option value={TransactionType.EXPENSE}>Expense</option>
                      <option value={TransactionType.INCOME}>Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={newRecord.amount || ""}
                        onChange={e => setNewRecord({...newRecord, amount: Number(e.target.value)})}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-4 bg-slate-50 border ${validationErrors.amount ? 'border-rose-500' : 'border-slate-200'} rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                      />
                    </div>
                    {validationErrors.amount && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{validationErrors.amount}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                  <input 
                    type="text" 
                    required
                    value={newRecord.category}
                    onChange={e => setNewRecord({...newRecord, category: e.target.value})}
                    placeholder="e.g. Rent, Salary, Food"
                    className={`w-full p-4 bg-slate-50 border ${validationErrors.category ? 'border-rose-500' : 'border-slate-200'} rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-700`}
                  />
                  {validationErrors.category && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{validationErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={newRecord.date}
                    onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                    className={`w-full p-4 bg-slate-50 border ${validationErrors.date ? 'border-rose-500' : 'border-slate-200'} rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-700`}
                  />
                  {validationErrors.date && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{validationErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={newRecord.description}
                    onChange={e => setNewRecord({...newRecord, description: e.target.value})}
                    placeholder="Optional details..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-600 h-28 resize-none"
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-2xl font-bold shadow-xl shadow-brand-200 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? "Processing..." : "Save Record"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-100">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Edit Record</h3>
                </div>
                <button 
                  onClick={() => { setEditingRecord(null); setValidationErrors({}); }} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateRecord} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                    <select 
                      value={editingRecord.type}
                      onChange={e => setEditingRecord({...editingRecord, type: e.target.value as TransactionType})}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-700"
                    >
                      <option value={TransactionType.EXPENSE}>Expense</option>
                      <option value={TransactionType.INCOME}>Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={editingRecord.amount || ""}
                        onChange={e => setEditingRecord({...editingRecord, amount: Number(e.target.value)})}
                        className={`w-full pl-8 pr-4 py-4 bg-slate-50 border ${validationErrors.amount ? 'border-rose-500' : 'border-slate-100'} rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-bold text-slate-700`}
                      />
                    </div>
                    {validationErrors.amount && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{validationErrors.amount}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <input 
                    type="text" 
                    required
                    value={editingRecord.category}
                    onChange={e => setEditingRecord({...editingRecord, category: e.target.value})}
                    className={`w-full p-4 bg-slate-50 border ${validationErrors.category ? 'border-rose-500' : 'border-slate-100'} rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-700`}
                  />
                  {validationErrors.category && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{validationErrors.category}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    type="date" 
                    required
                    value={editingRecord.date}
                    onChange={e => setEditingRecord({...editingRecord, date: e.target.value})}
                    className={`w-full p-4 bg-slate-50 border ${validationErrors.date ? 'border-rose-500' : 'border-slate-100'} rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-semibold text-slate-700`}
                  />
                  {validationErrors.date && <p className="text-rose-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{validationErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={editingRecord.description}
                    onChange={e => setEditingRecord({...editingRecord, description: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all font-medium text-slate-600 h-28 resize-none"
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-2xl font-bold shadow-xl shadow-brand-200 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? "Updating..." : "Update Record"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {recordToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center border border-slate-100"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Delete Record?</h3>
              <p className="text-slate-500 mb-8 font-medium leading-relaxed">This action is permanent and cannot be undone. Are you sure?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteRecord}
                  className="w-full px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setRecordToDelete(null)}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group ${
        active 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 font-bold' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-semibold'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="ml-auto w-1.5 h-5 bg-white/40 rounded-full"
        />
      )}
    </button>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colors: any = {
    green: 'bg-emerald-100 text-emerald-700 shadow-emerald-100',
    red: 'bg-rose-100 text-rose-700 shadow-rose-100',
    blue: 'bg-brand-100 text-brand-700 shadow-brand-100'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-hover"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{title}</span>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${colors[color]}`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
      </div>
      <div className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-display">
        {value.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR'
    })}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${color === 'green' ? 'bg-emerald-500' : color === 'red' ? 'bg-rose-500' : 'bg-brand-500'}`} />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Live Updates</span>
      </div>
    </motion.div>
  );
}
