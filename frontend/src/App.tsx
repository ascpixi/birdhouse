import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isAuthenticated } from './auth'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { PostPage } from './pages/PostPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <HomePage/> : <Navigate to="/auth"/>} />
        <Route path="/auth" element={<AuthPage/>} />
        <Route path="/profile/:handle" element={<ProfilePage />} />
        <Route path="/post/:postId" element={<PostPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
