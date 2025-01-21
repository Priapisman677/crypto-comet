//% This might seem a little bit abstract because we are not using something like an extent keyword but it is how it works.
//% It modifies existing types (via augmentation) rather than creating new ones.
//% The absence of extends might make it look like a full re-declaration, but TypeScript merges the changes.

declare module "http" {
    interface ServerResponse {
        status(statusCode: number);
        send(data: string);
        sendFile(fileName: string);
        encrypt()
    }
    interface IncomingMessage {
        saveToFile( fileName: string, maxSize: number)
        body()
        decrypt()
    }


}