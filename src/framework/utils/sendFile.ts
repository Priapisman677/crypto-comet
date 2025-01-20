//!  This could be a private function in my class for production
//!  This could be a private function in my class for production
import mime from "mime";
import fs from "node:fs";
import http from "node:http";

//prettier-ignore
const sendFileFunction = (res: http.ServerResponse, dirPath: string, fileName: string)=>{
    const filePath = dirPath + fileName;
    fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (err)=>{
        if(err){
            res.statusCode = 404
            return res.end(`File "${fileName}" not found or not readable.`);
        }
        
        const readable = fs.createReadStream(filePath)

        res.setHeader('Content-Type', (mime as any).getType(filePath))
        
        readable.pipe(res)
    } )
}

export default sendFileFunction;
