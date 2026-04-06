import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from './lib/query-client.js'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { pagesConfig } from './pages.config';

console.log('App.jsx: Starting to load...');

const { Pages, Layout, mainPage } = pagesConfig;
console.log('App.jsx: Pages config loaded:', Object.keys(Pages));
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

console.log('App.jsx: Main page:', mainPageKey);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  console.log('App.jsx: AuthenticatedApp rendering...');
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  
  console.log('App.jsx: Auth state:', { isLoadingAuth, isLoadingPublicSettings, authError });

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    console.log('App.jsx: Showing loading spinner...');
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    console.log('App.jsx: Auth error:', authError);
    if (authError.type === 'user_not_registered') {
      return <div>User not registered</div>;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  console.log('App.jsx: Rendering main app routes...');
  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      {/* Dynamic chat route for individual groups */}
      <Route
        path="/chat/:groupId"
        element={
          <LayoutWrapper currentPageName="chat">
            <Pages.Chat />
          </LayoutWrapper>
        }
      />
      {/* Dynamic groups route with optional groupId */}
      <Route
        path="/groups/:groupId?"
        element={
          <LayoutWrapper currentPageName="groups">
            <Pages.Groups />
          </LayoutWrapper>
        }
      />
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;
