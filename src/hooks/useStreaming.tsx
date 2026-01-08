function useStreaming() {
    const simulateStreamingData = async () => {
        try {
            await fetch('/api/simulate-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Simulated user sent to backend');
        } catch (error) {
            console.error('Failed to send simulation data', error);
        }
    };

    const endSimulation = async () => {
        try {
            await fetch('/api/end-simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Ended simulation');
        } catch (error) {
            console.error('Failed to send simulation data', error);
        }
    }

    return { simulateStreamingData, endSimulation };
}

export default useStreaming
