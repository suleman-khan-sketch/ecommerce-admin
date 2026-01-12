"use client";

import axios from "axios";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Typography from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FormSubmitButton } from "@/components/shared/form/FormSubmitButton";

import { loginFields } from "./fields";
import { loginFormSchema } from "./schema";
import AuthProviders from "@/components/shared/auth/AuthProviders";

type FormData = z.infer<typeof loginFormSchema>;

export default function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const form = useForm<FormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      toast.error("Access Denied", {
        description: "You don't have permission to access the admin dashboard. Only admin users can log in.",
        position: "top-center",
      });
    }
  }, [searchParams]);

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("[LOGIN-FORM] Starting mutation with email:", formData.email);

      try {
        const response = await axios.post("/auth/sign-in", formData);
        console.log("[LOGIN-FORM] Response received:", response.status);
        console.log("[LOGIN-FORM] Response data:", response.data);
        return response;
      } catch (error) {
        console.error("[LOGIN-FORM] Mutation error:", error);
        if (axios.isAxiosError(error)) {
          console.error("[LOGIN-FORM] Response status:", error.response?.status);
          console.error("[LOGIN-FORM] Response data:", error.response?.data);
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log("[LOGIN-FORM] Mutation successful");

      toast.success("Login Success!", {
        description: searchParams.get("redirect_to")
          ? "Redirecting to your page..."
          : "Redirecting to the dashboard...",
        position: "top-center",
      });

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error) => {
      console.error("[LOGIN-FORM] onError called with:", error);

      if (axios.isAxiosError(error)) {
        const { errors } = error.response?.data || {};
        console.error("[LOGIN-FORM] Validation errors:", errors);

        // Show error details in UI
        if (errors?.password) {
          form.setError("password", {
            message: errors.password,
          });
        }

        for (const key in errors) {
          if (errors[key]) {
            form.setError(key as keyof FormData, {
              message: errors[key],
            });
          }
        }

        // Also show a toast with the full error
        toast.error("Login Failed", {
          description: errors?.password || "An error occurred during login",
          position: "top-center",
        });
      } else {
        console.error("[LOGIN-FORM] Non-axios error:", error);
        toast.error("Login Failed", {
          description: "An unexpected error occurred",
          position: "top-center",
        });
      }
    },
  });

  const onSubmit = (formData: FormData) => {
    console.log("[LOGIN-FORM] Form submitted with email:", formData.email);
    mutate(formData);
  };

  useEffect(() => {
    console.log("[LOGIN-FORM] useEffect triggered, isSuccess:", isSuccess);

    if (isSuccess) {
      const redirectTo = searchParams.get("redirect_to");
      console.log("[LOGIN-FORM] Redirecting to:", redirectTo || "/");

      setTimeout(() => {
        console.log("[LOGIN-FORM] Executing redirect now");
        router.push(redirectTo || "/");
      }, 500);
    }
  }, [isSuccess, searchParams, router]);

  return (
    <div className="w-full">
      <Typography variant="h2" className="mb-8">
        Login
      </Typography>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {loginFields.map((formField) => (
            <FormField
              key={`form-field-${formField.name}`}
              control={form.control}
              name={formField.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{formField.label}</FormLabel>
                  <FormControl>
                    <Input
                      type={formField.inputType}
                      placeholder={formField.placeholder}
                      autoComplete={formField.autoComplete}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <FormSubmitButton isPending={isPending} className="w-full">
            Login
          </FormSubmitButton>
        </form>
      </Form>

      <Separator className="my-12" />

      <AuthProviders />

      <div className="flex flex-wrap justify-between gap-4 w-full">
        <Typography variant="a" href="/forgot-password" className="md:!text-sm">
          Forgot password?
        </Typography>
        <Typography variant="a" href="/signup" className="md:!text-sm">
          Create an account
        </Typography>
      </div>
    </div>
  );
}
