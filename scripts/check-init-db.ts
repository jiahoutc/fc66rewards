async function main() {
    try {
        console.log('Checking https://www.fc66reward.com/api/init-db ...');
        const res = await fetch('https://www.fc66reward.com/api/init-db');
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text.substring(0, 200)); // Show first 200 chars
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
