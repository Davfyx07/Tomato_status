import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const formData = new FormData();

        // Forward the request to AWS backend
        const response = await axios.post('http://18.188.93.127:5000/analizar', req.body, {
            headers: {
                'Content-Type': req.headers['content-type'],
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
