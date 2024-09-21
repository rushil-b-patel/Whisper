import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({children}) {
    
    const {user} = useAuth();
    
    if(!user){
        return <Navigate to="/login" />
    }
    return(
        children
    )
}


function RedirectRoute({children}) {
    
    const { user } = useAuth();

    if(user){
        return <Navigate to="/" />
    }
    return(
        children
    )
}

function VerifyEmailRoute({children}) {
    
    const { user } = useAuth();
    
    if(user && !user.isVerified){
        return children;
    }
    return <Navigate to="/" />
}

export { ProtectedRoute, RedirectRoute, VerifyEmailRoute }