'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    })

    if (res.ok) {
      router.push('/lobby')
    } else {
      setError('Invalid ID or Password')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Casino Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse-slow" />

      <div className="z-10 w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-yellow-600 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] tracking-widest">
            CASINO
          </h1>
          <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mt-2">Rewards Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded text-center text-sm animate-bounce-slight">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-primary font-bold uppercase tracking-wider ml-1">Customer ID</label>
            <input
              type="text"
              placeholder="Enter your ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-black/50 border-2 border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:shadow-[0_0_15px_rgba(255,215,0,0.3)] outline-none transition-all duration-300"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-primary font-bold uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border-2 border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:border-primary focus:shadow-[0_0_15px_rgba(255,215,0,0.3)] outline-none transition-all duration-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 via-primary to-yellow-600 text-black font-black py-4 rounded-lg text-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] uppercase tracking-widest mt-4"
          >
            Enter
          </button>
        </form>
      </div>

      <div className="absolute bottom-8 text-zinc-600 text-xs tracking-widest">
        SECURE CONNECTION ESTABLISHED
      </div>
    </div>
  )
}
