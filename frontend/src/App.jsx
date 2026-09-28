import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Events from './pages/Events';
import Galleries from './pages/Galleries';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Crew from './pages/Crew'; 
import ClientGallery from './pages/ClientGallery';
import PostProduction from './pages/PostProduction';
import Settings from './pages/Settings';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (No Sidebar) */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gallery/:eventId" element={<ClientGallery />} /> 

        {/* PROTECTED ADMIN ROUTES (With Sidebar) */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="events" element={<Events />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="post-production" element={<PostProduction />} />
          <Route path="settings" element={<Settings />} />
          <Route path="crew" element={<Crew />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;