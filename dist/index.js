"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
const zod_1 = __importDefault(require("zod"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const userSchema = zod_1.default.object({
    username: zod_1.default.string().email({
        message: "username should be email"
    }),
    password: zod_1.default.string()
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: Zod validation
    let validateData;
    try {
        validateData = userSchema.parse(req.body);
    }
    catch (e) {
        res.json({
            message: e
        });
        return;
    }
    const username = validateData.username;
    const password = validateData.password;
    //TODO: hash the password
    const hashedPass = yield (0, utils_1.hashedPassword)(password);
    try {
        yield db_1.UserModel.create({
            username: username,
            password: hashedPass
        });
        res.json({
            message: "User signed up"
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists"
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: Zod validation
    let validateData;
    try {
        validateData = userSchema.parse(req.body);
    }
    catch (e) {
        res.json({
            message: e
        });
        return;
    }
    const username = validateData.username;
    const password = validateData.password;
    const existingUser = yield db_1.UserModel.findOne({
        username
    });
    if (existingUser) {
        const correctPass = yield (0, utils_1.verifyPassword)(password, existingUser.password || "");
        if (!correctPass) {
            res.status(411).json({
                message: "Wrong Password"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: existingUser._id
        }, config_1.JWT_PASSWORD);
        res.json({
            token
        });
    }
    else {
        res.status(403).json({
            message: "Incorrect username and password"
        });
    }
}));
app.post("/api/v1/content", middleware_1.userMiddleWare, (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    db_1.ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
    res.json({
        message: "Content added"
    });
});
app.get("/api/v1/content", middleware_1.userMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    });
}));
app.delete("/api/v1/content", middleware_1.userMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield db_1.ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    });
    res.json({
        message: "Deleted"
    });
}));
app.post("/api/v1/content", middleware_1.userMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const type = req.body.type;
    yield db_1.ContentModel.create({
        link,
        type,
        title: req.body.title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
}));
app.post("/api/v1/mybrain/share", middleware_1.userMiddleWare, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                link: existingLink.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash // full url
        });
        res.json({
            link: hash
        });
    }
    else {
        yield db_1.LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            message: "Removed link"
        });
    }
}));
app.get("/api/v1/mybrain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.LinkModel.findOne({
        hash
    });
    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        });
        return;
    }
    //userId
    const content = yield db_1.ContentModel.find({
        userId: link.userId
    });
    const user = yield db_1.UserModel.findOne({
        userId: link.userId
    });
    res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content: content
    });
}));
app.listen(3000);
