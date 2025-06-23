import React, { useState, useCallback, useEffect, useRef } from 'react';
import LoginPage from './components/LoginPage';
import OrdersPage from './components/OrdersPage';
import { SupplierPricePage } from './components/SupplierPricePage';
import DashboardPage from './components/DashboardPage';
import UserManagementPage from './components/UserManagementPage';
import { ExploitViewPage } from './components/ExploitViewPage'; 
import TradingAccountPage from './components/TradingAccountPage'; // Import the new TradingAccountPage
import { Page, Order, User, AppPermission, NewUserPayload, UserPermissionSet, ExcelWorkbook, ExcelSheet } from './types';
import { useUser } from './contexts/UserContext';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const LAST_ACTIVITY_LS_KEY = 'appLastActivityTime';
const LOGGED_IN_USERNAME_LS_KEY = 'loggedInUsername';
const USERS_LS_KEY = 'appUsers';

// Base URL for your backend API (can still be used for orders, etc.)
const API_BASE_URL = '/api'; // Replace with your actual backend URL if different

const DEFAULT_ADMIN_USER: User = {
  id: 'default-admin-001',
  username: 'user',
  password: 'password', // Stored in plain text for this client-side demo
  permissions: {
    [AppPermission.CAN_VIEW_ORDERS]: true,
    [AppPermission.CAN_EDIT_ORDERS]: true,
    [AppPermission.CAN_IMPORT_EXPORT_ORDERS]: true,
    [AppPermission.CAN_VIEW_SUPPLIER_PRICES]: true,
    [AppPermission.CAN_EDIT_SUPPLIER_PRICES]: true,
    [AppPermission.CAN_VIEW_DASHBOARD]: true,
    [AppPermission.CAN_MANAGE_USERS]: true,
  },
  isDefaultAdmin: true,
};

const App: React.FC = () => {
  const { currentUser, setCurrentUser, hasPermission: contextHasPermission } = useUser();
  
  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem(USERS_LS_KEY);
    console.log("App Init: Attempting to load users from localStorage.");
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        console.log("App Init: Found users in localStorage:", parsedUsers);
        // Ensure default admin always has correct properties if present
        const adminIndex = parsedUsers.findIndex((u: User) => u.id === DEFAULT_ADMIN_USER.id);
        if (adminIndex !== -1) {
            parsedUsers[adminIndex] = { 
              ...parsedUsers[adminIndex], // Keep existing non-critical data from storage
              username: DEFAULT_ADMIN_USER.username, // Enforce default username
              password: DEFAULT_ADMIN_USER.password, // Enforce default password
              permissions: DEFAULT_ADMIN_USER.permissions, // Enforce default permissions
              isDefaultAdmin: true // Ensure default admin flag
            };
        } else if (!parsedUsers.find((u:User) => u.isDefaultAdmin)) { 
            console.log("App Init: Default admin not found, adding to list.");
            parsedUsers.push(DEFAULT_ADMIN_USER);
        }
        return parsedUsers;
      } catch (e) {
        console.error("App Init: Failed to parse users from localStorage, defaulting.", e);
        return [DEFAULT_ADMIN_USER];
      }
    }
    console.log("App Init: No users in localStorage, initializing with default admin.");
    return [DEFAULT_ADMIN_USER]; // Initialize with default admin if nothing in localStorage
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [autoLogoutMessage, setAutoLogoutMessage] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  
  const [orders, setOrdersState] = useState<Order[]>([]); 
  const [isLoadingOrders, setIsLoadingOrders] = useState(false); // This can still be used by OrdersPage for its local loading states

  const logoutTimerRef = useRef<number | null>(null);

  // Persist users to localStorage whenever the users state changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_LS_KEY, JSON.stringify(users));
      console.log('Users saved to localStorage:', users); 
    } catch (e) {
      console.error("Failed to save users to localStorage:", e);
      // Potentially alert user that settings might not be saved (e.g. if storage is full)
    }
  }, [users]);

  // Client-side session check on app load
  useEffect(() => {
    const loggedInUsername = localStorage.getItem(LOGGED_IN_USERNAME_LS_KEY);
    if (loggedInUsername) {
      const userFromStorage = users.find(u => u.username === loggedInUsername);
      if (userFromStorage) {
        setCurrentUser(userFromStorage);
        resetInactivityTimer(); 
      } else {
        localStorage.removeItem(LOGGED_IN_USERNAME_LS_KEY);
        localStorage.removeItem(LAST_ACTIVITY_LS_KEY);
      }
    }
  }, [users, setCurrentUser]); 

  // API request helper (can remain for non-auth, non-order-source features)
  const apiRequest = useCallback(async (endpoint: string, method: string = 'GET', body?: any) => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const config: RequestInit = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    const responseData = await response.json().catch(() => ({ message: `Failed to parse JSON response for ${response.status} ${response.statusText}` }));
    if (!response.ok) {
       let errMessage = responseData.message || `API request to ${endpoint} failed with status ${response.status}: ${response.statusText || 'Unknown error'}`;
      throw new Error(errMessage);
    }
    return responseData;
  }, []);

  // Fetch orders: Now does nothing by default, OrdersPage will load from Google Sheets.
  // This function is kept for structural compatibility if OrdersPage still expects it.
  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    // console.log("fetchOrders called, but now relies on OrdersPage to populate data client-side.");
    // setIsLoadingOrders(true); // OrdersPage can manage its own loading state for GSheet
    // // No API call here for fetching all orders.
    // setIsLoadingOrders(false);
    return Promise.resolve(); // Return a resolved promise
  }, [currentUser]);


  useEffect(() => {
    if (currentUser) {
        // If orders were persisted to localStorage, you could load them here.
        // For now, it's empty on login, awaiting OrdersPage load.
        // fetchOrders(); // Call it if it does something meaningful client-side (e.g. localStorage load)
    } else {
        setOrdersState([]); 
    }
  }, [currentUser]); // Removed fetchOrders from dep array as it does nothing now by itself.

  const performLogout = useCallback((message?: string, resetActivity: boolean = true) => {
    setCurrentUser(null);
    localStorage.removeItem(LOGGED_IN_USERNAME_LS_KEY);

    if (resetActivity) localStorage.removeItem(LAST_ACTIVITY_LS_KEY);
    
    if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
    }
    setActivePage(Page.Home);
    setOrdersState([]); 
    
    localStorage.removeItem('projectOrdersGoogleSheetUrl'); 
    localStorage.removeItem('projectOrdersLastRefreshTime');
    
    if (message) setAutoLogoutMessage(message);
    else setAutoLogoutMessage(null);

  }, [setCurrentUser]);

  const handleLogout = useCallback(() => {
    performLogout();
  }, [performLogout]);

  const resetInactivityTimer = useCallback(() => {
    if (!currentUser) return; 

    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    localStorage.setItem(LAST_ACTIVITY_LS_KEY, Date.now().toString());
    logoutTimerRef.current = window.setTimeout(() => {
        performLogout("You have been logged out due to inactivity.");
    }, INACTIVITY_TIMEOUT_MS);
  }, [currentUser, performLogout]);

  useEffect(() => {
    if (currentUser) {
        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
        const handleActivity = () => resetInactivityTimer();

        const lastActivityStored = localStorage.getItem(LAST_ACTIVITY_LS_KEY);
        if (lastActivityStored) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivityStored, 10);
            if (timeSinceLastActivity >= INACTIVITY_TIMEOUT_MS) {
                performLogout("Session expired due to inactivity.");
                return; 
            } else {
                if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
                logoutTimerRef.current = window.setTimeout(() => {
                   performLogout("You have been logged out due to inactivity.");
                }, INACTIVITY_TIMEOUT_MS - timeSinceLastActivity);
            }
        } else {
            resetInactivityTimer(); 
        }

        events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === LOGGED_IN_USERNAME_LS_KEY && !event.newValue) {
                 performLogout("Session ended in another tab.", false);
            }
             if (event.key === LAST_ACTIVITY_LS_KEY && event.newValue) { 
                resetInactivityTimer();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            window.removeEventListener('storage', handleStorageChange);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    } else {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }
  }, [currentUser, resetInactivityTimer, performLogout]);


  const handleLogin = useCallback(async (usernameInput: string, passwordInput: string) => {
    const trimmedUsername = usernameInput.trim();
    const trimmedPassword = passwordInput.trim(); 
    setLoginError(null);
    try {
      const userToLogin = users.find(
        u => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.password === trimmedPassword
      );

      if (userToLogin) {
        setCurrentUser(userToLogin);
        localStorage.setItem(LOGGED_IN_USERNAME_LS_KEY, userToLogin.username);
        setAutoLogoutMessage(null); 
        setActivePage(Page.Orders); // Navigate to Orders page on successful login
        resetInactivityTimer(); 
      } else {
        throw new Error('Invalid username or password.');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setLoginError(errorMessage); 
      setCurrentUser(null);
      localStorage.removeItem(LOGGED_IN_USERNAME_LS_KEY);
      throw new Error(errorMessage); 
    }
  }, [users, setCurrentUser, setActivePage, resetInactivityTimer]);

  const NavLink: React.FC<{ page: Page; current: Page; onClick: (page: Page) => void; children: React.ReactNode; icon?: React.ReactNode; isVisible?: boolean }> = ({ page, current, onClick, children, icon, isVisible = true }) => {
    if (!isVisible) return null;
    const isActive = page === current;
    return (
      <button
        onClick={() => onClick(page)}
        className={`flex items-center space-x-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ease-in-out group
                    ${isActive 
                      ? 'bg-sky-600 text-white shadow-lg transform scale-105' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white'
                    }
                    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75`}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  };
  
  const PlaceholderPage: React.FC<{ title: string; icon?: React.ReactNode, message?: string }> = ({ title, icon, message }) => (
    <div className="p-6 md:p-10 lg:p-12">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-sky-100 text-sky-600 rounded-full mb-4 text-3xl">
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          )}
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1> 
        <p className="mt-3 text-lg text-slate-700 max-w-2xl mx-auto">{message || `This page is currently under construction. Exciting features for '${title}' are coming soon!`}</p>
      </header>
      <div className="mt-10 p-6 bg-white rounded-xl shadow-xl">
        <div className="aspect-w-16 aspect-h-9">
            <img 
                src={`https://source.unsplash.com/random/1200x600?query=${title.toLowerCase().replace(/\s/g,',')},technology,office,data&random=${Math.random()}`} 
                alt={`${title} placeholder image`} 
                className="rounded-lg shadow-md w-full h-full object-cover" 
            />
        </div>
        <p className="mt-6 text-sm text-slate-500 text-center">Illustrative image. Actual content will vary.</p>
      </div>
    </div>
  );

  const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;
  const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536.219-2.121.782l-.879.659M7.5 12m0 0l1.409-1.409c1.172-.879 3.07-.879 4.243 0l1.409 1.409M7.5 12l.75.75M7.5 12h.75m0 0l.75-.75M16.5 12m0 0l-.75.75M16.5 12h-.75m0 0l-.75-.75M9 15l.75.75M9 15h.75m0 0l.75-.75M13.5 15l.75.75M13.5 15h.75m0 0l.75-.75M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" /></svg>;
  const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>;
  const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5h16.5V3H3.75zm0 3.75h16.5M9 3v16.5M15 3v16.5M3.75 9h16.5M3.75 15h16.5" /></svg>;
  const UserManagementIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
  const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;
  const MagnifyingGlassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
  const BriefcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v.098M2.25 10.5h19.5M14.25 9a3.75 3.75 0 11-7.5 0 3.375 3.375 0 017.5 0z" /></svg>;


  const HomePageContent = () => <PlaceholderPage title="Welcome to OrderFlow" icon={<HomeIcon />} message="Your central hub for managing project orders, supplier prices, and insightful dashboards. Navigate using the menu above." />;
  const HelpPageContent = () => <PlaceholderPage title="Help & Support" icon={<HelpIcon />} message="Find answers to common questions and learn how to make the most of OrderFlow. For specific issues, please contact our support team."/>;
  
  const renderPage = () => {
    switch (activePage) {
      case Page.Home:
        return <HomePageContent />;
      case Page.SupplierPrice:
        return <SupplierPricePage orders={orders} setOrders={setOrdersState} />; 
      case Page.Orders:
        return <OrdersPage 
                  orders={orders} 
                  setOrders={setOrdersState} 
                  isLoadingOrders={isLoadingOrders} 
                  fetchOrders={fetchOrders} 
                  apiRequest={apiRequest} 
                />;
      case Page.ExploitView:
        return <ExploitViewPage />;
      case Page.TradingAccount:
        return <TradingAccountPage orders={orders} />; // Pass orders prop
      case Page.Dashboard:
        return <DashboardPage orders={orders} />;
      case Page.UserManagement:
        if (currentUser?.isDefaultAdmin === true || contextHasPermission(AppPermission.CAN_MANAGE_USERS)) {
          return <UserManagementPage 
                    users={users} 
                    setUsers={setUsers} 
                  />;
        }
        return <PlaceholderPage title="Access Denied" icon={<HelpIcon />} message="You do not have permission to view this page."/>;
      case Page.Help:
        return <HelpPageContent />;
      default:
        setActivePage(Page.Home); 
        return <HomePageContent />;
    }
  };

  if (!currentUser) { 
    return <LoginPage onLogin={handleLogin} autoLogoutMessage={autoLogoutMessage} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <nav className="bg-slate-900 shadow-2xl sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                 <span className="text-3xl font-bold text-white tracking-tight">
                    Order<span className="text-sky-400">Flow</span>
                </span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-1 lg:space-x-2"> {/* Reduced space-x */}
                  <NavLink page={Page.Home} current={activePage} onClick={setActivePage} icon={<HomeIcon />}>Home</NavLink>
                  <NavLink page={Page.SupplierPrice} current={activePage} onClick={setActivePage} icon={<PriceIcon />}>{Page.SupplierPrice}</NavLink>
                  <NavLink page={Page.Orders} current={activePage} onClick={setActivePage} icon={<OrdersIcon />}>Orders</NavLink>
                  <NavLink page={Page.ExploitView} current={activePage} onClick={setActivePage} icon={<MagnifyingGlassIcon />}>{Page.ExploitView}</NavLink>
                  <NavLink page={Page.TradingAccount} current={activePage} onClick={setActivePage} icon={<BriefcaseIcon />}>{Page.TradingAccount}</NavLink>
                  <NavLink page={Page.Dashboard} current={activePage} onClick={setActivePage} icon={<DashboardIcon />}>Dashboard</NavLink>
                  <NavLink 
                    page={Page.UserManagement} 
                    current={activePage} 
                    onClick={setActivePage} 
                    icon={<UserManagementIcon />}
                    isVisible={currentUser?.isDefaultAdmin === true} 
                  >
                    User Management
                  </NavLink>
                  <NavLink page={Page.Help} current={activePage} onClick={setActivePage} icon={<HelpIcon />}>Help</NavLink>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium text-slate-300 bg-slate-800 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-all duration-150 ease-in-out group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:text-white transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Logout ({currentUser.username})</span>
              </button>
            </div>
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button can be re-enabled here if needed */}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {loginError && !currentUser && ( 
           <div className="fixed top-5 right-5 z-[100] w-full max-w-sm p-4" role="alert">
            <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2 shadow-lg">
              Login Failed
            </div>
            <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700 shadow-lg">
              <p>{loginError}</p>
            </div>
          </div>
        )}
        <div className="py-6 md:py-8 lg:py-10"> 
          {renderPage()}
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-center p-6 text-sm border-t border-slate-700">
        &copy; {new Date().getFullYear()} OrderFlow Solutions. All rights reserved.
        <p className="mt-1 text-slate-500">Built with Precision and Care.</p>
      </footer>
    </div>
  );
};

export default App;