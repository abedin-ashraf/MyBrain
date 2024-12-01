import bcrypt from 'bcrypt';

export function random(lem: number) {
    let options = "djkfjdkfdhfjdfdjhfsjueyruehurhels435363523";
    let length = options.length;
    let ans = "";
    for (let i = 0; i < lem; i++) {
        ans += options[(Math.floor(Math.random() * length))]
    }

    return ans;

}

export async function hashedPassword(password: string) {
    const saltRounds = 10; // Number of hashing rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}