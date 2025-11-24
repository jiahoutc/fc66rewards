'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Lobby() {
    const [user, setUser] = useState<any>(null)
    const [config, setConfig] = useState<any>({})
    const router = useRouter()

    useEffect(() => {
        fetchUser()
        fetchConfig()
    }, [])

    const fetchUser = async () => {
        const res = await fetch('/api/user/me')
        if (res.ok) {
            setUser(await res.json())
        } else {
            router.push('/')
        }
    }

    const fetchConfig = async () => {
        const res = await fetch('/api/config')
        if (res.ok) setConfig(await res.json())
    }

    const games = [
        {
            id: 'box',
            name: 'Mystery Box',
            description: 'Open a box to reveal your fortune!',
            path: '/claim', // Keeping existing path for now
            color: 'from-purple-600 to-blue-600',
            icon: '🎁'
        },
        {
            id: 'wheel',
            name: 'Lucky Wheel',
            description: 'Spin the wheel and win big!',
            path: '/game/wheel',
            color: 'from-red-600 to-orange-600',
            icon: '🎡'
        },
        {
            id: 'plinko',
            name: 'Plinko',
            description: 'Drop the ball and watch it fall!',
            path: '/game/plinko',
            color: 'from-green-600 to-teal-600',
            icon: '🎱'
        },
        {
            id: 'scratch',
            name: 'Scratch Card',
            description: 'Scratch to reveal hidden prizes!',
            path: '/game/scratch',
            color: 'from-yellow-600 to-amber-600',
            icon: '🎫'
        }
    ]

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white p-4"
            style={{
                backgroundImage: config.backgroundImageUrl ? `url(${config.backgroundImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>

            <div className="relative z-10 w-full max-w-4xl">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-300 to-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                            GAME LOBBY
                        </h1>
                        <p className="text-gray-300 mt-2">Welcome, {user?.id}</p>
                    </div>
                    <button
                        onClick={() => {
                            document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                            router.push('/')
                        }}
                        className="px-4 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {games.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => router.push(game.path)}
                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 p-6 text-left transition-all hover:scale-[1.02] hover:border-gold/50 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${game.color}`}></div>

                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-4xl mb-4">{game.icon}</div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gold transition-colors">
                                        {game.name}
                                    </h3>
                                    <p className="text-gray-400 group-hover:text-gray-200">
                                        {game.description}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/20">
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
