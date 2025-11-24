'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function PlinkoGame() {
    const [user, setUser] = useState<any>(null)
    const [rewards, setRewards] = useState<any[]>([])
    const [playing, setPlaying] = useState(false)
    const [result, setResult] = useState<any>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const router = useRouter()

    // Configuration
    const ROWS = 10
    const PEGS_PER_ROW = 15 // Base
    const SLOT_COUNT = 9 // Number of reward slots at bottom

    useEffect(() => {
        fetchUser()
        fetchRewards()
    }, [])

    const fetchUser = async () => {
        const res = await fetch('/api/user/me')
        if (res.ok) {
            const data = await res.json()
            setUser(data.user)
            if (data.user.isClaimed) {
                setResult({ name: data.user.assignedReward })
            }
        } else {
            router.push('/')
        }
    }

    const fetchRewards = async () => {
        const res = await fetch('/api/rewards')
        if (res.ok) {
        }

        if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>

        return (
            <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center overflow-hidden relative">
                <button
                    onClick={() => router.push('/lobby')}
                    className="absolute top-4 left-4 text-gray-400 hover:text-white z-20"
                >
                    ← Back to Lobby
                </button>

                <h1 className="text-4xl font-bold text-gold mb-4 z-10 drop-shadow-lg">Plinko</h1>

                <div className="relative bg-black/50 border-4 border-gold rounded-xl p-4 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={600}
                        className="bg-zinc-900 rounded-lg"
                    />

                    {!playing && !result && (
                        <button
                            onClick={dropBall}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-xl rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white"
                        >
                            DROP BALL
                        </button>
                    )}
                </div>

                {/* Result Modal */}
                {result && !playing && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-zinc-900 border-2 border-gold p-8 rounded-2xl text-center max-w-md mx-4 shadow-[0_0_50px_rgba(255,215,0,0.5)]">
                            <h2 className="text-3xl font-bold text-white mb-4">Plinko!</h2>
                            <p className="text-gray-400 mb-6">The ball landed on:</p>

                            <div className="text-5xl mb-6 animate-bounce-slight">
                                {result.imageUrl ? (
                                    <img src={result.imageUrl} alt={result.name} className="w-32 h-32 mx-auto object-contain" />
                                ) : '🎁'}
                            </div>

                            <h3 className="text-2xl font-bold text-gold mb-8">{result.name}</h3>

                            <button
                                onClick={() => router.push('/lobby')}
                                className="bg-gold text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors"
                            >
                                Back to Lobby
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
