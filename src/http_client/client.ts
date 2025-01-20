import http from "node:http";
import crypto from 'node:crypto'
const options = {
    hostname: "127.0.0.1",
	port: 4000,
	path: "/testencrypt",
	method: "get",
}

const symetricKey = Buffer.from('e49a5e61a1786622984acd671667c1e8ddcffa4041963df47ef8bc738dfa26a6', 'hex')


const request = http.request(options, (res)=>{
    res.on('data', (chunk)=>{
        const data = chunk.toString()
        const [encrypted, iv] = data.split(':')
        const testDecipher = crypto.createDecipheriv('aes-256-cbc', symetricKey, Buffer.from(iv, 'hex'))
        const testmsg = testDecipher.update(encrypted, 'hex', 'utf-8') + testDecipher.final('utf-8')
        console.log("🚀 ~ res.on ~ testmsg:", testmsg)
    })
    res.on('end', ()=>{

    })
})

request.end()