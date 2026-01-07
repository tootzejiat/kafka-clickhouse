import { faker } from '@faker-js/faker';

function useStreaming() {
    const simulateStreamingData = async () => {
        const userData = {
            username: faker.internet.username(),
            email: faker.internet.email(),
            status: faker.helpers.arrayElement(['active', 'inactive', 'banned']),
            country_code: faker.location.countryCode(),
            signup_date: new Date().toISOString().split('T')[0]
        };

        try {
            await fetch('/api/simulate-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            console.log('Simulated user sent to backend');
        } catch (error) {
            console.error('Failed to send simulation data', error);
        }
    };

    return { simulateStreamingData };
}

export default useStreaming
