import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'microbes.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// Serve static files from the React app build folder
const __distPath = path.join(__dirname, 'dist');
app.use(express.static(__distPath));

// Helper to read data
async function readData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper to write data
async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all microbes (for search)
app.get('/api/microbes', async (req, res) => {
    const microbes = await readData();
    res.json(microbes);
});

// GET today's microbe
app.get('/api/today', async (req, res) => {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const microbes = await readData();
    const microbe = microbes.find(m => m.date === date);
    if (microbe) {
        res.json(microbe);
    } else {
        // Fallback to the most recent if today's isn't found
        res.json(microbes[microbes.length - 1] || null);
    }
});

// POST new microbe
app.post('/api/microbes', async (req, res) => {
    try {
        const newMicrobe = {
            id: Date.now().toString(),
            ...req.body
        };
        const microbes = await readData();
        
        // Check if entry for this date already exists and update it, otherwise add new
        const existingIndex = microbes.findIndex(m => m.date === newMicrobe.date);
        if (existingIndex > -1) {
            // Preserve existing likes if updating
            newMicrobe.likes = microbes[existingIndex].likes || 0;
            microbes[existingIndex] = newMicrobe;
        } else {
            newMicrobe.likes = 0; // Initialize new microbe with 0 likes
            microbes.push(newMicrobe);
            // Sort by date descending
            microbes.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        await writeData(microbes);
        res.status(201).json(newMicrobe);
    } catch (error) {
        console.error('Error saving microbe:', error);
        res.status(500).json({ message: 'Error saving to backend', error: error.message });
    }
});

// DELETE a microbe
app.delete('/api/delete', async (req, res) => {
    const { id } = req.query;
    const microbes = await readData();
    const filteredMicrobes = microbes.filter(m => String(m.id) !== String(id));
    
    if (microbes.length === filteredMicrobes.length) {
        return res.status(404).json({ message: 'Microbe not found' });
    }

    await writeData(filteredMicrobes);
    res.json({ message: 'Microbe deleted successfully' });
});

// LIKE a microbe
app.post('/api/like', async (req, res) => {
    const { id } = req.query;
    const microbes = await readData();
    const microbe = microbes.find(m => String(m.id) === String(id));
    
    if (!microbe) {
        return res.status(404).json({ message: 'Microbe not found' });
    }

    microbe.likes = (microbe.likes || 0) + 1;
    await writeData(microbes);
    res.json(microbe);
});

// Catch-all to serve React's index.html for any non-API routes
app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
