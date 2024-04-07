"use server";
import {z} from "zod";
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "../lib/constants";
import db from "../lib/db";
import bcrypt from "bcrypt"
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const checkUsername=(username:string)=> !username.includes("potato");

const checkPasswords=({password, confirm_password}:{password:string,confirm_password:string})=> password===confirm_password

const checkUniqueUsername=async (username:string)=>{
    const user = await db.user.findUnique({
        where:{
            username,
        },
        select:{
            id:true,
        },
    });
    return !Boolean(user)
}

const checkUniqueEmail=async (email:string)=>{
    const user=await db.user.findUnique({
        where:{
            email
        },
        select:{
            id:true
        }
    });
    return !Boolean(user)
}

const formSchema=z.object({
    username:z.string({
        invalid_type_error:"Username nust be a string!",
        required_error:"Where is my username???",
    }).toLowerCase().trim().refine(checkUsername,"No potatoes allowed!").refine(checkUniqueUsername,"이 사용자명은 이미 사용중입니다."),
    email:z.string().email().toLowerCase().refine(checkUniqueEmail,"이미 등록된 이메일입니다."),
    password:z.string().min(PASSWORD_MIN_LENGTH).regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password:z.string().min(PASSWORD_MIN_LENGTH),
}).refine(checkPasswords,{message: "두 비번이 같아야합니다",
path:["confirm_password"]})

export async function createAccount(prevState:any, formData:FormData) {
    const data={
    username:formData.get("username"),
    email:formData.get("email"),
    password:formData.get("password"),
    confirm_password:formData.get("confirm_password"),
    };
    const result = await formSchema.spa(data);
    if(!result.success){
        return result.error.flatten();
    }else {
        const hashedPassword=await bcrypt.hash(result.data.password,12)
        const user=await db.user.create({
            data:{
                username:result.data.username,
                email:result.data.email,
                password:hashedPassword
            },
            select:{
                id:true
            }
        })
        
        const cookie =await getIronSession(cookies(),{
            cookieName:"delicious-karrot",
            password: process.env.COOKIE_PASSWORD!
        });
        //@ts-ignore
        cookie.id=user.id
        await cookie.save()
        redirect("/profile")
         
    }
    
    
}