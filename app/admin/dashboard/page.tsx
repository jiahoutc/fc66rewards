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

    // Form States
    const [newUserId, setNewUserId] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [bgUrl, setBgUrl] = useState('')
    const [musicUrl, setMusicUrl] = useState('')
    const [newRewardName, setNewRewardName] = useState('')
    const [newRewardImage, setNewRewardImage] = useState('')

    useEffect(() => {
        fetchUsers()
        fetchConfig()
        fetchRewards()
    }, [])

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

    const handleCreateReward = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/rewards', {
            method: 'POST',
            body: JSON.stringify({ name: newRewardName, imageUrl: newRewardImage }),
        })
        if (res.ok) {
            setNewRewardName('')
            setNewRewardImage('')
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

    const handleLogout = () => {
        document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/admin/login')
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <nav className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-900">
                <h1 className="text-xl font-bold text-gold" style={{ color: 'var(--primary)' }}>Admin Dashboard</h1>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
            </nav>

            <div className="container mx-auto p-6">
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

                {activeTab === 'users' && (
                    <div>
                        <div className="mb-8 bg-zinc-900 p-6 rounded-lg">
                            <h2 className="text-lg font-bold mb-4">Create New User</h2>
                            <form onSubmit={handleCreateUser} className="flex gap-4">
                                <input
                                    placeholder="Customer ID"
                                    value={newUserId}
                                    onChange={(e) => setNewUserId(e.target.value)}
                                    className="input flex-1"
                                    required
                                />
                                <input
                                    placeholder="Password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    className="input flex-1"
                                    required
                                />
                                <button type="submit" className="btn btn-primary">Create</button>
                            </form>
                        </div>

                        <div className="bg-zinc-900 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-800 text-gray-400">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Reward</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-t border-zinc-800">
                                            <td className="p-4">{user.id}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${user.isClaimed ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                    {user.isClaimed ? 'Claimed' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4">{user.assignedReward || '-'}</td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={() => handleResetUser(user.id)} className="text-sm text-blue-400 hover:underline">Reset</button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-sm text-red-400 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="bg-zinc-900 p-6 rounded-lg max-w-2xl">
                        <h2 className="text-lg font-bold mb-6">Site Configuration</h2>
                        <form onSubmit={handleUpdateConfig} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Background Image URL</label>
                                <input
                                    value={bgUrl}
                                    onChange={(e) => setBgUrl(e.target.value)}
                                    className="input"
                                    placeholder="https://example.com/bg.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Background Music URL</label>
                                <input
                                    value={musicUrl}
                                    onChange={(e) => setMusicUrl(e.target.value)}
                                    className="input"
                                    placeholder="https://example.com/music.mp3"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                        </form>
                    </div>
                )}

                {activeTab === 'rewards' && (
                    <div>
                        <div className="mb-8 bg-zinc-900 p-6 rounded-lg">
                            <h2 className="text-lg font-bold mb-4">Add New Reward</h2>
                            <form onSubmit={handleCreateReward} className="flex gap-4">
                                <input
                                    placeholder="Reward Name"
                                    value={newRewardName}
                                    onChange={(e) => setNewRewardName(e.target.value)}
                                    className="input flex-1"
                                    required
                                />
                                <input
                                    placeholder="Image URL (Optional)"
                                    value={newRewardImage}
                                    onChange={(e) => setNewRewardImage(e.target.value)}
                                    className="input flex-1"
                                />
                                <button type="submit" className="btn btn-primary">Add</button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {rewards.map((reward) => (
                                <div key={reward.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{reward.name}</h3>
                                        {reward.imageUrl && <p className="text-xs text-gray-500 truncate max-w-[200px]">{reward.imageUrl}</p>}
                                    </div>
                                    <button onClick={() => handleDeleteReward(reward.id)} className="text-red-400 hover:text-red-300">
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
