import {
  ShadowMatchGame,
  NumberFlipGame,
  SequenceRecallGame,
  TapChallengeGame,
  MazeLogicGame,
  ShapeRotationGame,
  PatternMatchGame,
  ColorRushGame,
  LogicPuzzleGame,
  LogicPatternSequenceGame,
  BlockStackingGame,
  SequenceMathGame,
  TileSwitchGame,
  GridNavigationGame,
  ObjectFitGame,
  ObjectFitGame2,
  SoundMemoryGame,
  WhackABoxGame,
  MirrorMatchGame,
  PathFinderGame,
  TowerOfHanoiGame,
  DividedAttentionGame,
  DistanceEstimationGame,
  SpeedEstimationGame,
  LexicalMemoryGame,
  MultimodalMemoryGame,
  ConcentrationGame,
  VisualMemorySpanGame,
  StroopTestGame,
  WhoIsBrainGame,
  NBackGame,
  MentalRotation3DGame,
  CognitiveLoadBalancerGame,
  NeuralNetworkBuilderGame,
  TemporalReasoningArchitectGame,
  CognitivePatternWeaverGame,
  CognitiveFlexibilityArchitectGame,
  MetacognitiveStrategyNavigatorGame,
  MathExpressionBuilderGame,
  NumberPatternMasterGame,
  MathDeductionGame,
  WordChainLogicGame,
  CodeBreakingCipherGame,
  ResourceAllocationStrategyGame,
  ProbabilityPredictionGame,
  LogicGridSolverGame,
  TicTacToeGame
} from '../pages';

export const gameRoutes = [
  {
    path: "/games/shadow-match-game",
    element: <ShadowMatchGame />,
    name: "Shadow Match Game"
  },
  {
    path: "/games/number-flip-game",
    element: <NumberFlipGame />,
    name: "Number Flip Game"
  },
  {
    path: "/games/sequence-recall-game",
    element: <SequenceRecallGame />,
    name: "Sequence Recall Game"
  },
  {
    path: "/games/tap-challenge-game",
    element: <TapChallengeGame />,
    name: "Tap Challenge Game"
  },
  {
    path: "/games/maze-logic-game",
    element: <MazeLogicGame />,
    name: "Maze Logic Game"
  },
  {
    path: "/games/shape-rotation-game",
    element: <ShapeRotationGame />,
    name: "Shape Rotation Game"
  },
  {
    path: "/games/pattern-match-game",
    element: <PatternMatchGame />,
    name: "Pattern Match Game"
  },
  {
    path: "/games/color-rush-game",
    element: <ColorRushGame />,
    name: "Color Rush Game"
  },
  {
    path: "/games/logic-puzzle-game",
    element: <LogicPuzzleGame />,
    name: "Logic Puzzle Game"
  },
  {
    path: "/games/logic-pattern-sequence-game",
    element: <LogicPatternSequenceGame />,
    name: "Logic Pattern Sequence Game"
  },
  {
    path: "/games/block-stacking-game",
    element: <BlockStackingGame />,
    name: "Block Stacking Game"
  },
  {
    path: "/games/sequence-math-game",
    element: <SequenceMathGame />,
    name: "Sequence Math Game"
  },
  {
    path: "/games/tile-switch-game",
    element: <TileSwitchGame />,
    name: "Tile Switch Game"
  },
  {
    path: "/games/grid-navigation-game",
    element: <GridNavigationGame />,
    name: "Grid Navigation Game"
  },
  {
    path: "/games/object-fit-game",
    element: <ObjectFitGame />,
    name: "Object Fit Game"
  },
  {
    path: "/games/object-fit-game-2",
    element: <ObjectFitGame2 />,
    name: "Object Fit Game 2"
  },
  {
    path: "/games/sound-memory-game",
    element: <SoundMemoryGame />,
    name: "Sound Memory Game"
  },
  {
    path: "/games/whack-a-box-game",
    element: <WhackABoxGame />,
    name: "Whack A Box Game"
  },
  {
    path: "/games/mirror-match-game",
    element: <MirrorMatchGame />,
    name: "Mirror Match Game"
  },
  {
    path: "/games/path-finder-game",
    element: <PathFinderGame />,
    name: "Path Finder Game"
  },
  {
    path: "/games/tower-of-hanoi-game",
    element: <TowerOfHanoiGame />,
    name: "Tower of Hanoi Game"
  },
  {
    path: "/games/divided-attention-game",
    element: <DividedAttentionGame />,
    name: "Divided Attention Game"
  },
  {
    path: "/games/distance-estimation-game",
    element: <DistanceEstimationGame />,
    name: "Distance Estimation Game"
  },
  {
    path: "/games/speed-estimation-game",
    element: <SpeedEstimationGame />,
    name: "Speed Estimation Game"
  },
  {
    path: "/games/lexical-memory-game",
    element: <LexicalMemoryGame />,
    name: "Lexical Memory Game"
  },
  {
    path: "/games/multimodal-memory-game",
    element: <MultimodalMemoryGame />,
    name: "Multimodal Memory Game"
  },
  {
    path: "/games/concentration-game",
    element: <ConcentrationGame />,
    name: "Concentration Game"
  },
  {
    path: "/games/visual-memory-span-game",
    element: <VisualMemorySpanGame />,
    name: "Visual Memory Span Game"
  },
  {
    path: "/games/stroop-test-game",
    element: <StroopTestGame />,
    name: "Stroop Test Game"
  },
  {
    path: "/games/who-is-brain-game",
    element: <WhoIsBrainGame />,
    name: "Who Is Brain Game"
  },
  {
    path: "/games/n-back-game",
    element: <NBackGame />,
    name: "N-Back Game"
  },
  {
    path: "/games/mental-rotation-3d-game",
    element: <MentalRotation3DGame />,
    name: "Mental Rotation 3D Game"
  },
  {
    path: "/games/cognitive-load-balancer-game",
    element: <CognitiveLoadBalancerGame />,
    name: "Cognitive Load Balancer Game"
  },
  {
    path: "/games/neural-network-builder-game",
    element: <NeuralNetworkBuilderGame />,
    name: "Neural Network Builder Game"
  },
  {
    path: "/games/temporal-reasoning-architect-game",
    element: <TemporalReasoningArchitectGame />,
    name: "Temporal Reasoning Architect Game"
  },
  {
    path: "/games/cognitive-pattern-weaver-game",
    element: <CognitivePatternWeaverGame />,
    name: "Cognitive Pattern Weaver Game"
  },
  {
    path: "/games/cognitive-flexibility-architect-game",
    element: <CognitiveFlexibilityArchitectGame />,
    name: "Cognitive Flexibility Architect Game"
  },
  {
    path: "/games/metacognitive-strategy-navigator-game",
    element: <MetacognitiveStrategyNavigatorGame />,
    name: "Metacognitive Strategy Navigator Game"
  },
  {
    path: "/games/math-expression-builder-game",
    element: <MathExpressionBuilderGame />,
    name: "Math Expression Builder Game"
  },
  {
    path: "/games/math-deduction-game",
    element: <MathDeductionGame />,
    name: "Math Deduction Game"
  },
  {
    path: "/games/word-chain-logic-game",
    element: <WordChainLogicGame />,
    name: "Word Chain Logic Game"
  },
  {
    path: "/games/code-breaking-cipher-game",
    element: <CodeBreakingCipherGame />,
    name: "Code Breaking Cipher Game"
  },
  {
    path: "/games/resource-allocation-strategy-game",
    element: <ResourceAllocationStrategyGame />,
    name: "Resource Allocation Strategy Game"
  },
  {
    path: "/games/probability-prediction-game",
    element: <ProbabilityPredictionGame />,
    name: "Probability Prediction Game"
  },
  {
    path: "/games/logic-grid-solver-game",
    element: <LogicGridSolverGame />,
    name: "Logic Grid Solver Game"
  },
  {
    path: "/games/number-pattern-master-game",
    element: <NumberPatternMasterGame />,
    name: "Number Pattern Master Game"
  },
  {
    path: "/games/tic-tac-toe-game",
    element: <TicTacToeGame />,
    name: "Tic Tac Toe Game"
  }
];