import {Router, Request, Response} from "express";
import {ResponseCode} from "../../shared/types/response-code";
import {ApiResponse} from "../../shared/types/api-response";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    console.log("Received request");
    res.status(200).json(new ApiResponse(ResponseCode.Success, "Yes"));
});

export default router;
