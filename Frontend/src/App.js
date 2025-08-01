import {BrowserRouter,Routes,Route} from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Admin from './Components/Admin';
import Registration from './Components/Registration';
import Properties from './Components/Properties'
import ProtectedAdmin from './Components/ProtectedAdmin';
import Profile from './Components/profile';
import PropertyDetails from './Components/propertyDetails';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>    
          <Route path ="/" element={<Login/>}/> 
      <Route path="/dashboard" element={<Dashboard />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdmin allowedRole="admin">
            <Admin />
          </ProtectedAdmin>
        }
      />
          <Route path="/registration/" element={<Registration/>}/>
          <Route path="/properties" element={<Properties/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/properties/:id" element={<PropertyDetails/>} />

        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
