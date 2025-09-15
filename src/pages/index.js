import Signup from './Signup';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import UpdatePassword from './UpdatePassword';
import ClientTicket from './ClientTicket';
import HelpFAQs from './HelpFAQs';
import NotificationPreferences from './NotificationPreferences';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';
import Assessments from './Assessments';
import Games from './Games';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Statistics from './Statistics';
import Leadboard from './Leadboard';
import NotFound from './NotFound';
import VisualReasoningStaticAssessment from "../components/assessments/VisualReasoningStaticAssessment.jsx";
import AssessmentPaymentDemo from './AssessmentPaymentDemo';
import AssessmentElementsDemo from './AssessmentElementsDemo';
import SubscriptionTest from './SubscriptionTest';
import PlanCheckoutDemo from './PlanCheckoutDemo';
import PlanSubscribeElementsDemo from './PlanSubscribeElementsDemo';
import PlanSubscribePaymentElementDemo from './PlanSubscribePaymentElementDemo';
import PaymentSuccess from './PaymentSuccess';
import PaymentCancel from './PaymentCancel';
import Plan from './Plan';
import Subscription from './Subscription';
import Notifications from './Notifications';
import Report from './Report';
import Certificate from './Certificate';
import Download from './Download';

// Working games import
import MetacognitiveStrategyNavigatorGame from './games/MetacognitiveStrategyNavigatorGame';
import CognitiveLoadBalancerGame from './games/CognitiveLoadBalancerGame';
import WhoIsBrainGame from './games/WhoIsBrainGame';
import MirrorMatchGame from './games/MirrorMatchGame';
import NumberFlipGame from './games/NumberFlipGame';
import SequenceRecallGame from './games/SequenceRecallGame';
import MathDeductionGame from './games/MathDeductionGame';
import WordChainLogicGame from './games/WordChainLogicGame';
import CodeBreakingCipherGame from './games/CodeBreakingCipherGame';
import ResourceAllocationStrategyGame from './games/ResourceAllocationStrategyGame';
import ProbabilityPredictionGame from './games/ProbabilityPredictionGame';
import LogicGridSolverGame from './games/LogicGridSolverGame';
import WordSearchMaster from './games/WordSearchMasterGame';
import TicTacToeGame from './games/TicTacToeGame';
import TwentyFortyEightGame from './games/TwentyFortyEightGame';
import SudokuMasterGame from './games/SudokuMasterGame';
import TapChallengeGame from './games/TapChallengeGame';
import TapMinesweeperGame from './games/MineSweeperGame';
import AnagramSolverGame from './games/AnagramSolverGame';
import CardSortingFlexibility from './games/CardSortingFlexibility';
import FaceNameMemoryGame from './games/FaceNameMemoryGame';
import CandyCrushGame from './games/CandyCrushGame';
import StopSignalGame from './games/StopSignalGame';
import SyllogismGame from './games/SyllogismGame';
import MatrixReasoningGame from './games/MatrixReasoningGame';
import KenKenMathPuzzleGame from './games/KenKenMathPuzzleGame';
import OneLineDrawGame from './games/OneLineDraw';
import NonogramPicrossGame from './games/NonogramPicrossGame';
import DataStreamSecurityGame from './games/DataStreamSecurityGame';
import EmotionDecoderGame from './games/EmotionDecoderGame';
import EscapeGridGame from './UnusedGames/EcsapeGridGame';
import MathMindGame from './games/MathMindGame';
import MemoryTownBuilderGame from './games/MemoryTownBuilderGame';
import AIAlignmentLabGame from './games/AIAlignmentGame';
import AdriaticCodebreaker from './games/AdriaticCodebreaker';
import MarketRushGame from './games/MarketRushGame';
import BorderlineBrainsGame from './games/BorderlineBrainsGame';
import RiverCrossingGame from './games/RiverCrossingGame.jsx';
import CastleDefenderGame from './games/CastleDefenderGame.jsx';
import MaskMemoryGame from './games/MaskMemoryGame.jsx';
import FishermansCatchGame from './games/FishermansCatchGame.jsx';
 
/*
// Unused Game imports
import AnalogReasoningGame from './UnusedGames/AnalogReasoningGame';
import ShadowMatchGame from './UnusedGames/ShadowMatchGame';
import MazeLogicGame from './UnusedGames/MazeLogicGame';
import ShapeRotationGame from './UnusedGames/ShapeRotationGame';
import PatternMatchGame from './UnusedGames/PatternMatchGame';
import ColorRushGame from './UnusedGames/ColorRushGame';
import LogicPuzzleGame from './UnusedGames/LogicPuzzleGame';
import LogicPatternSequenceGame from './UnusedGames/LogicPatternSequenceGame';
import BlockStackingGame from './UnusedGames/BlockStackingGame';
import SequenceMathGame from './UnusedGames/SequenceMathGame';
import TileSwitchGame from './UnusedGames/TileSwitchGame';
import GridNavigationGame from './UnusedGames/GridNavigationGame';
import ObjectFitGame from './UnusedGames/ObjectFitGame';
import ObjectFitGame2 from './UnusedGames/ObjectFitGame2';
import SoundMemoryGame from './UnusedGames/SoundMemoryGame';
import WhackABoxGame from './UnusedGames/WhackABoxGame';
import PathFinderGame from './UnusedGames/PathFinderGame';
import TowerOfHanoiGame from './UnusedGames/TowerOfHanoiGame';
import DividedAttentionGame from './UnusedGames/DividedAttentionGame';
import DistanceEstimationGame from './UnusedGames/DistanceEstimationGame';
import SpeedEstimationGame from './UnusedGames/SpeedEstimationGame';
import LexicalMemoryGame from './UnusedGames/LexicalMemoryGame';
import MultimodalMemoryGame from './UnusedGames/MultimodalMemoryGame';
import ConcentrationGame from './UnusedGames/ConcentrationGame';
import VisualMemorySpanGame from './UnusedGames/VisualMemorySpanGame';
import StroopTestGame from './UnusedGames/StroopTestGame';
import NBackGame from './UnusedGames/NBackGame';
import MentalRotation3DGame from './UnusedGames/MentalRotation3DGame';
import NeuralNetworkBuilderGame from './UnusedGames/NeuralNetworkBuilderGame';
import TemporalReasoningArchitectGame from './UnusedGames/TemporalReasoningArchitectGame';
import CognitivePatternWeaverGame from './UnusedGames/CognitivePatternWeaverGame';
import CognitiveFlexibilityArchitectGame from './UnusedGames/CognitiveFlexibilityArchitectGame';
import MathExpressionBuilderGame from './UnusedGames/MathExpressionBuilderGame';
import NumberPatternMasterGame from './UnusedGames/NumberPatternMasterGame';
import KakuroLogicGame from './UnusedGames/KakuroLogicGame';
import MastermindDeductionGame from './UnusedGames/MastermindDeductionGame';
import SetCardMatchGame from './UnusedGames/SetCardMatchGame';
import StrategicOrbCommanderGame from './UnusedGames/StrategicOrbCommanderGame';
import EchoChamberGame from './UnusedGames/EchoChamberGame';
import LocksmithLogicGame from './UnusedGames/LockSmithLogicGame';
*/
 
// Export all pages including games
export {
  // Non-game pages
  Signup,
  Login,
  ForgotPassword,
  ResetPassword,
  UpdatePassword,
  ClientTicket,
  HelpFAQs,
  NotificationPreferences,
  PrivacyPolicy,
  TermsOfUse,
  Assessments,
  Dashboard,
  Games,
  Profile,
  Statistics,
  Leadboard,
  NotFound,
  VisualReasoningStaticAssessment,
  AssessmentPaymentDemo,
  AssessmentElementsDemo,
  PlanCheckoutDemo,
  SubscriptionTest,
  PlanSubscribeElementsDemo,
  PlanSubscribePaymentElementDemo,
  PaymentSuccess,
  PaymentCancel,
  Plan,
  Subscription,
  Notifications,
  Report,
  Certificate,
  Download,
 
  // ✅ Working game pages
  MetacognitiveStrategyNavigatorGame,
  CognitiveLoadBalancerGame,
  WhoIsBrainGame,
  MirrorMatchGame,
  NumberFlipGame,
  SequenceRecallGame,
  MathDeductionGame,
  WordChainLogicGame,
  CodeBreakingCipherGame,
  ResourceAllocationStrategyGame,
  ProbabilityPredictionGame,
  LogicGridSolverGame,
  WordSearchMaster, // <- this still has inconsistent name, fix if needed
  TicTacToeGame,
  TwentyFortyEightGame,
  SudokuMasterGame,
  TapChallengeGame,
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
  AIAlignmentLabGame,
  AdriaticCodebreaker,
  MarketRushGame,
  BorderlineBrainsGame,
  RiverCrossingGame,
  CastleDefenderGame,
  MaskMemoryGame,
  FishermansCatchGame
 
/*
  // 🚫 Unused game pages
  AnalogReasoningGame,
  ShadowMatchGame,
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
  NBackGame,
  MentalRotation3DGame,
  NeuralNetworkBuilderGame,
  TemporalReasoningArchitectGame,
  CognitivePatternWeaverGame,
  CognitiveFlexibilityArchitectGame,
  MathExpressionBuilderGame,
  NumberPatternMasterGame,
  KakuroLogicGame,
  MastermindDeductionGame,
  SetCardMatchGame,
  StrategicOrbCommanderGame,
  EchoChamberGame,
  LocksmithLogicGame,
  EscapeGridGame
*/
};