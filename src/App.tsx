import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import NetworkDetail from './pages/NetworkDetail/NetworkDetail';

// Temporary inline styles just to see the nav structure
const navStyle = {
  display: 'flex',
  gap: '20px',
  padding: '20px',
  background: '#f4f4f4',
  borderBottom: '1px solid #ddd'
};

function App() {
  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <Link to="/">Dashboard</Link>
        <Link to="/meta">Meta</Link>
        <Link to="/google">Google</Link>
        <Link to="/linkedin">LinkedIn</Link>
      </nav>

      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* :networkId will dynamically capture 'meta', 'google', or 'linkedin' */}
          <Route path="/:networkId" element={<NetworkDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;