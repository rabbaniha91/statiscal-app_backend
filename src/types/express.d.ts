import { User, UserDocument } from ".";
import * as express from express;


declare global{
    namespace Express {
        interface Request {
            user: UserDocument;
            processedData?: any;
        }
    }
}