import { Router } from "../framework/comet.js";
import http from "node:http";
import fs from 'node:fs'
import auth from "./middleware/auth.js";
const router = new Router();

export const sessions: string[] = []


export const printHi = (_req: http.IncomingMessage, _res: http.ServerResponse, next: Function)=>{
    console.log('Say hi middleware')
    next()
}



//prettier-ignore
router.get('/', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.sendFile('index.html')
})
//prettier-ignore

router.get('/getpath', printHi, async (req: http.IncomingMessage, res: http.ServerResponse)=>{
    const body = await req.body()
    console.log('reqbody:', body) 
    res.setHeader('lol', 'lol')
    res.statusCode = 200;
    res.send('Hello from getpath')
})

//prettier-ignore
router.get('/testencrypt', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.encrypt().send('Hello')
})

//prettier-ignore
router.get('/loginmock', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    const cookie = Math.floor(Math.random()*100000000000).toString()
    sessions.push(cookie) 
    res.setHeader('Set-cookie' ,[`cookie1=${cookie}; HttpOnly; Path=/;`]);
    res.status(200).send(`cookie sent: (${cookie})`)
})
//prettier-ignore
router.get('/checkcookie', (req: http.IncomingMessage, res: http.ServerResponse)=>{
    console.log(req.headers.cookie)
    const cookie = req.headers.cookie?.split('=')[1].toString()
    const verification = sessions.find((storedCookie)=>{return storedCookie === cookie})
    // console.log(cookie)
    if (verification){
        res.send('cookie verification succesful!')

    } else{
        res.statusCode = 401;
        res.send('cookie verification failed!')

    }

})
//prettier-ignore
router.get('/authcookie', auth, (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.send('Completed cookie authorization successfully!')
})

//prettier-ignore
router.post('/testparsebody', async(req: http.IncomingMessage, res: http.ServerResponse)=>{
        const body = await req.body()
        if(!body){
            res.statusCode = 400;
            res.send('Body is too large!')
            req.destroy()
        }else{
            res.send(JSON.stringify(body))
        }
})

//prettier-ignore
router.get('/requestnameimage', (req: http.IncomingMessage, res: http.ServerResponse)=>{
    
    let message: any
    req.on('data', (data)=>{
        message = JSON.parse(data.toString())
    })
    req.on('end', ()=>{
        res.sendFile(message.fileName)
        //$ For some reason that I don't know (and I should know lol) if I d(o " as any).send()" it doesn't work.
        // res.send()
    })
})

//prettier-ignore
router.post('/uploadnoname', (req: http.IncomingMessage, res: http.ServerResponse)=>{
    //! I need to implement url parameters here.
    const writable = fs.createWriteStream(__dirname + '/public/' + req.headers['file-name'])
    // req.pipe(writable)
    req.on('data', (chunk)=>{
        writable.write(chunk)
    })
    req.on('end', ()=>{
        res.send('Recibì tu archivo, colega!')
    })
})

//prettier-ignore
router.post("/uploadwithname", async (req: http.IncomingMessage, res: http.ServerResponse) => {
    debugger
        const fileName = req.headers['file-name']
        if(!fileName || typeof fileName !== 'string'){
            res.statusCode = 400;
            res.send("No file name provided or invalid format");
            req.destroy();
            return
        }
        console.log("File name: ", fileName);
        const result = await req.saveToFile(fileName, 1e6);
        if (!result) {
            res.statusCode = 400;
            res.send("Unable to upload your file, maybe it is too big?");
            req.destroy();
        } else {
            res.send("Successfully uploaded your file");
        }
    }
);

//prettier-ignore
router.get('/styles.css', (_req: http.IncomingMessage, res: http.ServerResponse)=>{ 
    // res.statusCode = 200;
    res.sendFile('styles.css')
})

//prettier-ignore
router.get('/index.js', (_req: http.IncomingMessage, res: http.ServerResponse)=>{	
    res.sendFile('index.js')
})

//prettier-ignore
router.post('/postpath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.send('Hello from postpath!')
})

//prettier-ignore
router.delete('/deletepath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.send('Hello from deletepath!')
})

//prettier-ignore
router.patch('/patchpath', (_req: http.IncomingMessage, res: http.ServerResponse)=>{
    res.send('Hello from patchpath!')
})


process.stdin.on("data", (data) => {
	const str = data.toString().trim();
	if (str === "RR" || str === "rr") {
		console.log(router.routes);
	}	if (str === "S" || str === "s") {
		console.log(sessions);
	}

});


export default router;
