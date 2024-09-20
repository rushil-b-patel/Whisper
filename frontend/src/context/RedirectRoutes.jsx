import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

function RedirectRoutes({children}) {
    
    const { user, loading } = useAuth();

    if(loading) {
        return <div>Loading...</div>;
    }

    if(user){
        return <Navigate to="/" />
    }
    return(
        children
    )
}

export default RedirectRoutes