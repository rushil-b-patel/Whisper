import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoutes({children}) {
    
    const {user} = useAuth();
    
    if(!user){
        return <Navigate to="/login" />
    }
    return(
        children
    )
}

export default ProtectedRoutes