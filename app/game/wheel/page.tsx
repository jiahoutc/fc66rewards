'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function WheelGame() {
    const [user, setUser] = useState<any>(null)
    const [rewards, setRewards] = useState<any[]>([])
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [rotation, setRotation] = useState(0)
    const wheelRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        fetchUser()
        fetchRewards()
    }, [])

    const fetchUser = async () => {
        const res = await fetch('/api/user/me')
        if (res.ok) {
            const userData = await res.json()
            setUser(userData)
            if (userData.isClaimed) {
                setResult({ name: userData.assignedReward })
            }
        } else {
            router.push('/')
        }
    }

    const fetchRewards = async () => {
        const res = await fetch('/api/rewards')
        if (res.ok) {
            const allRewards = await res.json()
            // Filter client-side for now since we don't have a public filter endpoint
            // In a real app, we'd filter on the server
            const wheelRewards = allRewards.filter((r: any) => r.category === 'WHEEL')
            setRewards(wheelRewards)
        }
    }

    const spinWheel = async () => {
        if (spinning || result || !user) return

        setSpinning(true)

        // 1. Call API to determine the winner securely
        const res = await fetch('/api/user/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, category: 'WHEEL' }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            alert(errorData.error || 'Error claiming reward')
            setSpinning(false)
            return
        }

        const data = await res.json()
        const wonReward = data.reward

        // 2. Calculate rotation to land on the winner
        // We need to find the index of the winner
        const winnerIndex = rewards.findIndex(r => r.name === wonReward.name)

        if (winnerIndex === -1) {
            // Fallback if reward not found in local list (shouldn't happen)
            setResult(wonReward)
            setSpinning(false)
            return
        }

        // Calculate angles
        const segmentAngle = 360 / rewards.length
        // The wheel spins clockwise, so to land on index i, we need to rotate counter-clockwise relative to the pointer
        // Let's assume pointer is at top (0 degrees)
        // We want the winning segment to be at the top after rotation.
        // If we add 360 * 5 (5 full spins) + specific angle

        // Randomize landing position within the segment to look natural
        const randomOffset = Math.random() * (segmentAngle - 2) + 1 // Buffer of 1deg

        // The angle to rotate TO
        // We want the winning segment to end up at 0deg (top)
        // Current position of segment i is: i * segmentAngle
        // To bring it to 0, we rotate by: - (i * segmentAngle)
        // Add extra spins: 360 * 5
        const targetRotation = 360 * 5 + (360 - (winnerIndex * segmentAngle)) - (segmentAngle / 2)
        // Note: The math depends on how the wheel is drawn. Let's assume segment 0 starts at 0deg.

        setRotation(targetRotation)

        // 3. Wait for animation to finish
        setTimeout(() => {
            setResult(wonReward)
            setSpinning(false)
        }, 5000) // Match CSS transition time
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

            <h1 className="text-4xl font-bold text-gold mb-8 z-10 drop-shadow-lg">Lucky Wheel</h1>

            {/* Wheel Container */}
            <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-12 bg-red-600 shadow-lg"
                    style={{ clipPath: 'polygon(100% 0, 50% 100%, 0 0)' }}></div>

                {/* The Wheel */}
                <div
                    className="w-full h-full rounded-full border-8 border-gold shadow-[0_0_50px_rgba(255,215,0,0.3)] relative overflow-hidden transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: spinning ? '5s' : '0s'
                    }}
                >
                    {rewards.map((reward, index) => {
                        const angle = 360 / rewards.length
                        const rotate = index * angle
                        const skew = 90 - angle

                        // Alternate colors
                        const color = index % 2 === 0 ? '#1a1a1a' : '#333333'

                        return (
                            <div
                                key={reward.id}
                                className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left border-l border-b border-gold/20"
                                style={{
                                    transform: `rotate(${rotate}deg) skewY(-${skew}deg)`,
                                    background: color
                                }}
                            >
                                <div
                                    className="absolute bottom-0 left-0 w-full text-center p-4 flex flex-col items-center justify-end h-full"
                                    style={{
                                        transform: `skewY(${skew}deg) rotate(${angle / 2}deg)`,
                                        paddingBottom: '20%'
                                    }}
                                >
                                    <span className="text-white font-bold text-sm md:text-lg drop-shadow-md">{reward.name}</span>
                                    {reward.imageUrl && (
                                        <img src={reward.imageUrl} alt={reward.name} className="w-8 h-8 md:w-12 md:h-12 mt-2 object-contain" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Spin Button (Center) */}
                <button
                    onClick={spinWheel}
                    disabled={spinning || !!result}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 rounded-full bg-gradient-to-br from-gold to-yellow-600 shadow-lg flex items-center justify-center font-bold text-black border-4 border-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {spinning ? '...' : 'SPIN'}
                </button>
            </div>

            {/* Result Modal */}
            {result && !spinning && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-900 border-2 border-gold p-8 rounded-2xl text-center max-w-md mx-4 shadow-[0_0_50px_rgba(255,215,0,0.5)]">
                        <h2 className="text-3xl font-bold text-white mb-4">Congratulations!</h2>
                        <p className="text-gray-400 mb-6">You won:</p>

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
