async function main() {
    try {
        const res = await fetch('https://www.fc66reward.com/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        })

        console.log('Status:', res.status)
        const text = await res.text()
        console.log('Body:', text)
    } catch (error) {
        console.error('Fetch Error:', error)
    }
}

main()
