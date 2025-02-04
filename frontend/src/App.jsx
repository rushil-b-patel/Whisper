import { Route, Routes } from "react-router-dom"
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import {ProtectedRoute, RedirectRoute, VerifyEmailRoute} from "./context/ProtectedRoutes";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {

  return (
    <>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/profile' element={<ProtectedRoute ><Profile /></ProtectedRoute>} />
      <Route path='/login' element={<RedirectRoute ><Login /></RedirectRoute>} />
      <Route path='/signup' element={<RedirectRoute ><Signup /></RedirectRoute>} />
      <Route path='/verify-email' element={<VerifyEmailRoute ><VerifyEmail /></VerifyEmailRoute>} />
      <Route path='/create-post' element={<ProtectedRoute ><CreatePost /></ProtectedRoute>} />
      <Route path='/post/:id' element={<PostDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Toaster />
    </>
  )
}

export default App