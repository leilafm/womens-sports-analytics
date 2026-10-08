import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../api";

function AuthPage() {
    const location = useLocation();
    const isRegister = location.pathname === "/register";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    async function submit(event: FormEvent) {
        event.preventDefault();
        setError("");

        try {
            if (isRegister) {
                await apiFetch("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ email, password, name }),
                });
            }

            const result = await apiFetch<{
                token: string;
                user: { id: number; email: string; name: string | null };
            }>("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            localStorage.setItem("token", result.token);
            window.location.href = "/favorites";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        }
    }

    return (
        <main className="container">
            <div className="auth-card">
                <h1>{isRegister ? "Create account" : "Log in"}</h1>

                <form onSubmit={submit}>
                    {isRegister && (
                        <input
                            placeholder="Name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button type="submit">
                        {isRegister ? "Create account" : "Log in"}
                    </button>
                </form>

                {error && <p>{error}</p>}
            </div>
        </main>
    );
}

export default AuthPage;
