// Difficulty settings for Market Rush
export const difficultySettings = {
  Easy: { timeLimit: 150, lives: 5, hints: 3, customerCount: 8, pointsPerCustomer: 25, orderDisplayTime: 6 },
  Moderate: { timeLimit: 120, lives: 4, hints: 2, customerCount: 5, pointsPerCustomer: 40, orderDisplayTime: 5 },
  Hard: { timeLimit: 90, lives: 3, hints: 1, customerCount: 4, pointsPerCustomer: 50, orderDisplayTime: 4 }
};

// Market stall types with Croatian products
export const stallTypes = {
  fruits: {
    id: 'fruits',
    name: 'Fresh Fruits',
    icon: '🍎',
    color: '#10B981',
    products: [
      { id: 'apple', name: 'Apple', icon: '🍎', price: 5 },
      { id: 'orange', name: 'Orange', icon: '🍊', price: 6 },
      { id: 'banana', name: 'Banana', icon: '🍌', price: 4 },
      { id: 'grapes', name: 'Grapes', icon: '🍇', price: 8 },
      { id: 'strawberry', name: 'Strawberry', icon: '🍓', price: 10 },
      { id: 'peach', name: 'Peach', icon: '🍑', price: 7 },
      { id: 'pineapple', name: 'Pineapple', icon: '🍍', price: 12 },
      { id: 'watermelon', name: 'Watermelon', icon: '🍉', price: 15 }
    ]
  },
  spices: {
    id: 'spices',
    name: 'Croatian Spices',
    icon: '🌶️',
    color: '#EF4444',
    products: [
      { id: 'paprika', name: 'Paprika', icon: '🌶️', price: 8 },
      { id: 'garlic', name: 'Garlic', icon: '🧄', price: 6 },
      { id: 'oregano', name: 'Oregano', icon: '🌿', price: 10 },
      { id: 'bay_leaves', name: 'Bay Leaves', icon: '🍃', price: 12 },
      { id: 'rosemary', name: 'Rosemary', icon: '🌱', price: 14 },
      { id: 'thyme', name: 'Thyme', icon: '🌾', price: 11 },
      { id: 'sage', name: 'Sage', icon: '🌿', price: 13 },
      { id: 'lavender', name: 'Lavender', icon: '💜', price: 16 }
    ]
  },
  clothes: {
    id: 'clothes',
    name: 'Traditional Clothes',
    icon: '👕',
    color: '#3B82F6',
    products: [
      { id: 'shirt', name: 'Linen Shirt', icon: '👕', price: 25 },
      { id: 'dress', name: 'Traditional Dress', icon: '👗', price: 40 },
      { id: 'hat', name: 'Straw Hat', icon: '👒', price: 18 },
      { id: 'scarf', name: 'Silk Scarf', icon: '🧣', price: 22 },
      { id: 'vest', name: 'Embroidered Vest', icon: '🦺', price: 35 },
      { id: 'shoes', name: 'Leather Shoes', icon: '👞', price: 45 },
      { id: 'belt', name: 'Woven Belt', icon: '⚫', price: 20 },
      { id: 'jacket', name: 'Folk Jacket', icon: '🧥', price: 55 }
    ]
  },
  crafts: {
    id: 'crafts',
    name: 'Local Crafts',
    icon: '🏺',
    color: '#8B5CF6',
    products: [
      { id: 'pottery', name: 'Ceramic Pot', icon: '🏺', price: 30 },
      { id: 'basket', name: 'Woven Basket', icon: '🧺', price: 25 },
      { id: 'candle', name: 'Beeswax Candle', icon: '🕯️', price: 15 },
      { id: 'jewelry', name: 'Silver Jewelry', icon: '💍', price: 60 },
      { id: 'woodcraft', name: 'Wooden Spoon', icon: '🥄', price: 12 },
      { id: 'textile', name: 'Hand Towel', icon: '🧻', price: 18 },
      { id: 'soap', name: 'Olive Oil Soap', icon: '🧼', price: 8 },
      { id: 'honey', name: 'Local Honey', icon: '🍯', price: 22 }
    ]
  }
};

// Generate customer orders
export const generateCustomerOrder = (stallType, difficulty, round) => {
  const products = stallTypes[stallType].products;
  const orderSize = difficulty === 'Easy' ? 2 : difficulty === 'Moderate' ? 3 : Math.random() > 0.5 ? 3 : 4;

  const order = [];
  const usedProducts = new Set();

  for (let i = 0; i < orderSize; i++) {
    let product;
    do {
      product = products[Math.floor(Math.random() * products.length)];
    } while (usedProducts.has(product.id));

    usedProducts.add(product.id);
    order.push({
      ...product,
      quantity: Math.random() > 0.7 ? 2 : 1,
      position: i
    });
  }

  return order;
};

// Generate customers for a round
export const generateCustomers = (stallType, difficulty, round) => {
  const settings = difficultySettings[difficulty];
  const customers = [];

  const customerNames = [
    'Ana', 'Marko', 'Petra', 'Ivan', 'Maja', 'Luka', 'Sara', 'Tomislav',
    'Iva', 'Ante', 'Katarina', 'Josip', 'Nina', 'Matej', 'Lucija'
  ];

  const customerEmojis = [
    '👵', '👴', '👩', '👨', '🧓', '👩‍🦳', '👨‍🦳', '👩‍🦱',
    '👨‍🦱', '👩‍💼', '👨‍💼', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳'
  ];

  for (let i = 0; i < settings.customerCount; i++) {
    const order = generateCustomerOrder(stallType, difficulty, round);
    const isFakeCustomer = difficulty === 'Hard' && Math.random() < 0.2; // 20% fake customers in hard mode

    customers.push({
      id: i + 1,
      name: customerNames[i % customerNames.length],
      emoji: customerEmojis[i % customerEmojis.length],
      order: isFakeCustomer ? [] : order,
      isFake: isFakeCustomer,
      served: false,
      basket: [],
      difficulty: difficulty,
      arrivalTime: i * 2000 + Math.random() * 1000, // Staggered arrivals
      patience: difficulty === 'Easy' ? 45 : difficulty === 'Moderate' ? 35 : 25
    });
  }

  return customers;
};

// Scoring logic - New simplified version
export const calculateCustomerScore = (customer, playerOrder) => {
  // Fake customer handling
  if (customer.isFake && playerOrder.length === 0) {
    return { points: 0, type: 'fake_customer_ignored' };
  }
  if (customer.isFake && playerOrder.length > 0) {
    return { points: 0, type: 'fake_customer_served' };
  }

  // No service
  if (playerOrder.length === 0) {
    return { points: 0, type: 'no_service' };
  }

  // Check if orders match exactly
  const expectedOrder = customer.order.map(item => ({ id: item.id, quantity: item.quantity }));
  const playerOrderNormalized = playerOrder.map(item => ({ id: item.id, quantity: item.quantity }));
  const exactMatch = JSON.stringify(expectedOrder) === JSON.stringify(playerOrderNormalized);

  if (exactMatch) {
    // Get points per customer from difficulty settings
    const settings = difficultySettings[customer.difficulty];
    return { points: settings.pointsPerCustomer, type: 'correct_order' };
  }

  // Wrong order - no points, but no negative points either
  return { points: 0, type: 'wrong_order' };
};

// Calculate bonus points - simplified to always return 0
export const calculateBonusPoints = () => {
  return 0;
};

// Get total score - simplified
export const calculateTotalScore = (customerPoints, bonusPoints) => {
  return Math.max(0, Math.min(200, customerPoints + bonusPoints));
};