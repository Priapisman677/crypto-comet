import sendFileFunction from "./utils/sendFile.js";
import parseBody from "./utils/parseBody.js";
import saveToFileFunction from "./utils/saveToFileFunction.js";
import Router from "./utils/route-class.js";

export { Router };

import http from "node:http";
import https from "node:https";
import crypto from "node:crypto";

//prettier-ignore
type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void;
//prettier-ignore
type RouteHandler = (req: http.IncomingMessage, res: http.ServerResponse) => void;
interface routes {
	[method: string]: {
		[path: string]: {
			middlewares: Middleware[];
			handler: RouteHandler;
		};
	};
}
interface options {
	key: Buffer;
	cert: Buffer;
}

class Comet {
	server: http.Server;
	routes: routes = {};
	//prettier-ignore
	anyRequest: (req: http.IncomingMessage,res: http.ServerResponse) => void = () => {};
	ipBlacklist: string[] = [];
	private blacklistCallback: RouteHandler | undefined = () => {};
	ipWhitelist: string[] = [];
	private whitelistCallback: RouteHandler | undefined = () => {};
	staticDir: string = "./public";
	private willEncrypt: boolean = false;
	private willDecrypt: boolean = false;
	symmetricKey: Buffer = crypto.randomBytes(32);
	//prettier-ignore

	keyPair: { publicKey: string; privateKey: string } =crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
	constructor(public protocol: string, public options?: options) {
		//prettier-ignore
		const handler = async (req: http.IncomingMessage,res: http.ServerResponse) => {
			res.status = (statusCode: number) => {
				res.statusCode = statusCode;
				return res;
			};

			res.encrypt = () => {
				this.willEncrypt = true;
				return res;
			};

			res.send = (data: string) => {
				if (!this.willEncrypt) {
					res.end(data);
				} else {
					this.willEncrypt = false;
					this.encryptNsend(data, res);
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
					this.willDecrypt = false;
					const encrypted = await parseBody(req);
					if (typeof encrypted === "string") {
						return this.decrypt(encrypted);
					} else {
						return null;
					}
				}
			};
			//prettier-ignore
			req.saveToFile = async (fileName: string, maxSize: number = 1e8)=>{
				return await saveToFileFunction(this.staticDir, req, fileName, maxSize);
			}
			//prettier-ignore
			const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress!

			if (this.ipBlacklist.includes(clientIp)) {
				if(this.blacklistCallback) this.blacklistCallback(req, res);
				
				return;
			}
			//prettier-ignore
			if (this.ipWhitelist.length > 0 && (!this.ipWhitelist.includes(clientIp))  ){
				if(this.whitelistCallback) this.whitelistCallback(req, res);
				return
			}

			this.anyRequest(req, res);
			const method = req.method || "GET";
			const path = req.url || "/";
			//prettier-ignore
			const route = this.routes[method.toUpperCase()]?.[path.toLowerCase()]
			if (route) {
				//prettier-ignore
				this.executeMiddlewares(req, res, route.middlewares, ()=>{route.handler(req, res)})
			} else {
				res.statusCode = 404;
				res.end("Route not found");
			}
		};
		if (this.protocol === "http") {
			this.server = http.createServer(handler);
		} else if (this.protocol === "https") {
			this.server = https.createServer(
				this.options as https.ServerOptions,
				handler
			);
		} else {
			this.server = http.createServer(handler);
		}
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

	//prettier-ignore
	private executeMiddlewares(req: http.IncomingMessage,res: http.ServerResponse,middlewares: Middleware[],
		finalHandler: Function) {
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
			const pathsNfuntcions = Router.routes[method];
			for (const path in pathsNfuntcions) {
				if (method === "GET") {
					this.get(path, ...pathsNfuntcions[path]);
				}
				if (method === "POST") {
					this.post(path, ...pathsNfuntcions[path]);
				}
				if (method === "DELETE") {
					this.delete(path, ...pathsNfuntcions[path]);
				}
				if (method === "PUT") {
					this.put(path, ...pathsNfuntcions[path]);
				}
				if (method === "PATCH") {
					this.patch(path, ...pathsNfuntcions[path]);
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
			this.symmetricKey = Buffer.from(data as string, "utf-8"); //! I think this is very useless
		}
	}

	setIpBlacklist(list: string[], callback?: RouteHandler | undefined) {
		this.blacklistCallback = callback;
		list.forEach((address) => {
			this.ipBlacklist.push(`::ffff:${address}`, `${address}`);
		});
	}
	setIpWhitelist(list: string[], callback?: RouteHandler | undefined) {
		this.whitelistCallback = callback;
		list.forEach((address) => {
			this.ipWhitelist.push(`::ffff:${address}`, `${address}`);
		});
	}

	setAnyRequest(
		func: (req: http.IncomingMessage, res: http.ServerResponse) => void
	) {
		this.anyRequest = func;
	}

	private encryptNsend(data: string, res: http.ServerResponse) {
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
		const decipher = crypto.createDecipheriv(
			"aes-256-cbc",
			this.symmetricKey,
			Buffer.from(iv, "hex")
		);
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
