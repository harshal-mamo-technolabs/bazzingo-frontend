//import { element } from 'prop-types';
import {
  NumberFlipGame,
  SequenceRecallGame,
  TapChallengeGame,
  MirrorMatchGame,
  WhoIsBrainGame,
  CognitiveLoadBalancerGame,
  MetacognitiveStrategyNavigatorGame,
  MathDeductionGame,
  WordChainLogicGame,
  CodeBreakingCipherGame,
  ResourceAllocationStrategyGame,
  ProbabilityPredictionGame,
  LogicGridSolverGame,
  WordSearchMaster,
  TicTacToeGame,
  TwentyFortyEightGame,
  SudokuMasterGame,
  TapMinesweeperGame,
  AnagramSolverGame,
  CardSortingFlexibility,
  FaceNameMemoryGame,
  CandyCrushGame,
  StopSignalGame,
  SyllogismGame,
  MatrixReasoningGame,
  KenKenMathPuzzleGame,
  OneLineDrawGame,
  NonogramPicrossGame,
  DataStreamSecurityGame,
  EmotionDecoderGame,
  EscapeGridGame,
  MathMindGame,
  MemoryTownBuilderGame,
  AdriaticCodebreaker,
  MarketRushGame,
  BorderlineBrainsGame,
  RiverCrossingGame,
  CastleDefenderGame,
  MaskMemoryGame,
  FishermansCatchGame,
  ZipGame,
  ColorMatchGame,
  TowerOfHanoi
  //ShadowMatchGame,
  //MazeLogicGame,
  //ShapeRotationGame,
  //PatternMatchGame,
  //ColorRushGame,
  //LogicPuzzleGame,
  //LogicPatternSequenceGame,
  //BlockStackingGame,
  //SequenceMathGame,
  //TileSwitchGame,
  //GridNavigationGame,
  //ObjectFitGame,
  //ObjectFitGame2,
  //SoundMemoryGame,
  //WhackABoxGame,
  //KakuroLogicGame,
  //MastermindDeductionGame,
  //SetCardMatchGame,
  //StrategicOrbCommanderGame,
  //EchoChamberGame,
  //LocksmithLogicGame,
  //AnalogReasoningGame,
  //NBackGame,
  //MentalRotation3DGame,
  //NeuralNetworkBuilderGame,
  //TemporalReasoningArchitectGame,
  //CognitivePatternWeaverGame,
  //CognitiveFlexibilityArchitectGame,
  //MathExpressionBuilderGame,
  //NumberPatternMasterGame,
  //PathFinderGame,
  //TowerOfHanoiGame,
  //DividedAttentionGame,
  //DistanceEstimationGame,
  //SpeedEstimationGame,
  //LexicalMemoryGame,
  //MultimodalMemoryGame,
  //ConcentrationGame,
  //VisualMemorySpanGame,
  //StroopTestGame,
} from '../pages';

export const gameRoutes = [
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
    path: "/games/mirror-match-game",
    element: <MirrorMatchGame />,
    name: "Mirror Match Game"
  },
  {
    path: "/games/who-is-brain-game",
    element: <WhoIsBrainGame />,
    name: "Who Is Brain Game"
  },
  {
    path: "/games/cognitive-load-balancer-game",
    element: <CognitiveLoadBalancerGame />,
    name: "Cognitive Load Balancer Game"
  },
  {
    path: "/games/metacognitive-strategy-navigator-game",
    element: <MetacognitiveStrategyNavigatorGame />,
    name: "Metacognitive Strategy Navigator Game"
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
    path: "/games/word-search-master-game",
    element: <WordSearchMaster />,
    name: "Word Search Master Game"
  },
  {
    path: "/games/tic-tac-toe-game",
    element: <TicTacToeGame />,
    name: "Tic Tac Toe Game"
  },
  {
    path: "/games/2048-game",
    element: <TwentyFortyEightGame />,
    name: "2048 game"
  },
  {
    path: "/games/sudoku-master-game",
    element: <SudokuMasterGame />,
    name: "Sudoku master game"
  },
  {
    path: "/games/tap-challenge-game",
    element: <TapChallengeGame />,
    name: "Tap challange game"
  },
  {
    path: "/games/mine-sweeper-game",
    element: <TapMinesweeperGame />,
    name: "Mine sweeper game"
  },
  {
    path: "/games/anagram-solver-game",
    element: <AnagramSolverGame />,
    name: "anagram solver game"
  },
  {
    path: "/games/card-sorting-fleibility-game",
    element: <CardSortingFlexibility />,
    name: "Card sorting flexibility game"
  },
  {
    path: "/games/face-name-memory-game",
    element: <FaceNameMemoryGame />,
    name: "Face name memory game"
  },
  {
    path: "/games/candy-crush-game",
    element: <CandyCrushGame />,
    name: "Candy Crush Game"
  },
  {
    path: "/games/stop-signal-game",
    element: <StopSignalGame />,
    name: "Stop Signal Game"
  },
  {
    path: "/games/syllogism-game",
    element: <SyllogismGame />,
    name: "Syllogism Game"
  },
  {
    path: "/games/matrix-reasoning-game",
    element: <MatrixReasoningGame />,
    name: "Matrix Reasoning Game"
  },
  {
    path: "/games/ken-ken-math-puzzle-game",
    element: <KenKenMathPuzzleGame />,
    name: "Ken Math Puzzle Game"
  },
  {
    path: "/games/one-line-draw-game",
    element: <OneLineDrawGame />,
    name: "One Line Draw Game"
  },
  {
    path: "/games/nonogram-picross-game",
    element: <NonogramPicrossGame />,
    name: "Nonogram Picross Game"
  },
  {
    path: "/games/data-stream-security-game",
    element: <DataStreamSecurityGame/>,
    name: "Data Security Game"
  },
  {
    path: "/games/emotion-decoder-game",
    element: <EmotionDecoderGame/>,
    name: "Emotion Decoder Game"
  },
  {
    path: "/games/escape-grid-game",
    element: <EscapeGridGame/>,
    name: "Escape Grid Name"
  },
  {
    path: "/games/math-mind-game",
    element: <MathMindGame/>,
    name: "Math Mind Game"
  },
  {
    path: "/games/memory-town-builder-game",
    element: <MemoryTownBuilderGame/>,
    name: "Memory Town Builder Game"
  },
  {
    path: "/games/Adriatic-codebreaker-game",
    element: <AdriaticCodebreaker/>,
    name: "Adriatic Codebreaker Game"
  },
  {
    path: "/games/market-rush-game",
    element: <MarketRushGame/>,
    name: "Market Rush Game"
  },
  {
    path: "/games/borderline-brains-game",
    element: <BorderlineBrainsGame/>,
    name: "Border line Brains Game"
  },
  {
    path: "/games/river-crossing-game",
    element: <RiverCrossingGame/>,
    name: "River Crossing Game"
  },
  {
    path: "/games/castle-defender-game",
    element: <CastleDefenderGame/>,
    name: "Castle Defender Game"
  },
  {
    path: "/games/mask-memory-game",
    element: <MaskMemoryGame/>,
    name: "Mask Memory Game"
  },
  {
    path: "/games/fishermans-catch-game",
    element: <FishermansCatchGame/>,
    name: "Fishermans Catch Game"
  },
  {
    path: "/games/color-match-game",
    element: <ColorMatchGame />,
    name: "Color Match Game"
  },
  {
    path: "/games/tower-of-hanoi-game",
    element: <TowerOfHanoi />,
    name: "Tower of Hanoi"
  },
  {
    path: "/games/zip-game",
    element: <ZipGame />,
    name: "ZIP"
  }
];
