import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from './envVariables.js';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        return payload;
    }
    catch(error){
        console.log(error);
        throw new Error('Google authentication failed');
    }
}