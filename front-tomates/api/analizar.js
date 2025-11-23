export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Forward raw body to AWS backend
        const response = await fetch('http://18.188.93.127:5000/analizar', {
            method: 'POST',
            headers: {
                'Content-Type': req.headers['content-type'],
            },
            body: req,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
