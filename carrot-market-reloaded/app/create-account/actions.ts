"use server";
import {z} from "zod";
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "../lib/constants";


const checkUsername=(username:string)=> !username.includes("potato");

const checkPasswords=({password, confirm_password}:{password:string,confirm_password:string})=> password===confirm_password

const formSchema=z.object({
    username:z.string({
        invalid_type_error:"Username nust be a string!",
        required_error:"Where is my username???",
    }).toLowerCase().trim().refine(checkUsername,"No potatoes allowed!"),
    email:z.string().email().toLowerCase(),
    password:z.string().min(PASSWORD_MIN_LENGTH).regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password:z.string().min(PASSWORD_MIN_LENGTH),
}).refine(checkPasswords,{message: "두 비번이 같아야함",
path:["confirm_password"]})

export async function createAccount(prevState:any, formData:FormData) {
    const data={
    username:formData.get("username"),
    email:formData.get("email"),
    password:formData.get("password"),
    confirm_password:formData.get("confirm_password"),
    };
    const result = formSchema.safeParse(data);
    if(!result.success){
        return result.error.flatten();
    }else {
        console.log(result.data);
        
    }
    
    
}