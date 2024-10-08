import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({children}) {

    const {user, isLoading} = useAuth();
    if(isLoading){
        return <div>Loading...</div>
    }
    if(!user){
        return <Navigate to="/login" />
    }
    return(
        children
    )
}


function RedirectRoute({children}) {
    
    const { user, isLoading } = useAuth();
    if(isLoading){
        return <div>Loading...</div>
    }
    if(user){
        return <Navigate to="/" />
    }
    return(
        children
    )
}

function VerifyEmailRoute({children}) {
    
    const { user, isLoading } = useAuth();
    if(isLoading){
        return <div>Loading...</div>
    }
    if(user && !user.isVerified){
        return children;
    }
    return <Navigate to="/" />
}

export { ProtectedRoute, RedirectRoute, VerifyEmailRoute }