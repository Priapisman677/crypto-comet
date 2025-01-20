import Comet from "../framework/comet.js";
import http from "node:http";
import fs from "node:fs";
import router from "./routes.js";


console.clear();



const __dirname = import.meta.dirname;

const server = new Comet();

server.useRouter(router)

//prettier-ignore
server.setSymerticKey('e49a5e61a1786622984acd671667c1e8ddcffa4041963df47ef8bc738dfa26a6', 'hex')

server.setStaticDir(process.env.DIRNAME || __dirname + "/public");

//* MIDDLEWARE
//prettier-ignore

//prettier-ignore


//* ROUTE HANDLERS
//prettier-ignore
// server.get('/getpath', printHi, async (req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	const body = await req.body()
// 	console.log('reqbody:', body) 
// 	res.setHeader('lol', 'lol')
// 	res.statusCode = 200;
// 	res.send('Hello from getpath')
// })

// //prettier-ignore
// server.get('/testencrypt', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	res.encrypt().send('Hello')
// })

// //prettier-ignore
// server.get('/login', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	const cookie = Math.floor(Math.random()*100000000000).toString()
// 	server.SESSIONS.push(cookie) 
// 	res.setHeader('Set-cookie' ,[`cookie1=${cookie}; HttpOnly; Path=/;`]);
// 	res.status(200).send(`cookie sent: (${cookie})`)
// })
// //prettier-ignore
// server.get('/checkcookie', (req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	console.log(req.headers.cookie)
// 	const cookie = req.headers.cookie?.split('=')[1].toString()
// 	const verification = server.SESSIONS.find((storedCookie)=>{return storedCookie === cookie})
// 	// console.log(cookie)
// 	if (verification){
// 		res.send('cookie verification succesful!')

// 	} else{
// 		res.statusCode = 401;
// 		res.send('cookie verification failed!')

// 	}

// })
// //prettier-ignore
// server.get('/authcookie', auth, (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	res.send('Completed cookie authorization successfully!')
// })

// //prettier-ignore
// server.post('/testparsebody', async(req: http.IncomingMessage, res: http.ServerResponse)=>{
// 		const body = await req.body()
// 		if(!body){
// 			res.statusCode = 400;
// 			res.send('Body is too large!')
// 			req.destroy()
// 		}else{
// 			res.send(JSON.stringify(body))
// 		}
		

// })

// //prettier-ignore
// server.get('/', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	res.sendFile('index.html')
// })
// //prettier-ignore
// server.get('/requestnameimage', (req: http.IncomingMessage, res: http.ServerResponse)=>{
	
// 	let message: any
// 	req.on('data', (data)=>{
// 		message = JSON.parse(data.toString())
// 	})
// 	req.on('end', ()=>{
// 		res.sendFile(message.fileName)
// 		//$ For some reason that I don't know (and I should know lol) if I d(o " as any).send()" it doesn't work.
// 		// res.send()
// 	})
// })
// //prettier-ignore
// server.post('/postpath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	res.send('Hello from postpath!')
// })
// //prettier-ignore
// server.post('/upload', (req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	//! I need to implement url parameters here.
// 	const writable = fs.createWriteStream(__dirname + '/public/' + req.headers['file-name'])
// 	// req.pipe(writable)
// 	req.on('data', (chunk)=>{
// 		writable.write(chunk)
// 	})
// 	req.on('end', ()=>{
// 		res.send('Recibì tu archivo, colega!')
// 	})
// })

// //prettier-ignore
// server.post("/upload2", async (req: http.IncomingMessage, res: http.ServerResponse) => {
// 	debugger
// 		const fileName = req.headers['file-name']
// 		if(!fileName || typeof fileName !== 'string'){
// 			res.statusCode = 400;
// 			res.send("No file name provided or invalid format");
// 			req.destroy();
// 			return
// 		}
// 		console.log("File name: ", fileName);
// 		const result = await req.saveToFile(fileName, 1e6);
// 		if (!result) {
// 			res.statusCode = 400;
// 			res.send("Unable to upload your file, maybe it is too big?");
// 			req.destroy();
// 		} else {
// 			res.send("Successfully uploaded your file");
// 		}
// 	}
// );

// //prettier-ignore
// server.get('/styles.css', (_req: http.IncomingMessage, res: http.ServerResponse)=>{ 
// 	// res.statusCode = 200;
// 	res.sendFile('styles.css')
// })
// //prettier-ignore
// server.get('/index.js', (_req: http.IncomingMessage, res: http.ServerResponse)=>{	
// 	res.sendFile('index.js')
// })
// //prettier-ignore
// server.delete('/deletepath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	res.send('Hello from deletepath!')
// })
// //prettier-ignore
// server.patch('/patchpath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
// 	res.send('Hello from patchpath!')
// })



process.stdin.on("data", (data) => {
	const str = data.toString().trim();
	if (str === "R" || str === "r") {
		console.log(server.routes);
	}
	if (str === "S" || str === "s") {
		console.log(server.SESSIONS);
	}
});

//! We are listening in another file so that we could also test in its um file.

export default server;
