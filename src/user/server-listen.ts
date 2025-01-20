import server from "./server-setup.js";


server.listen(4000, () => {
	console.log("server is up on.......", server.server.address());
});
