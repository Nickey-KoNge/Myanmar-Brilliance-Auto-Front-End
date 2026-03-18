"use client";

import React, { useState } from "react";
import styles from "./LoginForm.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChargingStation,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { Input } from "@/app/components/ui/Input/Input";
import { Button } from "@/app/components/ui/Button/Button";
import { Checkbox } from "@/app/components/ui/Checkbox/Checkbox";
import { useRouter } from "next/navigation";

type LoginInputs = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>();
  const router = useRouter();

  // Login status နှင့် error များကိုပြရန် state များ
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // ၁။ Backend သို့ Login request ပို့ခြင်း
      const response = await axios.post(
        "http://localhost:3001/credentials/login",
        {
          email: data.email,
          password: data.password,
        },
      );

      console.log(data.email);

      // ၂။ Response မှ Token များကို ရယူခြင်း
      const { access_token, refresh_token } = response.data.data;
      console.log(access_token);
      console.log(refresh_token);

      // ၃။ Cookies ထဲတွင် သိမ်းဆည်းခြင်း
      Cookies.set("access_token", access_token, {
        expires: 10 / 1440,
        secure: true,
      });

      Cookies.set("refresh_token", refresh_token, { expires: 7, secure: true });

      console.log("Login Successful!");
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setServerError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.logoContainer}>
        <svg
          className={styles.logoIcon}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
        </svg>
      </div>

      <h2 className={styles.title}>
        MYANMAR BRILLIANCE <span>AUTO</span>
      </h2>

      {serverError && (
        <p
          style={{
            color: "#ff4d4d",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {serverError}
        </p>
      )}

      <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="email"
          label="PERSONNEL ID / EMAIL"
          placeholder="example@gmail.com"
          icon={<FontAwesomeIcon icon={faUser} />}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={errors.email?.message}
        />

        <Input
          type="password"
          label="SECURE PASSWORD"
          placeholder="****************"
          icon={<FontAwesomeIcon icon={faLock} />}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={errors.password?.message}
        />

        <div className={styles.optionsRow}>
          <Checkbox label="Remember Me" {...register("rememberMe")} />

          <a href="#" className={styles.forgotPassword}>
            Forget Your Password?
          </a>
        </div>

        <Button
          type="submit"
          // icon={}
          disabled={isLoading}
        >
          {isLoading ? "SIGNING IN..." : "SIGN IN"} <FontAwesomeIcon icon={faChargingStation} />
        </Button>
      </form>

      <hr className={styles.divider} />

      <div className={styles.footerText}>
        <strong>
          © 2026 MYANMAR BRILLIANCE AUTO CO.,LTD . EV INDUSTRIAL SYSTEMS
        </strong>
      </div>
    </div>
  );
};
