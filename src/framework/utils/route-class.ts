import {IncomingMessage, ServerResponse} from "node:http";

type Middleware = (req: IncomingMessage, res: ServerResponse, next: Function) => void;
//prettier-ignore
type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;
interface routes {
	[method: string]: {
		[path: string]: (Middleware | RouteHandler) []
	};
}

class Router {
    routes: routes = {

    }
    constructor(){

    }
    //prettier-ignore

    get(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
        if(!this.routes.GET) this.routes.GET = {}
        this.routes.GET[path] = middlewaresAndHandler
    }
    //prettier-ignore
     post(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
        if(!this.routes.POST) this.routes.POST = {}
        this.routes.POST[path] = middlewaresAndHandler
    }
    //prettier-ignore
    delete(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
        if(!this.routes.DELETE) this.routes.DELETE = {}
        this.routes.DELETE[path] = middlewaresAndHandler
    }
    patch(path: string, ...middlewaresAndHandler: (Middleware | RouteHandler)[]){
        if(!this.routes.PATCH) this.routes.PATCH = {}
        this.routes.PATCH[path] = middlewaresAndHandler
    }
    //prettier-ignore

}


export default Router