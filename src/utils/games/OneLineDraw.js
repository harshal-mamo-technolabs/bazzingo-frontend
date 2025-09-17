export const difficultySettings = {
  Easy: {
    timeLimit: 90, // 5 minutes
    maxHints: 5,
    puzzlesCount: 8,
    pointsPerPuzzle: 25,
    description: 'Simple shapes with 4-6 dots',
    color: 'from-green-400 to-emerald-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100'
  },
  Moderate: {
    timeLimit: 120, // 4 minutes
    maxHints: 3,
    puzzlesCount: 5,
    pointsPerPuzzle: 40,
    description: 'Moderate complexity with 6-8 dots',
    color: 'from-yellow-400 to-orange-600',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-100'
  },
  Hard: {
    timeLimit: 150, // 3 minutes
    maxHints: 2,
    puzzlesCount: 4,
    pointsPerPuzzle: 50,
    description: 'Complex patterns with 8-12 dots',
    color: 'from-red-400 to-rose-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-100'
  }
};

// Predefined puzzles for each difficulty - expanded Easy level
export const puzzleLibrary = {
  Easy: [
    // 1) Square (Eulerian circuit)
    {
      dots: [
        { id: 0, x: 100, y: 100 },
        { id: 1, x: 200, y: 100 },
        { id: 2, x: 200, y: 200 },
        { id: 3, x: 100, y: 200 }
      ],
      connections: [[0,1],[1,2],[2,3],[3,0]],
      solution: [0,1,2,3,0]
    },

    // 2) Kite (odd nodes: 1 and 2) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 80 },
        { id: 1, x: 100, y: 150 },
        { id: 2, x: 200, y: 150 },
        { id: 3, x: 150, y: 220 }
      ],
      connections: [[0,1],[0,2],[1,2],[1,3],[2,3]],
      solution: [1,0,2,3,1,2]
    },

    // 3) Hexagon + one diagonal (odd: 0 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 80,  y: 120 },
        { id: 1, x: 150, y: 80  },
        { id: 2, x: 220, y: 120 },
        { id: 3, x: 220, y: 200 },
        { id: 4, x: 150, y: 240 },
        { id: 5, x: 80,  y: 200 }
      ],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3]],
      solution: [0,1,2,3,0,5,4,3]
    },

    // 4) Diamond (square rotated) – Eulerian circuit
    {
      dots: [
        { id: 0, x: 150, y: 80  },
        { id: 1, x: 200, y: 150 },
        { id: 2, x: 150, y: 220 },
        { id: 3, x: 100, y: 150 }
      ],
      connections: [[0,1],[1,2],[2,3],[3,0]],
      solution: [0,1,2,3,0]
    },

    // 5) Triangle with a tail (odd: 1 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 80  }, // top
        { id: 1, x: 100, y: 180 }, // left
        { id: 2, x: 200, y: 180 }, // right
        { id: 3, x: 150, y: 240 }  // tail
      ],
      connections: [[0,1],[1,2],[2,0],[1,3]],
      solution: [3,1,2,0,1]
    },

    // 6) Pentagon ring + spoke (odd: 0 and 2) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 70  },
        { id: 1, x: 210, y: 110 },
        { id: 2, x: 190, y: 190 },
        { id: 3, x: 110, y: 190 },
        { id: 4, x: 90,  y: 110 }
      ],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2]],
      solution: [0,1,2,3,4,0,2]
    },

    // 7) House shape (odd: 2 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 60  }, // roof peak
        { id: 1, x: 100, y: 120 }, // left roof
        { id: 2, x: 200, y: 120 }, // right roof
        { id: 3, x: 100, y: 200 }, // left base
        { id: 4, x: 200, y: 200 }  // right base
      ],
      connections: [[0,1],[0,2],[1,3],[2,4],[3,4],[1,2]],
      solution: [2,0,1,3,4,2,1]
    },

    // 8) Star pattern (odd: 0 and 2) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 80  }, // top
        { id: 1, x: 120, y: 140 }, // left
        { id: 2, x: 180, y: 140 }, // right
        { id: 3, x: 100, y: 200 }, // bottom left
        { id: 4, x: 200, y: 200 }  // bottom right
      ],
      connections: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]],
      solution: [0,1,3,4,2,0]
    }
  ],

  Moderate: [
    // 1) Ladder (3 rungs) – odd: 2 and 3 – Euler path
    {
      dots: [
        { id: 0, x: 100, y: 90  },
        { id: 1, x: 200, y: 90  },
        { id: 2, x: 100, y: 150 },
        { id: 3, x: 200, y: 150 },
        { id: 4, x: 100, y: 210 },
        { id: 5, x: 200, y: 210 }
      ],
      connections: [
        [0,2],[2,4],      // left rail
        [1,3],[3,5],      // right rail
        [0,1],[2,3],[4,5] // rungs
      ],
      solution: [2,0,1,3,5,4,2,3]
    },

    // 2) Hexagon + two spokes (odd: 0 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 120, y: 80  },
        { id: 1, x: 180, y: 80  },
        { id: 2, x: 220, y: 140 },
        { id: 3, x: 180, y: 200 },
        { id: 4, x: 120, y: 200 },
        { id: 5, x: 80,  y: 140 },
        { id: 6, x: 150, y: 140 }
      ],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[3,6]],
      solution: [0,1,2,3,6,0,5,4,3]
    },

    // 3) Ladder + one diagonal (odd: 1 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 100, y: 90  },
        { id: 1, x: 200, y: 90  },
        { id: 2, x: 100, y: 150 },
        { id: 3, x: 200, y: 150 },
        { id: 4, x: 100, y: 210 },
        { id: 5, x: 200, y: 210 }
      ],
      connections: [
        [0,2],[2,4],      // left rail
        [1,3],[3,5],      // right rail
        [0,1],[2,3],[4,5],// rungs
        [1,2]             // extra diagonal rung
      ],
      solution: [1,0,2,1,3,5,4,2,3]
    },

    // 4) Pentagon ring + two spokes to 0 (odd: 2 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 70  },
        { id: 1, x: 210, y: 110 },
        { id: 2, x: 190, y: 190 },
        { id: 3, x: 110, y: 190 },
        { id: 4, x: 90,  y: 110 }
      ],
      connections: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,2],[0,3]],
      solution: [2,0,1,2,3,4,0,3]
    },

    // 5) "Roof" with crossbar (odd: 3 and 4) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 60  }, // roof apex
        { id: 1, x: 100, y: 120 }, // left roof base
        { id: 2, x: 200, y: 120 }, // right roof base
        { id: 3, x: 100, y: 200 }, // left floor
        { id: 4, x: 200, y: 200 }  // right floor
      ],
      // roof edges + walls + floor + one diagonal (1-4)
      connections: [[0,1],[0,2],[1,3],[2,4],[3,4],[1,4]],
      solution: [3,1,0,2,4,3]
    }
  ],

  Hard: [
    // 1) 9-node path (odd: 0 and 8) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 50 },
        { id: 1, x: 100, y: 100 },
        { id: 2, x: 200, y: 100 },
        { id: 3, x: 80,  y: 150 },
        { id: 4, x: 150, y: 150 },
        { id: 5, x: 220, y: 150 },
        { id: 6, x: 100, y: 200 },
        { id: 7, x: 200, y: 200 },
        { id: 8, x: 150, y: 250 }
      ],
      connections: [
        [0,1],[0,2],     // top V
        [1,3],[2,5],     // sides
        [3,4],[4,5],     // middle bar
        [3,6],[4,7],[7,8]// bottom path
      ],
      solution: [0,1,3,4,5,2,0]
    },

    // 2) Octagon ring + two spokes to center (odd: 0 and 4) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 60  },
        { id: 1, x: 200, y: 90  },
        { id: 2, x: 220, y: 140 },
        { id: 3, x: 200, y: 190 },
        { id: 4, x: 150, y: 220 },
        { id: 5, x: 100, y: 190 },
        { id: 6, x: 80,  y: 140 },
        { id: 7, x: 100, y: 90  },
        { id: 8, x: 150, y: 140 }  // center
      ],
      connections: [
        [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0], // ring
        [0,8],[4,8]                                       // spokes
      ],
      solution: [0,1,2,3,4,5,6,7,0,8,4]
    },

    // 3) Cross + ring + one diagonal (odd: 1 and 3) – Euler path
    {
      dots: [
        { id: 0, x: 150, y: 60  }, // top
        { id: 1, x: 220, y: 140 }, // right
        { id: 2, x: 150, y: 220 }, // bottom
        { id: 3, x: 80,  y: 140 }, // left
        { id: 4, x: 150, y: 140 }  // center
      ],
      connections: [
        [0,1],[1,2],[2,3],[3,0],   // ring
        [0,4],[1,4],[2,4],[3,4],   // spokes to center
        [0,2]                       // one diagonal across
      ],
      solution: [1,0,3,2,1,4,0,2,4,3]
    },

    // 4) Ladder + two diagonals (odd: 0 and 5) – Euler path
    {
      dots: [
        { id: 0, x: 100, y: 90  },
        { id: 1, x: 200, y: 90  },
        { id: 2, x: 100, y: 150 },
        { id: 3, x: 200, y: 150 },
        { id: 4, x: 100, y: 210 },
        { id: 5, x: 200, y: 210 }
      ],
      connections: [
        [0,2],[2,4],      // left rail
        [1,3],[3,5],      // right rail
        [0,1],[2,3],[4,5],// rungs
        [0,3],[2,5]       // diagonals
      ],
      solution: [0,1,3,5,4,2,0,3,2,5]
    }
  ]
};

// Utility function to shuffle array
export const shuffleArray = (array) => {
const shuffled = [...array];
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}
return shuffled;
};

export const blobStyles = `
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      @keyframes float {
        0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-100px) scale(0) rotate(360deg); opacity: 0; }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
`;