import request from "supertest";
import fs from "node:fs";
import crypto from 'node:crypto'
import server from "../src/user/server-setup.js";
import { sessions } from "../src/user/routes.js";
import { describe, test, expect, beforeAll } from "vitest";

describe("Routes", () => {
	let cookie;
	const constantKey = server.symmetricKey
	// Buffer.from('e49a5e61a1786622984acd671667c1e8ddcffa4041963df47ef8bc738dfa26a6', 'hex')
	beforeAll(() => {
		cookie = Math.floor(Math.random() * 100000000000).toString();

		sessions.push(cookie);
		
	});
	test("/getpath should work", async () => {
		const response = await request(server.server)
			.get("/getpath")
			.expect(200);
	});
	test("/post path should work", async () => {
		const response = await request(server.server)
			.post("/postpath")
			.expect(200);
		expect(response.text).toBe("Hello from postpath!");
	});
	test("/delete path should work", async () => {
		const response = await request(server.server)
			.delete("/deletepath")
			.expect(200);
	});
	test('"sendFile()" should work for index.html', async () => {
		const response = await request(server.server).get("/").expect(200);
	});
	test('"sendFile()" should work for styles.css', async () => {
		const response = await request(server.server)
			.get("/styles.css")
			.expect(200);
	});
	test('"sendFile()" should work for index.js', async () => {
		const response = await request(server.server)
			.get("/index.js")
			.expect(200);
	});
	test('"sendFile()" should NOT work for non-existing path', async () => {
		const response = await request(server.server)
			.get("/haha")
			.expect(404);
	});

	test('"parsebody()" should work for JSON', async () => {
		const response = await request(server.server)
			.post("/testparsebody")
			.send(JSON.stringify({ key1: "value2" }))
			.expect(200);
		expect(response.text).toBe('{"key1":"value2"}');
	});
	test('"parsebody()" should work for small non JSON body', async () => {
		const response = await request(server.server)
			.post("/testparsebody")
			.send("Hello there!")
			.expect(200);
		expect(response.text).toBe('"Hello there!"');
	});
	test('"parsebody()" should work for large (10KB+) body', async () => {
		const buffer = fs.readFileSync("tests/fixtures/superUpload.png");
		const response = await request(server.server)
			.post("/testparsebody")
			.send(buffer)
			.expect(400);
		expect(response.text).toBe("Body is too large!");
	});

	test("Delete path should work", async () => {
		const response = await request(server.server)
			.delete("/deletepath")
			.expect(200);
		expect(response.text).toBe("Hello from deletepath!");
	});

	test("Patch path should work", async () => {
		const response = await request(server.server)
			.patch("/patchpath")
			.expect(200);
		expect(response.text).toBe("Hello from patchpath!");
	});

	test('The "/loginMock"  route should work', async () => {
		// console.log(cookie)
		// console.log(sessions)
		const response = await request(server.server)
			.get("/loginmock")
			.expect(200);
		expect(response.headers["set-cookie"][0]).toBeTruthy();
	});
	test("Cookie authentication middleware should work", async () => {
		const response = await request(server.server)
			.get("/authcookie")
			.set("Cookie", `cookie1=${cookie}`)
			.expect(200);
		expect(response.text).toBe(
			"Completed cookie authorization successfully!"
		);
	});
	test("Cookie authentication middleware should not work for invalid cookie", async () => {
		const response = await request(server.server)
			.get("/authcookie")
			.set("Cookie", `cookie1=${123}`)
			.expect(401);
		expect(response.text).toBe("cookie verification failed!");
	});
	test('Encryption and decreptrion should work', async()=>{
		const response = await request(server.server)
		.get('/testencrypt')
		.expect(200)
		const [encrypted, iv] = response.text.split(':')
		const decipher = crypto.createDecipheriv('aes-256-cbc', constantKey, Buffer.from(iv, 'hex'))
		const message = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
		expect(message).toBe('Hello')
	})
});
