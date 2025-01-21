import sendFileFunction from "./utils/sendFile.js";
import parseBody from "./utils/parseBody.js";
import saveToFileFunction from "./utils/saveToFileFunction.js";

import Router from "./utils/route-class.js";

export { Router };

//*I'll be using named imports for practice:
//prettier-ignore
import {IncomingMessage, ServerResponse, createServer, Server} from "node:http";
import crypto from "node:crypto";

//prettier-ignore
type Middleware = (req: IncomingMessage, res: ServerResponse, next: Function) => void;
//prettier-ignore
type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;
interface routes {
	[method: string]: {
		[path: string]: {
			middlewares: Middleware[];
			handler: RouteHandler;
		};
	};
}

class Comet {
	server: Server;
	routes: routes = {};
	ipBlackList: string[] = []
	ipWhiteList: string[] = []
	staticDir: string = "./public";
	willEncrypt: boolean = false;
	willDecrypt: boolean = false;
	symmetricKey: Buffer = crypto.randomBytes(32);
	keyPair: any = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: { type: "spki", format: "pem" },
		privateKeyEncoding: { type: "pkcs8", format: "pem" },
	});
	constructor() {
		this.server = createServer(async (req, res) => {
			if (this.ipBlackList.includes(req.socket.remoteAddress!)){
				res.end('denied')
				res.destroy()
				req.destroy()
			}
			if (this.ipWhiteList.length > 0 && !this.ipWhiteList.includes(req.socket.remoteAddress!)){
				res.end('denied')
				res.destroy()
				req.destroy()
			}
			// console.log(req.url, req.method)
			const method = req.method || "GET";
			const path = req.url || "/";
			//prettier-ignore
			const route = this.routes[method.toUpperCase()]?.[path.toLowerCase()]
			if (route) {
				(res as any).status = (statusCode: number) => {
					debugger;
					res.statusCode = statusCode;
					return res;
				};

				res.encrypt = () => {
					this.willEncrypt = true;
					return res;
				};

				res.send = (data: string) => {
					if (this.willEncrypt) {
						this.encrypt(data, res);
						this.willEncrypt = false;
					} else {
						res.end(data);
					}
				};

				//prettier-ignore
				res.sendFile = (fileName: string) => {
                    sendFileFunction(res, this.staticDir, fileName );
                };

				req.decrypt = () => {
					this.willDecrypt = true;
					return req;
				};

				req.body = async () => {
					if (!this.willDecrypt) {
						return await parseBody(req);
					} else {
						this.willDecrypt = false
						const encrypted = await parseBody(req);
						if (typeof encrypted === "string") {
							return this.decrypt(encrypted);
						}else{
							return null
						}
					}
				};
				//prettier-ignore
				req.saveToFile = async (fileName: string, maxSize: number = 1e8)=>{
					return await saveToFileFunction(this.staticDir, req, fileName, maxSize);
				}

				//prettier-ignore
				this.executeMiddlewares(req, res, route.middlewares, ()=>{route.handler(req, res)})
			} else {
				res.statusCode = 404;
				res.end("Route not found");
			}
		});
	}

	//prettier-ignore
	//$  The three dots mean that the next arguments will be collected into an array.
	get(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]) {
		if(!this.routes.GET) this.routes.GET = {}
		const handler = middlewaresAndHandler.pop()	as RouteHandler
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.GET[path.toLowerCase()] = {middlewares, handler}
	}

	//prettier-ignore
	post(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
		if (!this.routes.POST) this.routes.POST = {}
		const handler = middlewaresAndHandler.pop() as RouteHandler
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.POST[path.toLowerCase()] = {middlewares, handler}
	}

	//prettier-ignore
	delete(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]) {
		if (!this.routes.DELETE) this.routes.DELETE = {};
		const handler = middlewaresAndHandler.pop() as RouteHandler;
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.DELETE[path.toLowerCase()] = { middlewares, handler };
	}
	//prettier-ignore
	put(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
		if(!this.routes.PUT) this.routes.PUT = {}
		const handler = middlewaresAndHandler.pop()  as RouteHandler;
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.PUT[path.toLowerCase()] = { middlewares, handler}
	}
	//prettier-ignore
	patch(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
		if(!this.routes.PATCH) this.routes.PATCH = {}
		const handler = middlewaresAndHandler.pop()  as RouteHandler;
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.PATCH[path.toLowerCase()] = { middlewares, handler}
	}

	private executeMiddlewares(
		req: IncomingMessage,
		res: ServerResponse,
		middlewares: Middleware[],
		finalHandler: Function
	) {
		//prettier-ignore
		const execute = (index: number)=>{
			if(index < middlewares.length){
				middlewares[index](req, res, ()=>{execute(index+1)})
			} else{
				finalHandler()
			}
		}
		execute(0);
	}

	useRouter(Router: Router) {
		for (const method in Router.routes) {
			const paths = Router.routes[method];
			for (const path in paths) {
				if (method === "GET") {
					this.get(path, ...paths[path]);
				}
				if (method === "POST") {
					this.post(path, ...paths[path]);
				}
				if (method === "DELETE") {
					this.delete(path, ...paths[path]);
				}
				if (method === "PUT") {
					this.put(path, ...paths[path]);
				}
				if (method === "PATCH") {
					this.patch(path, ...paths[path]);
				}
			}
		}
	}

	setStaticDir(dirPath: string) {
		this.staticDir = dirPath + "/";
	}

	setSymerticKey(data: string | Buffer, encoding?: string) {
		if (!encoding) {
			this.symmetricKey = data as Buffer;
		}
		if (encoding === "hex") {
			this.symmetricKey = Buffer.from(data as string, "hex");
		}
		if (encoding === "utf") {
			this.symmetricKey = Buffer.from(data as string, "utf-8"); //! If this is very useless
		}
	}
	
	setIpBlacklist(...list: string[]){
		list.forEach((address)=>{
			this.ipBlackList.push(`::ffff:${address}`)
		})
		this.ipBlackList
	}
	setIpWhitelist(...list: string[]){
		list.forEach((address)=>{
			this.ipWhiteList.push(`::ffff:${address}`)
		})
		this.ipWhiteList
	}

	private encrypt(data: string, res: ServerResponse) {
		const iv = crypto.randomBytes(16);
		//prettier-ignore
		const cipher = crypto.createCipheriv("aes-256-cbc",this.symmetricKey,iv);
		//prettier-ignore
		const encrypted = cipher.update(data, "utf-8", "hex") + cipher.final("hex");
		const message = `${encrypted}:${iv.toString("hex")}`;
		res.end(message);
	}
	private decrypt(encryptedMsg: string) {
		const [encrypted, iv] = encryptedMsg.split(":");
		const decipher = crypto.createDecipheriv("aes-256-cbc", this.symmetricKey, Buffer.from(iv, 'hex'));
		return (
			decipher.update(encrypted, "hex", "utf-8") +
			decipher.final("utf-8")
		);
	}

	listen(PORT: number, cb: Function) {
		this.server.listen(PORT, () => {
			cb();
		});
	}
}

export default Comet;
