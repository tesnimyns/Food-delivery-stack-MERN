import { useState } from 'react'
import Header from './components/Header/Header.tsx'
import SlideBar from './components/SlideBar/SideBar.tsx'
import './App.css'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home/Home.tsx'
import Orders from './pages/Orders/Orders.tsx'
import ListProducts from './pages/ListProducts/ListProducts.tsx'
import AddProducts from './pages/AddProducts/AddProducts.tsx'
import { ToastContainer} from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

 

const App = () => {

  const [openSidebarToggle,setOpenSidebarToggle] = useState(false)

   const OpenSidebar = () => {
     setOpenSidebarToggle(!openSidebarToggle)
   }
   const url = "http://localhost:4000"

  return (
    <>
    < ToastContainer/> 
    <div className='grid-container'>
       
      <Header OpenSidebar={OpenSidebar}/> 
      <SlideBar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
      
  
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/add' element={<AddProducts url={url}/>}/>
        <Route path='/products' element={<ListProducts url={url}/>}/>
        <Route path='/orders' element={<Orders url={url}/>}/>

      </Routes>
    </div>
    </>
  )
}

export default App
