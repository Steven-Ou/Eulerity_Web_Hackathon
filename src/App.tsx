import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Dashboard from './pages/Dashboard/Dashboard';
import NetworkDetail from './pages/NetworkDetail/NetworkDetail';

// --- STYLED COMPONENTS FOR NAVIGATION ---
const NavContainer = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  text-decoration: none;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  /* Dynamic styling based on whether we are on this page */
  color: ${props => props.$isActive ? '#ffffff' : '#555555'};
  background: ${props => props.$isActive ? '#aa3bff' : 'transparent'};

  &:hover {
    background: ${props => props.$isActive ? '#aa3bff' : '#f0f0f0'};
    color: ${props => props.$isActive ? '#ffffff' : '#111111'};
  }
`;

// Helper component to apply active styles based on the current URL
function NavigationMenu() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <NavContainer>
      <NavLink to="/" $isActive={currentPath === '/'}>Dashboard</NavLink>
      <NavLink to="/meta" $isActive={currentPath === '/meta'}>Meta</NavLink>
      <NavLink to="/google" $isActive={currentPath === '/google'}>Google</NavLink>
      <NavLink to="/linkedin" $isActive={currentPath === '/linkedin'}>LinkedIn</NavLink>
    </NavContainer>
  );
}

// --- MAIN APP ---
export default function App() {
  return (
    <BrowserRouter>
      <NavigationMenu />
      
      <main style={{ padding: '0 20px', paddingBottom: '50px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/:networkId" element={<NetworkDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}