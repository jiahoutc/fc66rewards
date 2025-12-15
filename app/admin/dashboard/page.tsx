'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users')
    const router = useRouter()

    // Data States
    const [users, setUsers] = useState<any[]>([])
    const [config, setConfig] = useState<any>({})
    const [rewards, setRewards] = useState<any[]>([])
    const [gameModes, setGameModes] = useState<any[]>([]) // New: Game Mode State

    // Form States
    const [newUserId, setNewUserId] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [bgUrl, setBgUrl] = useState('')
    const [musicUrl, setMusicUrl] = useState('')
    const [newRewardName, setNewRewardName] = useState('')
    const [newRewardImage, setNewRewardImage] = useState('')

    // Credit Modal States
    const [selectedUserForCredits, setSelectedUserForCredits] = useState<any>(null)
    const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState(0)
    const [creditHistory, setCreditHistory] = useState<any[]>([])
    const [creditDescription, setCreditDescription] = useState('Admin adjustment')

    useEffect(() => {
        fetchUsers()
        fetchConfig()
        fetchRewards()
        fetchGameModes()
    }, [])

    const fetchGameModes = async () => {
        const res = await fetch('/api/admin/gamemodes')
        if (res.ok) setGameModes(await res.json())
    }

    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users')
        if (res.ok) setUsers(await res.json())
    }

    const fetchConfig = async () => {
        const res = await fetch('/api/config')
        if (res.ok) {
            const data = await res.json()
            setConfig(data)
            setBgUrl(data.backgroundImageUrl || '')
            setMusicUrl(data.backgroundMusicUrl || '')
        }
    }

    const fetchRewards = async () => {
        const res = await fetch('/api/rewards')
        if (res.ok) setRewards(await res.json())
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({ id: newUserId, password: newUserPassword }),
        })
        if (res.ok) {
            setNewUserId('')
            setNewUserPassword('')
            fetchUsers()
        }
    }

    const handleResetUser = async (id: string) => {
        if (!confirm('Reset claim status for this user?')) return
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ isClaimed: false, assignedReward: null }),
        })
        if (res.ok) fetchUsers()
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Delete this user?')) return
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
        })
        if (res.ok) fetchUsers()
    }

    const handleUpdateConfig = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/config', {
            method: 'POST',
            body: JSON.stringify({
                backgroundImageUrl: bgUrl,
                backgroundMusicUrl: musicUrl,
            }),
        })
        if (res.ok) fetchConfig()
    }

    const [newRewardCategory, setNewRewardCategory] = useState('BOX')
    const [newRewardStock, setNewRewardStock] = useState(1)
    const [newRewardPrice, setNewRewardPrice] = useState(1)

    const handleCreateReward = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/rewards', {
            method: 'POST',
            body: JSON.stringify({
                name: newRewardName,
                imageUrl: newRewardImage,
                category: newRewardCategory,
                stock: newRewardStock,
                price: newRewardPrice
            }),
        })
        if (res.ok) {
            setNewRewardName('')
            setNewRewardImage('')
            setNewRewardCategory('BOX')
            setNewRewardStock(1)
            setNewRewardPrice(1)
            fetchRewards()
        }
    }

    const handleDeleteReward = async (id: string) => {
        if (!confirm('Delete this reward?')) return
        const res = await fetch(`/api/rewards/${id}`, {
            method: 'DELETE',
        })
        if (res.ok) fetchRewards()
    }

    const handleOpenCreditModal = async (user: any) => {
        setSelectedUserForCredits(user)
        setCreditAdjustmentAmount(0)
        // Fetch history
        const res = await fetch(`/api/admin/credits?userId=${user.id}`)
        if (res.ok) {
            const data = await res.json()
            setCreditHistory(data.history || [])
        }
    }

    const handleAdjustCredits = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUserForCredits) return

        const res = await fetch('/api/admin/credits', {
            method: 'POST',
            body: JSON.stringify({
                userId: selectedUserForCredits.id,
                amount: creditAdjustmentAmount,
                description: creditDescription
            })
        })

        if (res.ok) {
            // Refresh user list to see new balance
            fetchUsers()
            // Refresh history
            const histRes = await fetch(`/api/admin/credits?userId=${selectedUserForCredits.id}`)
            if (histRes.ok) {
                const data = await histRes.json()
                setCreditHistory(data.history || [])
            }
            setCreditAdjustmentAmount(0)
            setCreditDescription('Admin adjustment')
        }
    }

    const handleLogout = () => {
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/admin/login')
    }

    return (
        // ... (nav remains same)
        <div className="min-h-screen bg-black text-white">
            <nav className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-900">
                <h1 className="text-xl font-bold text-gold" style={{ color: 'var(--primary)' }}>Admin Dashboard</h1>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
            </nav>

            <div className="container mx-auto p-6">
                {/* ... (tabs remain same) */}
                <div className="flex gap-4 mb-8 border-b border-zinc-800 pb-1">
                    {['users', 'config', 'rewards'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 px-4 capitalize ${activeTab === tab
                                ? 'border-b-2 border-primary text-primary font-bold'
                                : 'text-gray-400 hover:text-white'
                                }`}
                            style={{ borderColor: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? 'var(--primary)' : '' }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ... (users tab remains same) */}
                {/* Content Area */}
                <div className="bg-zinc-900 rounded-lg p-6 min-h-[500px]">
                    {activeTab === 'users' && (
                        <div>
                            {/* ... (user content) */}
                            <div className="mb-8 bg-zinc-800 p-6 rounded-lg border border-zinc-700">
                                <h2 className="text-lg font-bold mb-4 text-white">Create New User</h2>
                                <form onSubmit={handleCreateUser} className="flex gap-4">
                                    <input
                                        placeholder="Customer ID"
                                        value={newUserId}
                                        onChange={(e) => setNewUserId(e.target.value)}
                                        className="input flex-1 bg-zinc-900 border-zinc-600"
                                        required
                                    />
                                    <input
                                        placeholder="Password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        className="input flex-1 bg-zinc-900 border-zinc-600"
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary whitespace-nowrap">Create User</button>
                                </form>
                            </div>

                            <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-900 text-gray-400">
                                        <tr>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Credits</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Reward</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-t border-zinc-700 hover:bg-zinc-900/50">
                                                <td className="p-4 font-mono text-gold">{user.id}</td>
                                                <td className="p-4">{user.credits}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs border ${user.isClaimed
                                                        ? 'bg-green-900/30 text-green-400 border-green-800'
                                                        : 'bg-yellow-900/30 text-yellow-400 border-yellow-800'}`}>
                                                        {user.isClaimed ? 'Claimed' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-300">{user.assignedReward || '-'}</td>
                                                <td className="p-4 flex gap-3">
                                                    <button onClick={() => handleResetUser(user.id)} className="text-sm text-blue-400 hover:text-blue-300 hover:underline">Reset</button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-sm text-red-400 hover:text-red-300 hover:underline">Delete</button>
                                                    <button onClick={() => handleOpenCreditModal(user)} className="text-sm text-gold hover:text-yellow-300 hover:underline ml-2">Credits</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'config' && (
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-bold mb-6 text-gold">Site Configuration</h2>
                            <form onSubmit={handleUpdateConfig} className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Background Image URL</label>
                                    <input
                                        value={bgUrl}
                                        onChange={(e) => setBgUrl(e.target.value)}
                                        className="input w-full bg-zinc-800 border-zinc-700 focus:border-gold"
                                        placeholder="https://example.com/bg.jpg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">URL to the main background image.</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Background Music URL</label>
                                    <input
                                        value={musicUrl}
                                        onChange={(e) => setMusicUrl(e.target.value)}
                                        className="input w-full bg-zinc-800 border-zinc-700 focus:border-gold"
                                        placeholder="https://example.com/music.mp3"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">URL to an MP3 file to play in the background.</p>
                                </div>
                                <button type="submit" className="btn btn-primary px-8">Save Changes</button>
                            </form>
                        </div>
                    )}

                    {/* Reward Management Tabs */}
                    {(activeTab === 'rewards' || activeTab === 'box' || activeTab === 'wheel' || activeTab === 'plinko' || activeTab === 'scratch') && (
                        <div>
                            {/* Sub-tabs for Games */}
                            <div className="flex gap-2 mb-6 bg-zinc-800 p-1 rounded-lg inline-flex">
                                {[
                                    { id: 'BOX', label: '📦 Mystery Box' },
                                    { id: 'WHEEL', label: '🎡 Lucky Wheel' },
                                    { id: 'PLINKO', label: '🎱 Plinko' },
                                    { id: 'SCRATCH', label: '🎫 Scratch Card' }
                                ].map((game) => (
                                    <button
                                        key={game.id}
                                        onClick={() => setNewRewardCategory(game.id)}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${newRewardCategory === game.id
                                            ? 'bg-zinc-700 text-white shadow-md'
                                            : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
                                            }`}
                                    >
                                        {game.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Add Form */}
                                <div className="lg:col-span-1">
                                    <div className="bg-zinc-800 p-6 rounded-lg border border-gold/20 sticky top-6">
                                        <h2 className="text-lg font-bold mb-4 text-gold border-b border-zinc-700 pb-2">
                                            Add {newRewardCategory} Reward
                                        </h2>
                                        <form onSubmit={handleCreateReward} className="space-y-4">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Reward Name</label>
                                                <input
                                                    placeholder="e.g. $50 Bonus"
                                                    value={newRewardName}
                                                    onChange={(e) => setNewRewardName(e.target.value)}
                                                    className="input w-full bg-zinc-900 border-zinc-700"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Image URL (Optional)</label>
                                                <input
                                                    placeholder="https://..."
                                                    value={newRewardImage}
                                                    onChange={(e) => setNewRewardImage(e.target.value)}
                                                    className="input w-full bg-zinc-900 border-zinc-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Stock Amount (-1 for Infinite)</label>
                                                <input
                                                    type="number"
                                                    placeholder="1"
                                                    className="input w-full bg-zinc-900 border-zinc-700"
                                                    value={newRewardStock}
                                                    onChange={(e) => setNewRewardStock(parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Price (Credits)</label>
                                                <input
                                                    type="number"
                                                    placeholder="1"
                                                    className="input w-full bg-zinc-900 border-zinc-700"
                                                    value={newRewardPrice}
                                                    onChange={(e) => setNewRewardPrice(parseInt(e.target.value))}
                                                />
                                            </div>

                                            {/* Game Specific Settings Placeholder */}
                                            {newRewardCategory === 'WHEEL' && (
                                                <div className="p-3 bg-zinc-900/50 rounded border border-zinc-700/50">
                                                    <p className="text-xs text-gray-500 mb-2">Wheel Settings (Coming Soon)</p>
                                                    <div className="flex gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-red-500"></div>
                                                        <div className="w-6 h-6 rounded-full bg-black border border-white"></div>
                                                    </div>
                                                </div>
                                            )}

                                            <button type="submit" className="btn btn-primary w-full py-3 mt-2">
                                                Add Reward
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Right Column: List */}
                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {rewards
                                            .filter(r => r.category === newRewardCategory)
                                            .map((reward) => (
                                                <div key={reward.id} className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex justify-between items-center group hover:border-zinc-500 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        {reward.imageUrl ? (
                                                            <img src={reward.imageUrl} alt={reward.name} className="w-10 h-10 object-contain bg-black/50 rounded p-1" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center text-xl">🎁</div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-bold text-white">{reward.name}</h3>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${reward.stock > 0
                                                                    ? 'bg-blue-900/30 text-blue-400 border-blue-900'
                                                                    : reward.stock === -1
                                                                        ? 'bg-purple-900/30 text-purple-400 border-purple-900'
                                                                        : 'bg-red-900/30 text-red-400 border-red-900'
                                                                    }`}>
                                                                    {reward.stock === -1 ? '∞ Infinite' : `Stock: ${reward.stock}`}
                                                                </span>
                                                                <span className="text-[10px] px-2 py-0.5 rounded border bg-yellow-900/30 text-yellow-400 border-yellow-900">
                                                                    Price: {reward.price || 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteReward(reward.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-700 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Reward"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}

                                        {rewards.filter(r => r.category === newRewardCategory).length === 0 && (
                                            <div className="col-span-full py-12 text-center text-gray-500 bg-zinc-800/50 rounded-lg border border-dashed border-zinc-700">
                                                No rewards configured for {newRewardCategory} yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Credit Management Modal */}
            {selectedUserForCredits && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl border border-gold/30 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                            <h2 className="text-xl font-bold text-white">Manage Credits: <span className="text-gold">{selectedUserForCredits.id}</span></h2>
                            <button onClick={() => setSelectedUserForCredits(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Adjustment Form */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Top Up / Deduct</h3>
                                <div className="bg-zinc-800/50 p-4 rounded border border-zinc-700">
                                    <p className="text-sm text-gray-400 mb-2">Current Balance: <span className="text-white font-mono text-lg">{users.find(u => u.id === selectedUserForCredits.id)?.credits}</span></p>
                                    <form onSubmit={handleAdjustCredits} className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Amount (Negative to deduct)</label>
                                            <input
                                                type="number"
                                                value={creditAdjustmentAmount}
                                                onChange={(e) => setCreditAdjustmentAmount(parseInt(e.target.value))}
                                                className="input w-full bg-zinc-900 border-zinc-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Reason</label>
                                            <input
                                                value={creditDescription}
                                                onChange={(e) => setCreditDescription(e.target.value)}
                                                className="input w-full bg-zinc-900 border-zinc-700"
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full">Apply Adjustment</button>
                                    </form>
                                </div>
                            </div>

                            {/* Right: History */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Transaction History</h3>
                                <div className="bg-zinc-800/50 rounded border border-zinc-700 h-[300px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left text-sm">
                                        <thead className="sticky top-0 bg-zinc-800 text-gray-500">
                                            <tr>
                                                <th className="p-2">Amt</th>
                                                <th className="p-2">Type</th>
                                                <th className="p-2">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {creditHistory.map((item) => (
                                                <tr key={item.id} className="border-t border-zinc-700/50 hover:bg-zinc-700/20">
                                                    <td className={`p-2 font-mono ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {item.amount > 0 ? '+' : ''}{item.amount}
                                                    </td>
                                                    <td className="p-2">
                                                        <div className="font-bold text-[10px] text-gray-300">{item.type}</div>
                                                        <div className="text-[10px] text-gray-500 truncate max-w-[100px]" title={item.description}>{item.description}</div>
                                                    </td>
                                                    <td className="p-2 text-gray-500 text-[10px]">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {creditHistory.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-4 text-center text-gray-600">No history found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
