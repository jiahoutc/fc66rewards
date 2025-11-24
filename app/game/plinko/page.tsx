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
            const plinkoRewards = allRewards.filter((r: any) => r.category === 'PLINKO')
            setRewards(plinkoRewards)
        }
    }

    const dropBall = async () => {
        if (playing || result || !user) return
        setPlaying(true)

        // 1. Securely claim reward
        const res = await fetch('/api/user/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, category: 'PLINKO' }),
        })

        if (!res.ok) {
            alert('Error claiming reward')
            setPlaying(false)
            return
        }

        const data = await res.json()
        const wonReward = data.reward

        // 2. Determine target slot
        // We map the won reward to a random slot, or a specific one if we want to show labels
        // For this version, we'll reveal the reward *after* it lands, so any slot is fine.
        // BUT, to make it exciting, let's say we target the center slots for "good" stuff?
        // Let's just pick a random target slot for the visual effect.
        const targetSlotIndex = Math.floor(Math.random() * SLOT_COUNT)

        animateBall(targetSlotIndex, wonReward)
    }

    const animateBall = (targetSlotIndex: number, wonReward: any) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height

        // Physics / Animation State
        let ballX = width / 2
        let ballY = 50
        let velocityY = 0
        let velocityX = 0
        const gravity = 0.5
        const bounce = 0.6

        // Calculate a "path" of biases to guide the ball to the target slot
        // This is a simplified "rigged" physics. 
        // We want the ball to generally move towards the target x.
        const slotWidth = width / SLOT_COUNT
        const targetX = (targetSlotIndex * slotWidth) + (slotWidth / 2)

        const animate = () => {
            if (!playing) return // Stop if unmounted (though playing state is true)

            ctx.clearRect(0, 0, width, height)

            // Draw Pegs
            ctx.fillStyle = '#FFD700' // Gold
            for (let row = 0; row < ROWS; row++) {
                const pegsInThisRow = row % 2 === 0 ? PEGS_PER_ROW : PEGS_PER_ROW - 1
                const rowWidth = pegsInThisRow * 40 // spacing
                const startX = (width - rowWidth) / 2

                for (let i = 0; i < pegsInThisRow; i++) {
                    const pegX = startX + i * 40
                    const pegY = 100 + row * 40

                    ctx.beginPath()
                    ctx.arc(pegX, pegY, 4, 0, Math.PI * 2)
                    ctx.fill()

                    // Collision detection (Simplified)
                    const dx = ballX - pegX
                    const dy = ballY - pegY
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 14) { // Ball radius 10 + Peg radius 4
                        // Bounce
                        velocityY = -velocityY * bounce
                        velocityX += (dx / distance) * 2 // Deflect horizontally

                        // "Magnet" effect to guide to target
                        if (ballY < height - 100) { // Only guide while falling through pegs
                            if (ballX < targetX) velocityX += 0.2
                            else velocityX -= 0.2
                        }
                    }
                }
            }

            // Draw Slots
            for (let i = 0; i < SLOT_COUNT; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#222' : '#333'
                ctx.fillRect(i * slotWidth, height - 40, slotWidth, 40)
                ctx.strokeStyle = '#444'
                ctx.strokeRect(i * slotWidth, height - 40, slotWidth, 40)
            }

            // Update Ball Physics
            velocityY += gravity
            ballY += velocityY
            ballX += velocityX

            // Wall collisions
            if (ballX < 10 || ballX > width - 10) velocityX = -velocityX

            // Draw Ball
            ctx.fillStyle = '#ff0055' // Neon Pink
            ctx.beginPath()
            ctx.arc(ballX, ballY, 10, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 10
            ctx.shadowColor = '#ff0055'

            // Check if landed
            if (ballY >= height - 50) {
                setResult(wonReward)
                setPlaying(false)
            } else {
                requestAnimationFrame(animate)
            }
        }

        animate()
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
