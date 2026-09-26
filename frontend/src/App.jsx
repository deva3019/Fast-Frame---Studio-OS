import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Events from './pages/Events';
import Galleries from './pages/Galleries';
import Invoices from './pages/Invoices'; // <-- Add this import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="events" element={<Events />} />
          <Route path="galleries" element={<Galleries />} />
          <Route path="invoices" element={<Invoices />} /> {/* <-- Add this route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;