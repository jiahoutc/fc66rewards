'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ClaimPage() {
    const [user, setUser] = useState<any>(null)
    const [config, setConfig] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState(false)
    const [reward, setReward] = useState<any>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const router = useRouter()

    useEffect(() => {
        // Check session (simplified, ideally check cookie or verify with API)
        // For now, we rely on local storage or just re-login if needed.
        // Actually, let's fetch user status from a new endpoint or just use the ID from cookie if we could access it client side (we can't easily).
        // We'll ask user to re-login if we don't have state, OR we can store ID in localStorage on login.
        // Let's assume we stored it in localStorage for MVP simplicity.
        // Wait, I didn't store it in localStorage in login page.
        // I should update login page to store it, or add a /api/user/me endpoint.
        // I'll add /api/user/me endpoint quickly.
        // For now, I'll just redirect to login if no user found in a simple check.
        // Wait, I can't check cookie on client.
        // I'll implement a simple client-side check by trying to call an API that requires auth?
        // Or just let the user input ID again? No, that's bad UX.
        // I'll add a `useEffect` to fetch `/api/user/me` (which I need to create) or just use the `middleware` protection and assume if we are here, we are logged in?
        // Middleware protects `/admin`, not `/claim` yet.
        // I'll update middleware to protect `/claim` too?
        // Yes, I should.

        // But I need the user ID to call claim API.
        // I'll create `/api/user/me` that reads the cookie.
        fetchUser()
        fetchConfig()
    }, [])

    const fetchUser = async () => {
        const res = await fetch('/api/user/me')
        if (res.ok) {
            const data = await res.json()
            setUser(data.user)
            if (data.user.isClaimed) {
                setReward({ name: data.user.assignedReward })
            }
        } else {
            router.push('/')
        }
        setLoading(false)
    }

    const fetchConfig = async () => {
        const res = await fetch('/api/config')
        if (res.ok) {
            setConfig(await res.json())
        }
    }

    const handleClaim = async () => {
        if (claiming || reward) return
        setClaiming(true)

        // Simulate delay for animation
        setTimeout(async () => {
            const res = await fetch('/api/user/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id }),
            })

            if (res.ok) {
                const data = await res.json()
                setReward(data.reward)
            }
            setClaiming(false)
        }, 2000)
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background text-white"
            style={{
                backgroundImage: config.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            {/* Overlay Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, var(--primary) 0, var(--primary) 1px, transparent 0, transparent 50%)',
                    backgroundSize: '20px 20px'
                }}
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

            {/* Music Player */}
            {config.backgroundMusicUrl && (
                <audio ref={audioRef} src={config.backgroundMusicUrl} autoPlay loop />
            )}

            {/* Content */}
            <div className="z-10 text-center w-full max-w-6xl p-4">
                {loading ? (
                    <div className="text-4xl font-black text-primary animate-pulse tracking-widest">LOADING CASINO...</div>
                ) : reward ? (
                    <div className="animate-fade-in">
                        <h1 className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-b from-neon-gold via-primary to-yellow-700 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] animate-bounce-slight">
                            JACKPOT!
                        </h1>
                        <div className="bg-zinc-900/90 p-12 rounded-3xl border-4 border-primary inline-block shadow-[0_0_100px_rgba(255,215,0,0.4)] relative overflow-hidden group">
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                            {reward.imageUrl && (
                                <img src={reward.imageUrl} alt={reward.name} className="w-80 h-80 object-contain mx-auto mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-pulse-slow" />
                            )}
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{reward.name}</h2>
                            <p className="text-primary text-xl uppercase tracking-widest font-bold">Reward Claimed Successfully</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-tighter">
                            CHOOSE YOUR <span className="text-primary drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">FORTUNE</span>
                        </h1>

                        <div className="flex flex-col md:flex-row gap-12 justify-center items-center perspective-1000">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    onClick={handleClaim}
                                    className={`
                    relative w-72 h-96 bg-gradient-to-b from-zinc-800 to-zinc-950 
                    border-4 border-zinc-700 rounded-2xl 
                    cursor-pointer transition-all duration-500 
                    hover:-translate-y-4 hover:rotate-1 hover:border-primary hover:shadow-[0_0_50px_rgba(255,215,0,0.4)]
                    flex flex-col items-center justify-center group
                    ${claiming ? 'animate-pulse pointer-events-none brightness-50' : ''}
                  `}
                                >
                                    {/* Card Back Pattern */}
                                    <div className="absolute inset-4 border-2 border-dashed border-zinc-600 rounded-xl opacity-30 group-hover:border-primary group-hover:opacity-50 transition-colors" />

                                    <div className="text-8xl mb-4 transform group-hover:scale-125 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                                        🎰
                                    </div>
                                    <div className="text-2xl font-black text-zinc-500 group-hover:text-primary transition-colors tracking-widest">
                                        MYSTERY {i}
                                    </div>

                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-2xl transition-colors duration-300" />
                                </div>
                            ))}
                        </div>

                        <p className="mt-12 text-zinc-500 text-sm uppercase tracking-[0.5em] animate-pulse">Select a card to reveal your prize</p>
                    </div>
                )}
            </div>
        </div>
    )
}
