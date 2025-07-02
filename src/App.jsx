import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register' | 'verify'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [registerInfo, setRegisterInfo] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loginInfo, setLoginInfo] = useState({ email: "", password: "" });
  const [verifyInfo, setVerifyInfo] = useState({ email: "", code: "" });
  const [pendingUserId, setPendingUserId] = useState(null);

  // Navigation state
  const [currentPage, setCurrentPage] = useState("todos"); // 'todos', 'schedule', 'pricing', 'features', 'about', 'contact', 'blog', 'privacy', 'terms', 'faq', 'dashboard', 'history', 'settings'

  // Todo state
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [todoLoading, setTodoLoading] = useState(false);
  const [todoError, setTodoError] = useState("");

  // Schedule state
  const [scheduleTasks, setScheduleTasks] = useState([
    { name: "", duration: "", deadline: "", priority: 1 }
  ]);
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [scheduleError, setScheduleError] = useState("");

  // Settings state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('todoAppSettings');
    return saved ? JSON.parse(saved) : {
      theme: 'midnight',
      notifications: true,
      autoSave: true,
      soundEffects: false,
      compactMode: false,
      showCompleted: true,
      defaultPriority: 2,
      language: 'en'
    };
  });

  // Blog state
  const [blogPosts] = useState([
    {
      id: 1,
      title: "10 Productivity Tips for Better Todo Management",
      excerpt: "Learn how to organize your tasks effectively and boost your productivity...",
      date: "2024-01-15",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "The Science Behind Task Scheduling",
      excerpt: "Discover the psychology and research behind effective time management...",
      date: "2024-01-10",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Why Email Verification Matters for Security",
      excerpt: "Understanding the importance of secure authentication in modern apps...",
      date: "2024-01-05",
      readTime: "4 min read"
    }
  ]);

  // Dashboard stats
  const [dashboardStats] = useState({
    totalTodos: todos.length,
    completedTodos: todos.filter(t => t.completed).length,
    pendingTodos: todos.filter(t => !t.completed).length,
    productivityScore: 85
  });

  // Helper to parse time (HH:MM) to minutes
  const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  // Helper to format minutes to HH:MM
  const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60)
      .toString()
      .padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  // Auth: fetch profile if token exists
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data) => setUser(data.user))
        .catch(() => {
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  // Load todos when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadTodos();
    }
  }, [user, token]);

  // Apply initial theme on mount
  useEffect(() => {
    // Apply theme changes
    const themeClass = `theme-${settings.theme}`;
    document.body.className = themeClass;
    document.documentElement.className = themeClass;
    console.log('Initial theme applied:', themeClass);
  }, []); // Run only on mount

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todoAppSettings', JSON.stringify(settings));
    
    // Apply theme changes
    const themeClass = `theme-${settings.theme}`;
    document.body.className = themeClass;
    document.documentElement.className = themeClass;
    console.log('Theme changed to:', themeClass);
  }, [settings]);

  // Auth handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerInfo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setAuthMode("verify");
      setVerifyInfo({ email: registerInfo.email, code: "" });
      setPendingUserId(data.userId);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyInfo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setAuthMode("login");
      setPendingUserId(null);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  // Todo handlers
  const loadTodos = async () => {
    setTodoLoading(true);
    try {
      const res = await fetch(`${API_URL}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (error) {
      setTodoError("Failed to load todos");
    } finally {
      setTodoLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setTodoLoading(true);
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newTodo.trim() }),
      });
      if (res.ok) {
        const todo = await res.json();
        setTodos([...todos, todo]);
        setNewTodo("");
      }
    } catch (error) {
      setTodoError("Failed to add todo");
    } finally {
      setTodoLoading(false);
    }
  };

  const toggleTodo = async (todoId, completed) => {
    try {
      const res = await fetch(`${API_URL}/todos/${todoId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) {
        setTodos(todos.map(todo => 
          todo.id === todoId ? { ...todo, completed: !completed } : todo
        ));
      }
    } catch (error) {
      setTodoError("Failed to update todo");
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const res = await fetch(`${API_URL}/todos/${todoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTodos(todos.filter(todo => todo.id !== todoId));
      }
    } catch (error) {
      setTodoError("Failed to delete todo");
    }
  };

  // Schedule handlers
  const addScheduleTask = () => {
    setScheduleTasks([
      ...scheduleTasks,
      { name: "", duration: "", deadline: "", priority: 1 }
    ]);
  };

  const removeScheduleTask = (idx) => {
    setScheduleTasks(scheduleTasks.filter((_, i) => i !== idx));
  };

  const updateScheduleTask = (idx, field, value) => {
    setScheduleTasks(
      scheduleTasks.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  };

  const generateSchedule = () => {
    setScheduleError("");
    setSchedule(null);
    if (!windowStart || !windowEnd) {
      setScheduleError("Please set the available time window.");
      return;
    }
    const startMins = timeToMinutes(windowStart);
    const endMins = timeToMinutes(windowEnd);
    if (endMins <= startMins) {
      setScheduleError("End time must be after start time.");
      return;
    }
    const validTasks = scheduleTasks.filter(
      (t) => t.name && t.duration && !isNaN(Number(t.duration)) && Number(t.duration) > 0
    );
    if (validTasks.length === 0) {
      setScheduleError("Please add at least one valid task.");
      return;
    }
    const sorted = [...validTasks].sort((a, b) => {
      if (Number(b.priority) !== Number(a.priority)) {
        return Number(b.priority) - Number(a.priority);
      }
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return 0;
    });
    let current = startMins;
    const result = [];
    for (const task of sorted) {
      const dur = Number(task.duration);
      let deadlineMins = task.deadline ? timeToMinutes(task.deadline.slice(11, 16)) : null;
      if (deadlineMins && current + dur > deadlineMins) {
        setScheduleError(
          `Task "${task.name}" cannot be scheduled before its deadline.`
        );
        return;
      }
      if (current + dur > endMins) {
        setScheduleError("Not enough time in the window for all tasks.");
        return;
      }
      result.push({
        ...task,
        start: minutesToTime(current),
        end: minutesToTime(current + dur)
      });
      current += dur;
    }
    setSchedule(result);
  };

  // Ad placeholder component
  const AdPlaceholder = ({ position, size = "banner" }) => (
    <div className={`glass-card p-4 my-4 text-center ${size === "sidebar" ? "w-64" : "w-full"}`}>
      <div className="opacity-60 text-sm mb-2">Advertisement</div>
      <div className="bg-white/10 rounded-lg p-8 border-2 border-dashed border-white/20">
        <div className="opacity-40 text-lg">Ad Space</div>
        <div className="opacity-30 text-sm">{position}</div>
      </div>
    </div>
  );

  // Simple header component
  const Header = () => (
    <div className="flex justify-between items-center mb-6 p-4">
      <h1 className="text-2xl font-bold text-white">Todo App</h1>
      <button 
        className="px-4 py-2 text-white/80 hover:text-white text-sm border border-white/30 hover:border-white/50 rounded-lg transition-all duration-200 hover:bg-white/10 backdrop-blur-sm" 
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );

  // Simple bottom navigation component
  const BottomNavigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t p-2">
      <div className="flex flex-wrap justify-center items-center gap-2 max-w-2xl mx-auto">
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'dashboard' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'todos' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('todos')}
        >
          Todos
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'schedule' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('schedule')}
        >
          Schedule
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'features' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('features')}
        >
          Features
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'pricing' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('pricing')}
        >
          Pricing
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'blog' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('blog')}
        >
          Blog
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'about' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('about')}
        >
          About
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'contact' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('contact')}
        >
          Contact
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'faq' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('faq')}
        >
          FAQ
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'terms' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('terms')}
        >
          Terms
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'history' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('history')}
        >
          History
        </button>
        <button 
          className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${currentPage === 'settings' ? 'active' : 'opacity-70 hover:opacity-100'}`}
          onClick={() => setCurrentPage('settings')}
        >
          Settings
        </button>
      </div>
    </nav>
  );

  // Page components
  const DashboardPage = () => (
    <div className="w-full max-w-6xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Dashboard</h2>
      
      <AdPlaceholder position="Top Banner" />
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 text-center">
          <h3 className="text-2xl font-bold">{todos.length}</h3>
          <p className="opacity-80">Total Todos</p>
        </div>
        <div className="glass-card p-6 text-center">
          <h3 className="text-2xl font-bold">{todos.filter(t => t.completed).length}</h3>
          <p className="opacity-80">Completed</p>
        </div>
        <div className="glass-card p-6 text-center">
          <h3 className="text-2xl font-bold">{todos.filter(t => !t.completed).length}</h3>
          <p className="opacity-80">Pending</p>
        </div>
        <div className="glass-card p-6 text-center">
          <h3 className="text-2xl font-bold">85%</h3>
          <p className="opacity-80">Productivity</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {todos.slice(0, 5).map((todo) => (
              <div key={todo.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${todo.completed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className={`opacity-80 ${todo.completed ? 'line-through' : ''}`}>
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn-primary w-full" onClick={() => setCurrentPage('todos')}>
              Add New Todo
            </button>
            <button className="btn-secondary w-full" onClick={() => setCurrentPage('schedule')}>
              Create Schedule
            </button>
            <button className="btn-secondary w-full" onClick={() => setCurrentPage('features')}>
              View Features
            </button>
          </div>
        </div>
      </div>

      <AdPlaceholder position="Bottom Banner" />
    </div>
  );

  const TodosPage = () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">My Todos</h2>
      
      <AdPlaceholder position="Todos Top" />
      
      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input flex-1"
            disabled={todoLoading}
          />
          <button type="submit" className="btn-primary" disabled={todoLoading}>
            {todoLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {todoError && <div className="toast error mb-4">{todoError}</div>}

      <div className="space-y-3">
        {todos
          .filter(todo => settings.showCompleted || !todo.completed)
          .map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                className="checkbox"
              />
              <span className={`flex-1 ${todo.completed ? 'line-through opacity-60' : ''}`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="btn-secondary text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ))}
        {todos.length === 0 && (
          <p className="opacity-60 text-center py-8">No todos yet. Add one above!</p>
        )}
      </div>

      <AdPlaceholder position="Todos Bottom" />
    </div>
  );

  const SchedulePage = () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Schedule Tasks</h2>
      
      <AdPlaceholder position="Schedule Top" />
      
      <div className="mb-4 flex flex-col gap-2">
        <label>Available Time Window:</label>
        <div className="flex gap-2 justify-center">
          <input
            type="time"
            value={windowStart}
            onChange={(e) => setWindowStart(e.target.value)}
            className="todo-input w-32"
          />
          <span>to</span>
          <input
            type="time"
            value={windowEnd}
            onChange={(e) => setWindowEnd(e.target.value)}
            className="todo-input w-32"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="font-medium">Tasks:</label>
        {scheduleTasks.map((task, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <input
              type="text"
              placeholder="Task name"
              value={task.name}
              onChange={(e) => updateScheduleTask(idx, "name", e.target.value)}
              className="todo-input w-32"
            />
            <input
              type="number"
              min="1"
              placeholder="Duration (min)"
              value={task.duration}
              onChange={(e) => updateScheduleTask(idx, "duration", e.target.value)}
              className="todo-input w-32"
            />
            <input
              type="datetime-local"
              placeholder="Deadline"
              value={task.deadline}
              onChange={(e) => updateScheduleTask(idx, "deadline", e.target.value)}
              className="todo-input w-48"
            />
            <select
              value={task.priority}
              onChange={(e) => updateScheduleTask(idx, "priority", e.target.value)}
              className="todo-input w-24"
            >
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
            <button
              className="btn-secondary"
              onClick={() => removeScheduleTask(idx)}
              disabled={scheduleTasks.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="btn-primary mt-2" onClick={addScheduleTask}>
          + Add Task
        </button>
      </div>

      <button className="btn-primary mb-4" onClick={generateSchedule}>
        Generate Schedule
      </button>

      {scheduleError && <div className="toast error mb-2">{scheduleError}</div>}
      
      {schedule && (
        <div className="glass-card p-4 mt-4">
          <h3 className="text-lg font-bold mb-2">Scheduled Plan</h3>
          <ul className="text-left">
            {schedule.map((task, i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold">{task.name}</span> <br />
                <span className="opacity-80">{task.start} - {task.end}</span> <br />
                <span className="opacity-60">Priority: {task.priority} {task.deadline && `| Deadline: ${task.deadline.replace('T', ' ')}`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdPlaceholder position="Schedule Bottom" />
    </div>
  );

  const FeaturesPage = () => (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Features</h2>
      
      <AdPlaceholder position="Features Top" />
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-3">✨ Smart Todo Management</h3>
          <ul className="opacity-80 space-y-2">
            <li>• Add, complete, and delete todos</li>
            <li>• Real-time synchronization</li>
            <li>• Clean, minimalist interface</li>
            <li>• Persistent data storage</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-3">📅 Intelligent Scheduling</h3>
          <ul className="opacity-80 space-y-2">
            <li>• Priority-based task scheduling</li>
            <li>• Deadline management</li>
            <li>• Time window optimization</li>
            <li>• Visual schedule display</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-3">🔐 Secure Authentication</h3>
          <ul className="opacity-80 space-y-2">
            <li>• Email verification</li>
            <li>• Secure password hashing</li>
            <li>• JWT token authentication</li>
            <li>• Session management</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-3">🎨 Beautiful Design</h3>
          <ul className="opacity-80 space-y-2">
            <li>• Glass morphism UI</li>
            <li>• Responsive design</li>
            <li>• Smooth animations</li>
            <li>• Dark theme</li>
          </ul>
        </div>
      </div>

      <AdPlaceholder position="Features Bottom" />
    </div>
  );

  const PricingPage = () => (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Pricing Plans</h2>
      
      <AdPlaceholder position="Pricing Top" />
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Free</h3>
          <div className="text-3xl font-bold mb-4">$0</div>
          <ul className="opacity-80 space-y-2 mb-6">
            <li>• Basic todo management</li>
            <li>• Simple scheduling</li>
            <li>• Email verification</li>
            <li>• 10 todos limit</li>
          </ul>
          <button className="btn-primary w-full">Get Started</button>
        </div>

        <div className="glass-card p-6 text-center border-2 border-white/30">
          <h3 className="text-xl font-bold mb-2">Pro</h3>
          <div className="text-3xl font-bold mb-4">$9.99<span className="text-lg">/month</span></div>
          <ul className="opacity-80 space-y-2 mb-6">
            <li>• Unlimited todos</li>
            <li>• Advanced scheduling</li>
            <li>• Priority management</li>
            <li>• Data export</li>
            <li>• Priority support</li>
          </ul>
          <button className="btn-primary w-full">Upgrade to Pro</button>
        </div>

        <div className="glass-card p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Enterprise</h3>
          <div className="text-3xl font-bold mb-4">$29.99<span className="text-lg">/month</span></div>
          <ul className="opacity-80 space-y-2 mb-6">
            <li>• Team collaboration</li>
            <li>• Advanced analytics</li>
            <li>• API access</li>
            <li>• Custom integrations</li>
            <li>• Dedicated support</li>
          </ul>
          <button className="btn-primary w-full">Contact Sales</button>
        </div>
      </div>

      <AdPlaceholder position="Pricing Bottom" />
    </div>
  );

  const BlogPage = () => (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Blog</h2>
      
      <AdPlaceholder position="Blog Top" />
      
      <div className="space-y-6">
        {blogPosts.map((post) => (
          <div key={post.id} className="glass-card p-6">
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="opacity-80 mb-3">{post.excerpt}</p>
            <div className="flex justify-between items-center opacity-60 text-sm">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
            <button className="btn-secondary mt-3">Read More</button>
          </div>
        ))}
      </div>

      <AdPlaceholder position="Blog Bottom" />
    </div>
  );

  const AboutPage = () => (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">About Us</h2>
      
      <AdPlaceholder position="About Top" />
      
      <div className="glass-card p-8 mb-6">
        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
        <p className="opacity-80 mb-4">
          We're dedicated to helping people organize their lives and boost productivity through 
          intuitive task management and intelligent scheduling tools.
        </p>
        <p className="opacity-80">
          Our team of productivity experts and developers work together to create the most 
          user-friendly and effective todo application available.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-3">Our Values</h3>
          <ul className="opacity-80 space-y-2">
            <li>• Simplicity in design</li>
            <li>• User privacy first</li>
            <li>• Continuous improvement</li>
            <li>• Community feedback</li>
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-3">Our Team</h3>
          <ul className="opacity-80 space-y-2">
            <li>• 5+ years experience</li>
            <li>• 10,000+ users served</li>
            <li>• 24/7 support</li>
            <li>• Regular updates</li>
          </ul>
        </div>
      </div>

      <AdPlaceholder position="About Bottom" />
    </div>
  );

  const ContactPage = () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>
      
      <AdPlaceholder position="Contact Top" />
      
      <div className="glass-card p-6">
        <form className="space-y-4">
          <div>
            <label className="mb-2 block">Name</label>
            <input type="text" className="todo-input w-full" placeholder="Your name" />
          </div>
          <div>
            <label className="mb-2 block">Email</label>
            <input type="email" className="todo-input w-full" placeholder="your@email.com" />
          </div>
          <div>
            <label className="mb-2 block">Subject</label>
            <input type="text" className="todo-input w-full" placeholder="How can we help?" />
          </div>
          <div>
            <label className="mb-2 block">Message</label>
            <textarea className="todo-input w-full h-32" placeholder="Your message..."></textarea>
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      </div>

      <div className="glass-card p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">Other Ways to Reach Us</h3>
        <div className="space-y-2 opacity-80">
          <p>📧 Email: support@todoapp.com</p>
          <p>📱 Phone: +1 (555) 123-4567</p>
          <p>🏢 Address: 123 Productivity St, Tech City, TC 12345</p>
        </div>
      </div>

      <AdPlaceholder position="Contact Bottom" />
    </div>
  );

  const FAQPage = () => (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
      
      <AdPlaceholder position="FAQ Top" />
      
      <div className="space-y-4">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">How do I create my first todo?</h3>
          <p className="opacity-80">Simply go to the Todos page and use the input field at the top to add a new task. Click "Add" to save it.</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">Can I schedule tasks with deadlines?</h3>
          <p className="opacity-80">Yes! Use the Schedule page to set up tasks with specific durations, deadlines, and priority levels.</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">Is my data secure?</h3>
          <p className="opacity-80">Absolutely. We use industry-standard encryption and secure authentication to protect your information.</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">How do I upgrade to Pro?</h3>
          <p className="opacity-80">Visit our Pricing page to see the different plans and choose the one that best fits your needs.</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-2">Can I export my todos?</h3>
          <p className="opacity-80">Data export is available for Pro and Enterprise users. Contact support for assistance.</p>
        </div>
      </div>

      <AdPlaceholder position="FAQ Bottom" />
    </div>
  );

  const TermsPage = () => (
    <div className="w-full max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Terms of Service</h2>
      
      <AdPlaceholder position="Terms Top" />
      
      <div className="glass-card p-8 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3">1. Acceptance of Terms</h3>
          <p className="opacity-80">
            By accessing and using this Todo App, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">2. Use License</h3>
          <p className="opacity-80">
            Permission is granted to temporarily download one copy of the app for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="opacity-80 mt-2 space-y-1">
            <li>• Modify or copy the materials</li>
            <li>• Use the materials for any commercial purpose</li>
            <li>• Attempt to reverse engineer any software contained in the app</li>
            <li>• Remove any copyright or other proprietary notations</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">3. User Account</h3>
          <p className="opacity-80">
            You are responsible for maintaining the confidentiality of your account and password. 
            You agree to accept responsibility for all activities that occur under your account or password.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">4. Privacy Policy</h3>
          <p className="opacity-80">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
            to understand our practices regarding the collection and use of your personal information.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">5. Data Storage</h3>
          <p className="opacity-80">
            We store your todo data securely on our servers. While we implement reasonable security measures, 
            we cannot guarantee absolute security. You are responsible for backing up important data.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">6. Service Availability</h3>
          <p className="opacity-80">
            We strive to maintain high availability but do not guarantee uninterrupted service. 
            We may perform maintenance that temporarily affects service availability.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">7. Limitation of Liability</h3>
          <p className="opacity-80">
            In no event shall Todo App or its suppliers be liable for any damages arising out of the use 
            or inability to use the materials on the service, even if we have been notified orally or in writing.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">8. Termination</h3>
          <p className="opacity-80">
            We may terminate or suspend your account immediately, without prior notice, for any reason, 
            including breach of the Terms of Service.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">9. Changes to Terms</h3>
          <p className="opacity-80">
            We reserve the right to modify these terms at any time. We will notify users of any material changes 
            via email or through the app.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">10. Contact Information</h3>
          <p className="opacity-80">
            If you have any questions about these Terms of Service, please contact us at legal@todoapp.com
          </p>
        </div>

        <div className="text-center opacity-60 text-sm mt-8">
          <p>Last updated: January 15, 2024</p>
        </div>
      </div>

      <AdPlaceholder position="Terms Bottom" />
    </div>
  );

  // Add HistoryPage component
  const HistoryPage = () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      <AdPlaceholder position="History Top" />
      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-bold mb-2">Completed Todos</h3>
        <ul className="opacity-80 space-y-2">
          {todos.filter(t => t.completed).length === 0 && (
            <li>No completed todos yet.</li>
          )}
          {todos.filter(t => t.completed).map(todo => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      </div>
      {/* If you want to track deleted todos, you can add a similar section here in the future */}
      <AdPlaceholder position="History Bottom" />
    </div>
  );

  // Settings handlers
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'midnight',
      notifications: true,
      autoSave: true,
      soundEffects: false,
      compactMode: false,
      showCompleted: true,
      defaultPriority: 2,
      language: 'en'
    };
    setSettings(defaultSettings);
  };

  // Settings page component
  const SettingsPage = () => (
    <div className="w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      
      <AdPlaceholder position="Settings Top" />
      
      <div className="space-y-4">
        {/* Theme Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Appearance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Color Scheme</label>
                <p className="opacity-60 text-sm">Choose your preferred color theme</p>
              </div>
              <select 
                value={settings.theme} 
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="todo-input w-40"
              >
                <option value="blue-purple">Blue Purple</option>
                <option value="sunset">Sunset</option>
                <option value="ocean">Ocean</option>
                <option value="forest">Forest</option>
                <option value="midnight">Midnight</option>
                <option value="rose">Rose</option>
                <option value="aurora">Aurora</option>
                <option value="light-mode">Light Mode</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Compact Mode</label>
                <p className="opacity-60 text-sm">Reduce spacing for more content</p>
              </div>
              <button
                onClick={() => updateSetting('compactMode', !settings.compactMode)}
                className={`toggle-switch ${settings.compactMode ? 'toggle-switch-on' : 'toggle-switch-off'}`}
              >
                <div className={`toggle-switch-thumb ${settings.compactMode ? 'toggle-switch-thumb-on' : 'toggle-switch-thumb-off'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Push Notifications</label>
                <p className="opacity-60 text-sm">Get notified about deadlines</p>
              </div>
              <button
                onClick={() => updateSetting('notifications', !settings.notifications)}
                className={`toggle-switch ${settings.notifications ? 'toggle-switch-on' : 'toggle-switch-off'}`}
              >
                <div className={`toggle-switch-thumb ${settings.notifications ? 'toggle-switch-thumb-on' : 'toggle-switch-thumb-off'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Sound Effects</label>
                <p className="opacity-60 text-sm">Play sounds for actions</p>
              </div>
              <button
                onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                className={`toggle-switch ${settings.soundEffects ? 'toggle-switch-on' : 'toggle-switch-off'}`}
              >
                <div className={`toggle-switch-thumb ${settings.soundEffects ? 'toggle-switch-thumb-on' : 'toggle-switch-thumb-off'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Todo Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Todo Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Show Completed</label>
                <p className="opacity-60 text-sm">Display completed todos in list</p>
              </div>
              <button
                onClick={() => updateSetting('showCompleted', !settings.showCompleted)}
                className={`toggle-switch ${settings.showCompleted ? 'toggle-switch-on' : 'toggle-switch-off'}`}
              >
                <div className={`toggle-switch-thumb ${settings.showCompleted ? 'toggle-switch-thumb-on' : 'toggle-switch-thumb-off'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto Save</label>
                <p className="opacity-60 text-sm">Automatically save changes</p>
              </div>
              <button
                onClick={() => updateSetting('autoSave', !settings.autoSave)}
                className={`toggle-switch ${settings.autoSave ? 'toggle-switch-on' : 'toggle-switch-off'}`}
              >
                <div className={`toggle-switch-thumb ${settings.autoSave ? 'toggle-switch-thumb-on' : 'toggle-switch-thumb-off'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Default Priority</label>
                <p className="opacity-60 text-sm">Default priority for new tasks</p>
              </div>
              <select 
                value={settings.defaultPriority} 
                onChange={(e) => updateSetting('defaultPriority', Number(e.target.value))}
                className="todo-input w-32"
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Language</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">App Language</label>
              <p className="opacity-60 text-sm">Choose your preferred language</p>
            </div>
            <select 
              value={settings.language} 
              onChange={(e) => updateSetting('language', e.target.value)}
              className="todo-input w-32"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Reset</h3>
          
          <button 
            onClick={resetSettings}
            className="btn-secondary w-full"
          >
            Reset to Default Settings
          </button>
        </div>
      </div>

      <AdPlaceholder position="Settings Bottom" />
    </div>
  );

  // Auth UI
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-10 shadow-lg text-center w-full max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-white">Minimalist Todo App</h1>
          {authMode === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input type="email" className="todo-input" placeholder="Email" value={loginInfo.email} onChange={e => setLoginInfo(i => ({...i, email: e.target.value}))} required name="email" />
              <input type="password" className="todo-input" placeholder="Password" value={loginInfo.password} onChange={e => setLoginInfo(i => ({...i, password: e.target.value}))} required name="password" />
              <button className="btn-primary" type="submit" disabled={authLoading}>{authLoading ? "Logging in..." : "Login"}</button>
              <button type="button" className="btn-secondary" onClick={() => { setAuthMode("register"); setAuthError(""); }}>Create Account</button>
              {authError && <div className="toast error">{authError}</div>}
            </form>
          )}
          {authMode === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <input type="text" className="todo-input" placeholder="Name" value={registerInfo.name} onChange={e => setRegisterInfo(i => ({...i, name: e.target.value}))} required name="name" />
              <input type="email" className="todo-input" placeholder="Email" value={registerInfo.email} onChange={e => setRegisterInfo(i => ({...i, email: e.target.value}))} required name="email" />
              <input type="password" className="todo-input" placeholder="Password" value={registerInfo.password} onChange={e => setRegisterInfo(i => ({...i, password: e.target.value}))} required name="password" />
              <input type="password" className="todo-input" placeholder="Confirm Password" value={registerInfo.confirmPassword} onChange={e => setRegisterInfo(i => ({...i, confirmPassword: e.target.value}))} required name="confirmPassword" />
              <button className="btn-primary" type="submit" disabled={authLoading}>{authLoading ? "Registering..." : "Register"}</button>
              <button type="button" className="btn-secondary" onClick={() => { setAuthMode("login"); setAuthError(""); }}>Back to Login</button>
              {authError && <div className="toast error">{authError}</div>}
            </form>
          )}
          {authMode === "verify" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <input type="email" className="todo-input" placeholder="Email" value={verifyInfo.email} onChange={e => setVerifyInfo(i => ({...i, email: e.target.value}))} required name="email" />
              <input type="text" className="todo-input" placeholder="Verification Code" value={verifyInfo.code} onChange={e => setVerifyInfo(i => ({...i, code: e.target.value}))} required name="code" />
              <button className="btn-primary" type="submit" disabled={authLoading}>{authLoading ? "Verifying..." : "Verify Email"}</button>
              <button type="button" className="btn-secondary" onClick={() => { setAuthMode("login"); setAuthError(""); }}>Back to Login</button>
              {authError && <div className="toast error">{authError}</div>}
            </form>
          )}
        </div>
      </div>
    );
  }

  // Main app UI
  return (
    <div className={`min-h-screen p-4 pb-20 ${settings.compactMode ? 'compact-mode' : ''}`}>
      <Header />
      <div className="flex justify-center">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'todos' && <TodosPage />}
        {currentPage === 'schedule' && <SchedulePage />}
        {currentPage === 'features' && <FeaturesPage />}
        {currentPage === 'pricing' && <PricingPage />}
        {currentPage === 'blog' && <BlogPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'faq' && <FAQPage />}
        {currentPage === 'terms' && <TermsPage />}
        {currentPage === 'history' && <HistoryPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </div>
      <BottomNavigation />
    </div>
  );
}