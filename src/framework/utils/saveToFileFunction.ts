import http from "node:http";
import fs from "node:fs";

const saveToFileFunction = async (
	dirPath: string,
	req: http.IncomingMessage,
	fileName: string,
	maxSize: number
) => {
	let receivedData = false; //$ The only reason I put this is because sometimes postman fails at sending the an image
	return new Promise((resolve, _reject) => {
		//%By default max size is 100MB
		const writable = fs.createWriteStream(dirPath + fileName);
		let totalSize = 0;
		req.on("data", (chunk) => {
			receivedData = true;
			totalSize += chunk.length;
			if (totalSize > maxSize) {
				console.log("Total size exceeded");
				resolve(null);
				writable.destroy();
				//$ "destroy()" stops further writing but does not delete the existing data.
				//$ But it closes the streamand emits a "'close'" event.
			} else {
				writable.write(chunk);
			}
		});
		req.on("end", () => {
			if (!receivedData) {
				console.log("No data received");
				return resolve(null);
			}
			resolve("success");
		});
		writable.on("close", () => {
			fs.unlink(dirPath + fileName, (err) => {
				if (err) console.log("Error deleting file:", err);
				else {
					console.log("File deleted successfully.");
					resolve(null);
				}
			});
		});
		req.on("error", () => {
			writable.destroy();
			resolve(null);
		});

		writable.on("error", () => {
			resolve(null);
		});
	});
};

export default saveToFileFunction;
