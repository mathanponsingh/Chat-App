import jwt from 'jsonwebtoken'
export const generatetoken = (userId)=>{
    return jwt.sign({userId}, process.env.JWT_SECRET);
}