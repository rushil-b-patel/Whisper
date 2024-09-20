import { Route, Routes } from "react-router-dom"
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoutes from "./context/ProtectedRoutes";
import RedirectRoutes from "./context/RedirectRoutes";

function App() {

  return (
    <>
    <Navbar />
    <Routes>
      
      <Route path='/' element={<ProtectedRoutes element={<Home />}></ProtectedRoutes>} />
      <Route path='/login' element={<RedirectRoutes ><Login /></RedirectRoutes>} />
      <Route path='/signup' element={<RedirectRoutes ><Signup /></RedirectRoutes>} />
      <Route path="*" element={<NotFound />} />
    
    </Routes>
    </>
  )
}

export default App


// error showing in ui
// Verify-email page and logic