import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import IB from './components/IB';
import Leaderboard from './components/Leaderboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ib/:gameId" element={<IB />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes> 
    </Router>
  );
}

export default App;
