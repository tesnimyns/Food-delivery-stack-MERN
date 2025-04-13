import  { useState } from 'react'
import Navbar from './components/Navbar/Narbar'
import Footer from './components/Footer/Footer'
import AppDownload from './components/AppDownload/AppDownload.tsx'
import {  Routes , Route} from "react-router-dom";
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart.tsx'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder.tsx'
import LoginPopup from './components/LoginPopup/LoginPopup.tsx';

import AboutUs from './components/AboutUs/AboutUs.tsx';
import Verify from './pages/Verify/Verify.tsx';
import Myorders from './pages/Myorders/Myorders.tsx';
import Chatbot from './components/Chatbot/Chatbot.jsx'



const App = () => {

  const [showLogin , setShowLogin] = useState(false)

  const [results,setResults] =useState<any[]>([]);

  return (
    <>
    {showLogin ? <LoginPopup setShowLogin={setShowLogin}/> : <></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin} setResults={setResults}/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>}/>
        <Route  path='/order' element={<PlaceOrder/>}/>
        
        <Route path='/AboutUs' element={<AboutUs/>}/>
        <Route path='/AppDownload' element={<AppDownload/>} />
        <Route path='/Verify' element={<Verify/>} />
        <Route path='/myorders' element={<Myorders/>} />
        

        

      </Routes>
       <AppDownload/> 
       <AboutUs/>
       <Chatbot />
      <Footer/>

      

    </div>
    </>
  )
}

export default App
