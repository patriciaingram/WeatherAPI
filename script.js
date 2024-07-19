// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    // Registration form submission
    document.getElementById('registrationForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                const data = await response.json();
                alert(`Registration successful! User ID: ${data.id}`);
            } else {
                const errorMessage = await response.text();
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
