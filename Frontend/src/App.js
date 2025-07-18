import {BrowserRouter,Routes,Route} from 'react-router-dom';
import './App.css';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Admin from './Components/Admin';
import Registration from './Components/Registration';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>    
          <Route path ="/" element={<Login/>}/> 
          <Route path="/dashboard/" element={<Dashboard/>}/>
          <Route path="/admin/" element={<Admin/>}/>
          <Route path="/registration/" element={<Registration/>}/>

        </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
