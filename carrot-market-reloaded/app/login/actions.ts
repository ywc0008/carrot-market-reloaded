'use server';

import { z } from "zod";
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "../lib/constants";

const formSchema=z.object({
  email:z.string().email().toLowerCase(),
  password: z.string({
    required_error:"비밀번호를 입력하시오"
  }).min(PASSWORD_MIN_LENGTH).regex(PASSWORD_REGEX,PASSWORD_REGEX_ERROR)
})

export async function login(preState:any,formData: FormData) {
  const data={
    email:formData.get("email"),
    password: formData.get("password")
  }
  const result = formSchema.safeParse(data);
  if(!result.success){
    console.log(result.error.flatten());
    return result.error.flatten();
  }else{
    console.log(result.data);
    
  }
  }