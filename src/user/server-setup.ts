import Comet from "../framework/comet.js";
import router from "./routes.js";
import http from "node:http";
import crypto from 'node:crypto'
import chalk from "chalk";
import fs from 'node:fs'



const __dirname = import.meta.dirname;

console.clear();

const options = {
	key: fs.readFileSync((process.env.DIRNAME || __dirname) + '/key.pem'),
	cert: fs.readFileSync((process.env.DIRNAME || __dirname) + '/cert.pem'),
}

//* The test will always be running on http:
const server = new Comet((process.env.PROTOCOL || 'https'), options);


//prettier-ignore
// server.setSymerticKey('e49a5e61a1786622984acd671667c1e8ddcffa4041963df47ef8bc738dfa26a6', 'hex')

server.setStaticDir((process.env.DIRNAME || __dirname) + "/public");

server.setIpBlacklist(['203.0.113.42'], (req: http.IncomingMessage, res: http.ServerResponse)=>{
	res.status(401).send('Denied')
})
// server.setIpWhitelist(['127.0.0.1', '123.123.123.13'])


//* These are all my routes and middleware:
server.useRouter(router)

//prettier-ignore
server.get('/getpublicKey', async (_req: http.IncomingMessage, res: http.ServerResponse) =>{
	res.send(server.keyPair.publicKey)
})

//prettier-ignore
server.post('/sendsymmetrickey', async (req: http.IncomingMessage, _res: http.ServerResponse)=>{
	const data = await req.body()
	//prettier-ignore
	const decryptedSymmetricKey = crypto.privateDecrypt(server.keyPair.privateKey, Buffer.from(data, 'hex'))
	server.setSymerticKey(decryptedSymmetricKey)
})

//prettier-ignore
server.post('/testdecrypt', async (req: http.IncomingMessage, _res: http.ServerResponse) =>{
	try{
		const message = await req.decrypt().body()
		console.log(message)

	}catch(e){
		console.log(chalk.red.inverse('Encryption failed, did the user send a symmetric key already?'))
		console.log(e)
		return 
	}
	//* I need to create something like req.decrypt.body()
	
})

//prettier-ignore
server.get('/testencrypt', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.encrypt().send('Hello')
})







process.stdin.on("data", (data) => {
	const str = data.toString().trim();
	if (str === "R" || str === "r") {
		console.log(server.routes);
	}

});

//! We are listening in another file so that we could also test in its um file.

export default server;
