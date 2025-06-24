## A web application allowing students to share opinions and participate in discussions without revealing their identities & addressing privacy concerns. 
Designed to foster open communication, targeting university communities for sharing gossip, updates, and discussions. Introduced community-specific discussion boards.


## Local Setup
1. Fork the Repo
2. Clone the Forked Repo `https://github.com/{your-user-name}/Whisper.git`
3. Write these steps into the project dir.
```
cd frontend
npm install
cd ../backend
npm install
```
4. Create a cluster in mongodb and get the database url.
5. Set up env variables
`cp backend/.env.sample backend/.env && cp frontend/.env.sample frontend/.env`
6. Finally, Run `npm run dev` in frontend & backend dir.
