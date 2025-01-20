//!  This could be a private function in my class for production
//!  This could be a private function in my class for production
import http from "node:http";

const parseBody = (req: http.IncomingMessage) => {
	// console.log(req.headers)
	return new Promise((resolve, _reject) => {
		const chunks: Buffer[] = [];

		let totalSize = 0;
		const maxSize = 1e4; // 10 KB (10_000 bytes)
		req.on("data", (chunk) => {
			totalSize += chunk.length;
			if (totalSize > maxSize) {
				resolve(null);
			} else {
				chunks.push(chunk);
			}
		});
		req.on("end", () => {
			const body = Buffer.concat(chunks).toString();
			try {
				resolve(JSON.parse(body));
			} catch {
				resolve(body);
			}
		});
	});
};

//* Helper function to format bytes into a human-readable format
const formatBytes = (bytes: number, decimals = 2): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
formatBytes;

export default parseBody;
