# Cognitive Load Balancer Game

## Overview
The **Cognitive Load Balancer** is an innovative mind game that tests executive function, working memory, and cognitive flexibility by requiring players to handle multiple cognitive tasks simultaneously.

## Game Features

### 🧠 **Core Concept**
- **Multitasking Challenge**: Handle 1-3 cognitive tasks simultaneously based on difficulty
- **Executive Function**: Tests ability to switch between different cognitive domains
- **Working Memory**: Requires maintaining multiple pieces of information
- **Time Pressure**: Each task has individual time limits creating urgency

### 🎯 **Task Types**

#### 1. **Math Tasks** 🔢
- **Objective**: Solve arithmetic problems (addition, subtraction, multiplication)
- **Difficulty Scaling**: Numbers increase with level progression
- **Cognitive Load**: Numerical processing and calculation

#### 2. **Color Match Tasks** 🎨
- **Objective**: Identify the COLOR of text (ignore the word itself)
- **Challenge**: Text color often differs from the word meaning (Stroop effect)
- **Cognitive Load**: Attention control and interference resolution

#### 3. **Pattern Tasks** 🔄
- **Objective**: Complete number sequences with missing elements
- **Challenge**: Identify patterns in sequences like "1 → 2 → ? → 4"
- **Cognitive Load**: Pattern recognition and logical reasoning

#### 4. **Memory Tasks** 🧠
- **Objective**: Memorize and recall digit sequences
- **Challenge**: Sequences are shown briefly, then must be typed from memory
- **Cognitive Load**: Working memory and recall

### 📊 **Difficulty Levels**

#### **Easy Mode**
- **Active Tasks**: 1 task at a time
- **Time Limit**: 12 seconds per task
- **Duration**: 2 minutes total

#### **Moderate Mode**
- **Active Tasks**: 2 tasks simultaneously
- **Time Limit**: 10 seconds per task
- **Duration**: 1.5 minutes total

#### **Hard Mode**
- **Active Tasks**: 3 tasks simultaneously
- **Time Limit**: 8 seconds per task
- **Duration**: 1 minute total

### 🏆 **Scoring System**
- **Base Points**: 10 points per correct answer
- **Time Bonus**: Extra points for quick responses
- **Level Bonus**: Additional points based on current level
- **Streak Multiplier**: Consecutive correct answers increase score

### 📈 **Progression**
- **Level Up**: Every 10 completed tasks
- **Increased Complexity**: Higher levels have more complex problems
- **Dynamic Difficulty**: Task complexity adapts to player performance

### 🎮 **UI/UX Features**
- **Professional Design**: Matches existing game aesthetic with Roboto fonts
- **Gradient Task Cards**: Each task type has unique color gradients
- **Progress Indicators**: Visual countdown timers on each task
- **Real-time Stats**: Live tracking of performance metrics
- **Responsive Layout**: Optimized for mobile and desktop

### 📱 **Responsive Design**
- **Mobile**: Single column task layout
- **Tablet**: Two column task layout
- **Desktop**: Three column task layout
- **Adaptive Grid**: Stats grid adjusts from 2 to 6 columns

### 🧪 **Cognitive Assessment Value**
This game provides valuable insights into:
- **Executive Function**: Ability to manage multiple cognitive processes
- **Working Memory Capacity**: How many items can be held in active memory
- **Attention Switching**: Speed and accuracy of task switching
- **Cognitive Flexibility**: Adaptation to changing task demands
- **Stress Performance**: Accuracy under time pressure

### 🎨 **Design Alignment**
- **Color Scheme**: Uses brand orange (#FF6B3E) and professional gradients
- **Typography**: Roboto font family throughout
- **Component Structure**: Built with GameFramework for consistency
- **Responsive Patterns**: Follows established mobile-first design
- **Professional Aesthetics**: World-class UI design with premium visual effects

## Technical Implementation
- **React Hooks**: useState, useEffect, useCallback for state management
- **Real-time Updates**: 100ms intervals for smooth progress tracking
- **Memory Management**: Proper cleanup of timers and intervals
- **Performance Optimized**: Efficient re-rendering with proper dependencies

## Route
Access the game at: `/games/cognitive-load-balancer-game`

## Category
**Executive Function** - Tests high-level cognitive processes that control and coordinate other cognitive abilities.
