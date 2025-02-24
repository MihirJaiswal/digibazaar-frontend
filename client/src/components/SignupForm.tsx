'use client';
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUp() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:8800/api/auth/register", data);
      console.log("Success:", response.data);
      reset();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96 p-6 shadow-lg">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Username" {...register("username", { required: true })} />
            <Input type="email" placeholder="Email" {...register("email", { required: true })} />
            <Input type="password" placeholder="Password" {...register("password", { required: true })} />
            <Input placeholder="Profile Image URL" {...register("img")} />
            <Input placeholder="Country" {...register("country", { required: true })} />
            <Input placeholder="Phone" {...register("phone", { required: true })} />
            <Input placeholder="Description" {...register("desc")} />
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("isSeller")} id="isSeller" />
              <label htmlFor="isSeller">Register as Seller</label>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registering..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
