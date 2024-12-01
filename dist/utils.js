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
exports.random = random;
exports.hashedPassword = hashedPassword;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
function random(lem) {
    let options = "djkfjdkfdhfjdfdjhfsjueyruehurhels435363523";
    let length = options.length;
    let ans = "";
    for (let i = 0; i < lem; i++) {
        ans += options[(Math.floor(Math.random() * length))];
    }
    return ans;
}
function hashedPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10; // Number of hashing rounds
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        return hashedPassword;
    });
}
function verifyPassword(plainPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const isMatch = yield bcrypt_1.default.compare(plainPassword, hashedPassword);
        return isMatch;
    });
}
