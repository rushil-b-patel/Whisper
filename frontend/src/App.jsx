import { Route, Routes } from "react-router-dom"
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

function App() {

  return (
    <>
    <Navbar />
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}

export default App
