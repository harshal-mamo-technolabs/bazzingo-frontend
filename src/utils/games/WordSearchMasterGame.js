    // Word lists by category
export const wordLists = {
        Easy: [
            'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BIRD', 'FISH',
            'BOOK', 'PLAY', 'JUMP', 'RUN', 'FAST', 'SLOW', 'BIG', 'SMALL'
        ],
        Medium: [
            'HOUSE', 'MUSIC', 'HAPPY', 'LIGHT', 'OCEAN', 'MOUNTAIN', 'FLOWER', 'ANIMAL',
            'SCHOOL', 'FRIEND', 'FAMILY', 'NATURE', 'BEAUTY', 'SIMPLE', 'BRIGHT', 'STRONG'
        ],
        Hard: [
            'KNOWLEDGE', 'ADVENTURE', 'CREATIVE', 'PEACEFUL', 'JOURNEY', 'WISDOM', 'HARMONY', 'FREEDOM',
            'CHALLENGE', 'DISCOVER', 'INSPIRATION', 'EXCELLENCE', 'BEAUTIFUL', 'WONDERFUL', 'AMAZING', 'FANTASTIC'
        ]
    };

    // Difficulty settings
export const difficultySettings = {
        Easy: { gridSize: 10, wordCount: 6, timeLimit: 180, hints: 3 },
        Medium: { gridSize: 12, wordCount: 8, timeLimit: 240, hints: 2 },
        Hard: { gridSize: 15, wordCount: 10, timeLimit: 300, hints: 1 }
    };

    // Generate random letter
export const getRandomLetter = () => {
        return String.fromCharCode(65 + Math.floor(Math.random() * 26));
    };

    // Create empty grid
export const createEmptyGrid = (size) => {
        return Array(size).fill(null).map(() => Array(size).fill(''));
    };

    // Check if word can be placed at position in direction
export const canPlaceWord = (grid, word, row, col, direction) => {
        const size = grid.length;
        const directions = {
            horizontal: [0, 1],
            vertical: [1, 0],
            diagonal: [1, 1],
            diagonalUp: [-1, 1]
        };

        const [deltaRow, deltaCol] = directions[direction];

        for (let i = 0; i < word.length; i++) {
            const newRow = row + deltaRow * i;
            const newCol = col + deltaCol * i;

            if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
                return false;
            }

            if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
                return false;
            }
        }

        return true;
    };

    // Place word in grid
export const placeWord = (grid, word, row, col, direction) => {
        const directions = {
            horizontal: [0, 1],
            vertical: [1, 0],
            diagonal: [1, 1],
            diagonalUp: [-1, 1]
        };

        const [deltaRow, deltaCol] = directions[direction];
        const positions = [];

        for (let i = 0; i < word.length; i++) {
            const newRow = row + deltaRow * i;
            const newCol = col + deltaCol * i;
            grid[newRow][newCol] = word[i];
            positions.push({ row: newRow, col: newCol });
        }

        return positions;
    };

export     // Get cells in a line between two points
    const getLineCells = (startRow, startCol, endRow, endCol) => {
        const cells = [];
        const deltaRow = endRow - startRow;
        const deltaCol = endCol - startCol;

        // Check if it's a valid line (horizontal, vertical, or diagonal)
        if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
            const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
            const stepRow = steps === 0 ? 0 : deltaRow / steps;
            const stepCol = steps === 0 ? 0 : deltaCol / steps;

            for (let i = 0; i <= steps; i++) {
                cells.push({
                    row: startRow + Math.round(stepRow * i),
                    col: startCol + Math.round(stepCol * i)
                });
            }
        }

        return cells;
    };