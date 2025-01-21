import http from "node:http";
// import server from "../server-setup.js";
import {sessions} from "../routes.js";

const auth = (req: http.IncomingMessage, res: http.ServerResponse, next: Function)=>{
	const cookie = req.headers.cookie?.split('=')[1].toString()
	const verification = sessions.find((storedCookie)=>{return storedCookie === cookie})
	// console.log(cookie)
	if (verification){
		next()
	} else{
		res.statusCode = 401;
		res.send('cookie verification failed!')

	}
}
export default auth