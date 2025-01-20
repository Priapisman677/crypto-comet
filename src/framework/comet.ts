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
	staticDir: string = "./public";
	SESSIONS: string[] = [];
	symetricKey: Buffer = crypto.randomBytes(32);
	willEncrypt: boolean = false;
	constructor() {
		//$ USING C L O U S U R E FUNCTIONS
		this.server = createServer(async (req, res) => {
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
				//$ CLOSURE
				//prettier-ignore
				res.sendFile = (fileName: string) => {
                    sendFileFunction(res, this.staticDir, fileName );
                };

				//prettier-ignore
				//$ CLOSURE
				req.saveToFile = async (fileName: string, maxSize: number = 1e8)=>{
					return await saveToFileFunction(this.staticDir, req, fileName, maxSize);
				}
				//prettier-ignore
				//$ CLOSURE
				req.body = async ()=>{ return await parseBody(req); }
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
		this.routes.GET[path] = {middlewares, handler}
	}

	//prettier-ignore
	post(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
		if (!this.routes.POST) this.routes.POST = {}
		const handler = middlewaresAndHandler.pop() as RouteHandler
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.POST[path] = {middlewares, handler}
	}

	//prettier-ignore
	delete(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]) {
		if (!this.routes.DELETE) this.routes.DELETE = {};
		const handler = middlewaresAndHandler.pop() as RouteHandler;
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.DELETE[path] = { middlewares, handler };
	}
	//prettier-ignore
	put(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
		if(!this.routes.PUT) this.routes.PUT = {}
		const handler = middlewaresAndHandler.pop()  as RouteHandler;
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.PUT[path] = { middlewares, handler}
	}
	//prettier-ignore
	patch(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
		if(!this.routes.PATCH) this.routes.PATCH = {}
		const handler = middlewaresAndHandler.pop()  as RouteHandler;
		const middlewares = middlewaresAndHandler as Middleware[];
		this.routes.PATCH[path] = { middlewares, handler}
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
			for (const path in paths){
				if (method === "GET") {
					this.get(path, ...paths[path]);
				}
				if(method === 'POST'){
					this.post(path, ...paths[path])
				}
				if(method === 'DELETE'){
					this.delete(path, ...paths[path])
				}
				if(method === 'PUT'){
					this.put(path, ...paths[path])
				}
				if(method === 'PATCH'){
					this.patch(path, ...paths[path])
				}
			}
				
		}
	}

	setStaticDir(dirPath: string) {
		this.staticDir = dirPath + "/";
	}

	setSymerticKey(data: string | Buffer, encoding?: string) {
		if (!encoding) {
			this.symetricKey = data as Buffer;
		}
		if (encoding === "hex") {
			this.symetricKey = Buffer.from(data as string, "hex");
		}
		if (encoding === "utf") {
			this.symetricKey = Buffer.from(data as string, "utf-8"); //! If this is very useless
		}
	}

	private encrypt(data: string, res: ServerResponse) {
		const iv = crypto.randomBytes(16);
		const cipher = crypto.createCipheriv(
			"aes-256-cbc",
			this.symetricKey,
			iv
		);
		const encrypted =
			cipher.update(data, "utf-8", "hex") + cipher.final("hex");
		const message = `${encrypted}:${iv.toString("hex")}`;
		res.end(message);
	}

	listen(PORT: number, cb: Function) {
		this.server.listen(PORT, () => {
			cb();
		});
	}
}

export default Comet;
