import express from "express";
import jwt from 'jsonwebtoken';
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleWare } from "./middleware";
import { random, hashedPassword, verifyPassword } from "./utils";
import zod from "zod";


const app = express();
app.use(express.json());

// Creating userSchema for zod validation
const userSchema = zod.object({
    username: zod.string().email({
        message: "username should be email"
    }),
    password: zod.string()
})


app.post("/api/v1/signup", async (req, res) => {

    //TODO: Zod validation
    let validateData
    try {
        validateData = userSchema.parse(req.body);
    } catch (e) {
        res.json({
            message: e
        })
        return;
    }
    const username = validateData.username;
    const password = validateData.password;

    //TODO: hash the password
    const hashedPass = await hashedPassword(password);


    try {
        await UserModel.create({
            username: username,
            password: hashedPass
        })

        res.json({
            message: "User signed up"
        })
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists"
        })
    }

})
app.post("/api/v1/signin", async (req, res) => {

    //TODO: Zod validation
    let validateData
    try {
        validateData = userSchema.parse(req.body);
    } catch (e) {
        res.json({
            message: e
        })
        return;
    }
    const username = validateData.username;
    const password = validateData.password;

    const existingUser = await UserModel.findOne({
        username
    })
    if (existingUser) {
        const correctPass = await verifyPassword(password, existingUser.password || "");
        if (!correctPass) {
            res.status(411).json({
                message: "Wrong Password"
            })
            return;
        }
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD);
        res.json({
            token
        })
    }
    else {
        res.status(403).json({
            message: "Incorrect username and password"
        })
    }

})
app.post("/api/v1/content", userMiddleWare, (req, res) => {
    const link = req.body.link;
    const type = req.body.type;

    ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })
    res.json({
        message: "Content added"
    })
})
app.get("/api/v1/content", userMiddleWare, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username")

    res.json({
        content
    })

})
app.delete("/api/v1/content", userMiddleWare, async (req, res) => {
    const contentId = req.body.contentId;
    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    })
    res.json({
        message: "Deleted"
    })
})
app.post("/api/v1/content", userMiddleWare, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        title: req.body.title,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })
})
app.post("/api/v1/mybrain/share", userMiddleWare, async (req, res) => {
    const share = req.body.share;
    if (share) {
        const existingLink = await LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        })
        if (existingLink) {
            res.json({
                link: existingLink.hash
            })
            return;
        }
        const hash = random(10);
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: hash // full url
        })
        res.json({
            link: hash
        })
    } else {
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
        res.json({
            message: "Removed link"
        })
    }


})
app.get("/api/v1/mybrain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
        hash
    });

    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return;
    }

    //userId
    const content = await ContentModel.find({
        userId: link.userId
    })
    const user = await UserModel.findOne({
        userId: link.userId
    })

    res.json({
        username: user?.username,
        content: content
    })
})


app.listen(3000);