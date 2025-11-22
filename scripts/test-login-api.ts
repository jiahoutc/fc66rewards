async function main() {
    const response = await fetch('http://localhost:3001/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'jiahouting', password: '123456' }),
    })

    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', data)
}

main()
