import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initState, findOptimalMove, applyPlayerMove } from './NimMain.mjs';

const app = express();
const port = 3000;

app.use(cors())
app.use(bodyParser.json());
app.use(express.static('Public'));

app.post('/start', (req, res) => {
    try {
        console.log("Received /start request");
        const state = initState();
        console.log("Sending state:", state.piles);
        res.json({ state: state.piles });
    } catch (error) {
        console.error("Error in /start endpoint:", error); 
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
app.post('/move', (req, res) => {
    
    try {

        const { state: currentPiles, move } = req.body;
        console.log('current piles in ,move',currentPiles);

        // Validate the structure of the request
        if (!Array.isArray(currentPiles) || typeof move !== 'object' || !('pileIndex' in move) || !('stones' in move)) {
            return res.status(400).json({ error: 'Invalid request structure.' });
        }

        // Parse and validate the move
        let { pileIndex, stones } = move;
        pileIndex = parseInt(pileIndex);
        stones = parseInt(stones);

        if (isNaN(pileIndex) || isNaN(stones) || pileIndex < 0 || pileIndex >= currentPiles.length || stones <= 0) {
            return res.status(400).json({ error: 'Invalid move parameters.' });
        }

        // Check if the move is possible given the current state of the pile
        if (stones > currentPiles[pileIndex]) {
            return res.status(400).json({ error: 'Not enough stones in the pile.' });
        }

        // Apply the player's move
        currentPiles[pileIndex] -= stones;

        // Check if the game is over after the player's move
        if (currentPiles.every(pile => pile === 0)) {
            return res.json({ state: currentPiles, message: 'Game over! You have won!' });
        }

        // AI's move
        const depth = 3; // AI difficulty level
        const aiMoveState = findOptimalMove(currentPiles, depth);

        // Check if the game is over after AI's move
        if (aiMoveState.every(pile => pile === 0)) {
            return res.json({ state: aiMoveState, message: 'Game over! AI has won.' });
        } else {
            return res.json({ state: aiMoveState, message: 'AI has made its move.' });
        }
    } catch (error) {
        console.error('Error in /move endpoint:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
    
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
