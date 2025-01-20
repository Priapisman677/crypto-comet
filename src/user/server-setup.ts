import Comet from "../framework/comet.js";
import http from "node:http";
import fs from "node:fs";

console.clear();


const __dirname = import.meta.dirname;

const server = new Comet();

server.setStaticDir(process.env.DIRNAME || __dirname + "/public");

//* MIDDLEWARE
//prettier-ignore
const printHi = (_req: http.IncomingMessage, _res: http.ServerResponse, next: Function)=>{
	console.log('Say  Hi middleware')
	next()
}
//prettier-ignore
const auth = (req: http.IncomingMessage, res: http.ServerResponse, next: Function)=>{
	// const token = (req.headers.authorization as string).split(' ')[1]
	// if(token === '12345'){
	// next()	
	// } else{
	// 	res.statusCode = 401
	// 	res.end('Authorization failed!')
	// }
	const cookie = req.headers.cookie?.split('=')[1].toString()
	const verification = server.SESSIONS.find((storedCookie)=>{return storedCookie === cookie})
	// console.log(cookie)
	if (verification){
		next()
	} else{
		res.statusCode = 401
		res.end('cookie verification failed!')

	}
}

//* ROUTE HANDLERS
//prettier-ignore
server.get('/getpath', printHi, async (req: http.IncomingMessage, res: http.ServerResponse)=>{
	const body = await (req as any).body()
	console.log('reqbody:', body) 
	res.setHeader('lol', 'lol')
	res.statusCode = 200 // Default
	res.end('Hello from getpath')
})
//prettier-ignore

server.get('/login', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	const cookie = Math.floor(Math.random()*100000000000).toString()
	server.SESSIONS.push(cookie) 
	res.setHeader("Set-Cookie" , [`cookie1=${cookie}; Path=/; HttpOnly`])
	res.end(`cookie sent: (${cookie})`)

})
server.get('/checkcookie', (req: http.IncomingMessage, res: http.ServerResponse)=>{
	console.log(req.headers.cookie)
	const cookie = req.headers.cookie?.split('=')[1].toString()
	const verification = server.SESSIONS.find((storedCookie)=>{return storedCookie === cookie})
	// console.log(cookie)
	if (verification){
		res.end('cookie verification succesful!')

	} else{
		res.statusCode = 401
		res.end('cookie verification failed!')

	}

})

server.get('/authcookie', auth, (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	res.end('Completed cookie authorization successfully!')
})

//! temp:
//prettier-ignore
server.post('/testparsebody', async(req: http.IncomingMessage, res: http.ServerResponse)=>{
		const body = await (req as any).body()
		if(!body){
			res.statusCode = 400
			res.end('Body is too large!')
			req.destroy()
		}else{
			res.end(JSON.stringify(body))
		}
		

})

//prettier-ignore
server.get('/', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	(res as any).sendFile('index.html')
})
//prettier-ignore
server.get('/requestnameimage', (req: http.IncomingMessage, res: http.ServerResponse)=>{
	
	let message: any
	req.on('data', (data)=>{
		message = JSON.parse(data.toString())
	})
	req.on('end', ()=>{
		(res as any).sendFile(message.fileName)
		//$ For some reason that I don't know (and I should know lol) if I do ".end()" it doesn't work.
		// res.end()
	})
})
//prettier-ignore
server.post('/postpath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	res.end('Hello from postpath!')
})
//prettier-ignore
server.post('/upload', (req: http.IncomingMessage, res: http.ServerResponse)=>{
	//! I need to implement url parameters here.
	const writable = fs.createWriteStream(__dirname + '/public/' + req.headers['file-name'])
	// req.pipe(writable)
	req.on('data', (chunk)=>{
		writable.write(chunk)
	})
	req.on('end', ()=>{
		res.end('Recibì tu archivo, colega!')
	})
})

//prettier-ignore
server.post("/upload2", async (req: http.IncomingMessage, res: http.ServerResponse) => {
		const fileName = req.headers['file-name']
		console.log("File name: ", fileName);
		const result = await (req as any).saveToFile(fileName, 1e6);
		if (!result) {
			res.statusCode = 400;
			res.end("Unable to upload your file, maybe it is too big?");
			req.destroy();
		} else {
			res.end("Successfully uploaded your file");
		}
	}
);

//prettier-ignore
server.get('/styles.css', (_req: http.IncomingMessage, res: http.ServerResponse)=>{ 
	// res.statusCode = 200;
	(res as any).sendFile('styles.css')
})
//prettier-ignore
server.get('/index.js', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	
	(res as any).sendFile('index.js')
})
//prettier-ignore
server.delete('/deletepath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	res.end('Hello from deletepath!')
})
//prettier-ignore
server.patch('/patchpath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
	res.end('Hello from patchpath!')
})

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
