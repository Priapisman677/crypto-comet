import http from "node:http";

const server = http.createServer((req, res)=>{
    //! I still have not added an algorithm to choose the server that it needs to go to because I have not really implemented multiple servers but I understand it is fairly easy.
    console.log(req.method, req.url)
    const options = {
		hostname: "localhost",
		port: 4000,
		path: req.url,
		method: req.method,
		headers: req.headers,
	};
    const request = http.request(options, (response)=> {
        res.writeHead(response.statusCode || 500, response.headers)
        response.pipe(res)
    })
    req.pipe(request)
})

server.listen(3000, ()=>{
    console.log('Server is up on', server.address())
})