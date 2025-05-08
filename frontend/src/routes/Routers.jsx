
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'  
import UserPortal from '../pages/UserPortal' 
import DeveloperPortal from '../pages/DeveloperPortal' 
import DocsDemoPage from '../pages/DocsDemoPage';
import CallResult from '../pages/callResult';
const Routers = () => {
  return <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/home' element={<Home />} />  
    <Route path='/userportal' element={<UserPortal />} /> 
    <Route path='/developerportal' element={<DeveloperPortal />} /> 
    <Route path="/demo" element={<DocsDemoPage />} />
    <Route path="/callresult" element={<CallResult />} />
  </Routes>
};

export default Routers;
