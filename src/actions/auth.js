// src/actions/auth.js

"use server";

import { signIn } from "@/auth";

export async function doCredentialsSignIn(formData) {
  try {
    const response = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: false,
    });
    return response;
  } catch (err) {
    throw new Error(err);
  }
}
