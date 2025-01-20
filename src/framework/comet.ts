import sendFileFunction from "./utils/sendFile.js";
import parseBody from "./utils/parseBody.js";
import saveToFileFunction from "./utils/saveToFileFunction.js";
//*I'll be using named imports for practice:
//prettier-ignore
import {IncomingMessage, ServerResponse, createServer, Server} from "node:http";

//prettier-ignore
type Middleware = (req: IncomingMessage, res: ServerResponse, next: Function) => void;
//prettier-ignore
type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;

class Comet {
	server: Server;
	routes: {
		[method: string]: {
			[path: string]: {
				middlewares: Middleware[];
				handler: RouteHandler;
			};
		};
	} = {};
	staticDir: string = "./public";
	SESSIONS: string[] = []

	constructor() {
		//$ USING C L O U S U R E FUNCTIONS
		this.server = createServer(async (req, res) => {
			// console.log(req.url, req.method)
			const method = req.method || "GET";
			const path = req.url || "/";
			//prettier-ignore
			const route = this.routes[method.toUpperCase()]?.[path.toLowerCase()]
			if (route) {
				//prettier-ignore
				//$ CLOSURE
				(res as any).sendFile = (fileName: string) => {
                    sendFileFunction(res, this.staticDir, fileName );
                };
				//prettier-ignore
				//$ CLOSURE
				(req as any).saveToFile = async (fileName: string, maxSize: number = 1e8)=>{
					return await saveToFileFunction(this.staticDir, req, fileName, maxSize);
				}
				//prettier-ignore
				//$ CLOSURE
				(req as any).body = async ()=>{ return await parseBody(req); }
				//prettier-ignore
				this.executeMiddlewares(req, res, route.middlewares, ()=>{route.handler(req, res)})
			} else {
				res.statusCode = 404;
				res.end("Route not found");
			}
		});
	}
	//*Legacy:
	// get(path: string, cb: Function) {
	// 	if (!this.routes.GET) this.routes.GET = {};
	// 	this.routes.GET[path] = cb;
	// }
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

	setStaticDir(dirPath: string) {
		this.staticDir = dirPath + "/";
	}
	listen(PORT: number, cb: Function) {
		this.server.listen(PORT, () => {
			cb();
		});
	}
}

export default Comet;
