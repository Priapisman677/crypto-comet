import Comet from "../framework/comet.js";
import router from "./routes.js";
import http from "node:http";
import crypto from 'node:crypto'
// import auth from "./middleware/auth.js";


const __dirname = import.meta.dirname;

console.clear();

const server = new Comet();


//prettier-ignore
// server.setSymerticKey('e49a5e61a1786622984acd671667c1e8ddcffa4041963df47ef8bc738dfa26a6', 'hex')

server.setStaticDir(process.env.DIRNAME || __dirname + "/public");

server.setIpBlacklist('333.333.333.333')
server.setIpWhitelist('127.0.0.1', '123.123.123.13')



//* These are all my routes and middleware:
server.useRouter(router)

server.get('/getpublicKey', async (req: http.IncomingMessage, res: http.ServerResponse) =>{
	req
	res.send(server.keyPair.publicKey)
})

server.post('/sendsymmetrickey', async (req: http.IncomingMessage, _res: http.ServerResponse)=>{
	const data = await req.body()
	//prettier-ignore
	const decryptedSymmetricKey = crypto.privateDecrypt(server.keyPair.privateKey, Buffer.from(data, 'hex'))
	server.symmetricKey = decryptedSymmetricKey
	console.log(server.symmetricKey)
})

server.post('/testdecrypt', async (req: http.IncomingMessage, _res: http.ServerResponse) =>{
	try{
		const message = await req.decrypt().body()
		console.log(message)

	}catch{
		console.log('Encryption failed, did the user send a symmetric key already?')
		return
	}
	//* I need to create something like req.decrypt.body()
	
})









process.stdin.on("data", (data) => {
	const str = data.toString().trim();
	if (str === "R" || str === "r") {
		console.log(server.routes);
	}

});

//! We are listening in another file so that we could also test in its um file.

export default server;
