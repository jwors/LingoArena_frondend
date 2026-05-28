import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import GameRoomPage from './pages/GameRoomPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:id" element={<GameRoomPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
