'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ScratchGame() {
    const [user, setUser] = useState<any>(null)
    const [reward, setReward] = useState<any>(null)
    const [isRevealed, setIsRevealed] = useState(false)
    const [error, setError] = useState('')
    const [isClaiming, setIsClaiming] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [scratchedPercent, setScratchedPercent] = useState(0)

    const router = useRouter()

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        const res = await fetch('/api/user/me')
        if (res.ok) {
            const data = await res.json()
            setUser(data.user)
        } else {
            router.push('/')
        }
    }

    const initCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Fill with silver scratch coating
        ctx.fillStyle = '#C0C0C0' // Silver
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add some noise/texture to look like scratch foil
        for (let i = 0; i < 500; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#A9A9A9' : '#D3D3D3'
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                2, 2
            )
        }

        // Add "SCRATCH HERE" text
        ctx.fillStyle = '#666666'
        ctx.font = 'bold 24px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2)
    }

    // Initialize canvas when reward is loaded
    useEffect(() => {
        if (reward && !isRevealed) {
            // Slight delay to ensure DOM is ready
            setTimeout(initCanvas, 100)
        }
    }, [reward])

    const handleStartGame = async () => {
        if (!user || user.credits < 1) return
        setIsClaiming(true)
        setError('')

        try {
            const res = await fetch('/api/user/claim', {
                method: 'POST',
                body: JSON.stringify({
                    id: user.id,
                    category: 'SCRATCH'
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to start game')
                setIsClaiming(false)
                return
            }

            setReward(data.reward)
            // Decrease local credits immediately for UI
            setUser((prev: any) => ({ ...prev, credits: prev.credits - 1 }))
            setIsClaiming(false)

        } catch (err) {
            setError('Something went wrong')
            setIsClaiming(false)
        }
    }

    const getMousePos = (e: any) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const scratch = (e: any) => {
        if (!isDrawing || isRevealed) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const { x, y } = getMousePos(e)

        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        ctx.arc(x, y, 20, 0, Math.PI * 2)
        ctx.fill()

        // Check progress occasionally
        if (Math.random() > 0.8) checkScratchProgress()
    }

    const checkScratchProgress = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let transparentConfig = 0

        // Check alpha channel of every 4th pixel (optimization)
        for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) transparentConfig++
        }

        const totalPixels = pixels.length / 16
        const percent = (transparentConfig / totalPixels) * 100
        setScratchedPercent(percent)

        if (percent > 40) {
            setIsRevealed(true)
        }
    }

    const resetGame = () => {
        setReward(null)
        setIsRevealed(false)
        setScratchedPercent(0)
        setError('')
    }

    return (
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-md flex justify-between items-center mb-8">
                <button
                    onClick={() => router.push('/lobby')}
                    className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                    ← Lobby
                </button>
                <div className="bg-black/50 backdrop-blur border border-gold/30 px-4 py-2 rounded-full">
                    <span className="text-gold font-bold">{user?.credits || 0} Credits</span>
                </div>
            </div>

            <div className="relative z-10 text-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-gold to-yellow-200 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] mb-2">
                    Scratch & Win
                </h1>
                <p className="text-gray-400">Reveal 40% to claim your prize!</p>
            </div>

            {/* Game Area */}
            <div className="relative w-[320px] h-[320px] bg-white rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-zinc-800 ring-2 ring-gold/50">

                {!reward ? (
                    // Start Screen
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 p-6 text-center">
                        <div className="text-6xl mb-4">🎫</div>
                        <h3 className="text-xl font-bold text-white mb-2">Ready to Scratch?</h3>
                        <p className="text-gray-400 text-sm mb-6">Cost: 1 Credit</p>

                        {user?.credits > 0 ? (
                            <button
                                onClick={handleStartGame}
                                disabled={isClaiming}
                                className="px-8 py-3 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isClaiming ? 'Preparing...' : 'SCRATCH NOW'}
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-red-400 font-bold border border-red-500/30 bg-red-500/10 px-4 py-2 rounded">
                                    No Credits Left
                                </div>
                                <button
                                    onClick={() => router.push('/lobby')}
                                    className="text-sm text-gray-400 hover:text-white underline"
                                >
                                    Back to Lobby
                                </button>
                            </div>
                        )}

                        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                    </div>
                ) : (
                    // Scratch Canvas Area
                    <div className="relative w-full h-full">
                        {/* The Reward (Underneath) */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6 transition-all duration-1000 ${isRevealed ? 'scale-100' : 'scale-95'}`}>
                            {/* Glow Effect when revealed */}
                            {isRevealed && <div className="absolute inset-0 bg-gold/10 animate-pulse"></div>}

                            {reward.imageUrl ? (
                                <img src={reward.imageUrl} alt={reward.name} className="w-32 h-32 object-contain mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                            ) : (
                                <div className="text-6xl mb-4">🎁</div>
                            )}
                            <h2 className="text-2xl font-bold text-gold text-center">{reward.name}</h2>
                            {isRevealed && (
                                <div className="mt-4 animate-bounce">
                                    <span className="bg-gold text-black text-xs font-bold px-3 py-1 rounded-full">
                                        WINNER!
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* The Scratch Layer (Canvas) */}
                        <canvas
                            ref={canvasRef}
                            width={320}
                            height={320}
                            className={`absolute inset-0 cursor-crosshair touch-none transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            onMouseDown={() => setIsDrawing(true)}
                            onMouseUp={() => setIsDrawing(false)}
                            onMouseMove={scratch}
                            onMouseLeave={() => setIsDrawing(false)}
                            onTouchStart={() => setIsDrawing(true)}
                            onTouchEnd={() => setIsDrawing(false)}
                            onTouchMove={scratch}
                        />
                    </div>
                )}
            </div>

            {/* Result Modal */}
            {isRevealed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-zinc-900 border border-gold rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(255,215,0,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

                        <h2 className="text-3xl font-bold text-white mb-2">CONGRATULATIONS!</h2>
                        <div className="text-gold text-xl mb-6">You won {reward.name}</div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={resetGame}
                                className="w-full py-3 bg-gold text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                            >
                                {user?.credits > 0 ? 'Play Again' : 'View Reward'}
                            </button>
                            <button
                                onClick={() => router.push('/lobby')}
                                className="w-full py-3 bg-zinc-800 text-gray-300 font-bold rounded-lg hover:bg-zinc-700 transition-colors"
                            >
                                Back to Lobby
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
