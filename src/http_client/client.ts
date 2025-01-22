import http from "node:http";
import crypto from "node:crypto";

const symmetricKey = Buffer.from(
	"e49a5e61a1786622984acd671667c1e8ddcffa4041963df47ef8bc738dfa26a6",
	"hex"
);

let publicKey: string

//* SENDERS:------------------------------------------------------------------
const testencrypt = () => {
	//*  In this function we just sent an empty request and receive an encrypted message
	const options = {
		hostname: "127.0.0.1",
		port: 4000,
		path: "/testencrypt",
		method: "get",
	};

	const request = http.request(options, (res) => {
		res.on("data", (chunk) => {
			console.log(decrypt(chunk));
		});
		res.on("end", () => {});
	});

	request.end();
};

const testdecrypt = () => {
	//* In this function we send an encrypted message.
	const options = {
		hostname: "127.0.0.1",
		port: 4000,
		path: "/testdecrypt",
		method: "post",
	};

	const request = http.request(options, (res) => {
		res.on("data", (chunk) => {
			console.log(chunk.toString());
		});
		res.on("end", () => {
			console.log("done");
		});
	});
	const message = encrypt("Hi there!");
	request.end(message);
};

const getpublicKey = () => {
	//* Here NOT ONLY we received the public key from the server but also we send the encrypted symmetric key.
	const options = {
		hostname: "127.0.0.1",
		port: 4000,
		path: "/getpublicKey",
		method: "get",
	};

	const request = http.request(options, (res) => {
		res.on("data", (chunk) => {
			publicKey = chunk.toString()
			
		});
		res.on("end", () => {
			console.log("Received public key");
			sendsymmetrickey()
		});
	});
	request.end();
};

const sendsymmetrickey = () => {
	const encryptedSymmetricKey = crypto.publicEncrypt(publicKey, symmetricKey) 
	//* This function shall only be called inside of the getpublicKey function
	const options = {
		hostname: "127.0.0.1",
		port: 4000,
		path: "/sendsymmetrickey",
		method: "post",
	};

	const request = http.request(options, (res) => {
		res.on("data", (chunk) => {
			console.log(chunk.toString())
		});
		res.on("end", () => {
		});
	});
	request.end(encryptedSymmetricKey.toString('hex'));
};






//* UTILS:------------------------------------------------------------------

const encrypt = (data: string) => {
	const iv = crypto.randomBytes(16);
	//prettier-ignore
	const cipher = crypto.createCipheriv("aes-256-cbc", symmetricKey, iv);
	//prettier-ignore
	const encrypted = cipher.update(data, "utf-8", "hex") + cipher.final("hex");
	return `${encrypted}:${iv.toString("hex")}`;
};

const decrypt = (chunk: Buffer) => {
	const data = chunk.toString();
	const [encrypted, iv] = data.split(":");
	//prettier-ignore
	const testDecipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.from(iv, 'hex'))
	//prettier-ignore
	return testDecipher.update(encrypted, 'hex', 'utf-8') + testDecipher.final('utf-8')
};

process.stdin.on("data", (chunk) => {
	const input = chunk.toString().trim();
	if (input === "1") {
		testencrypt();
	}
	if (input === "2") {
		testdecrypt();
	}
	if (input === "3") {
		getpublicKey();
	}
});
