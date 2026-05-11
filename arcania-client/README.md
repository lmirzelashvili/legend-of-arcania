# Legend of Arcania - Frontend Client

Browser-based 2D top-down MMORPG client built with **Phaser 3 + React + TypeScript**.

---

## 🎮 Tech Stack

- **Game Engine:** Phaser 3 (2D rendering, physics, sprites)
- **UI Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Real-time:** Socket.IO Client
- **HTTP Client:** Axios

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file is already created with default values:
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

The client will start on **http://localhost:5173**

---

## 📁 Project Structure

```
arcania-client/
├── public/              # Static assets
├── src/
│   ├── components/      # React UI components
│   │   ├── Auth/        # Login, Register
│   │   ├── Character/   # Character selection, creation
│   │   └── Game/        # HUD, Chat, Inventory
│   ├── game/            # Phaser game code
│   │   ├── scenes/      # Game scenes (Boot, Preload, MainGame)
│   │   ├── entities/    # Player, Enemy classes
│   │   └── config.ts    # Phaser configuration
│   ├── services/        # API & Socket services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript types
│   ├── constants/       # Game constants
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎯 Features Implemented

### ✅ Authentication
- Login/Register screens
- JWT token management
- Protected routes

### ✅ Character System
- Character creation with race/class selection
- Race-class compatibility validation
- Character selection screen
- Delete characters

### ✅ Game Engine (Phaser 3)
- Boot, Preload, and Main Game scenes
- Player movement (WASD/Arrow keys)
- Camera follow system
- Tilemap world generation
- Player sprites with name labels

### ✅ Real-Time Multiplayer
- Socket.IO connection
- See other players in real-time
- Synchronized movement
- Player join/leave events

### ✅ UI Overlays (React)
- Game HUD with HP/Mana bars
- Character info display
- Chat system (Map/Global/Party)
- Inventory button (placeholder)
- Character sheet button (placeholder)

### ✅ Responsive Design
- Mobile-ready (touch controls coming)
- Tailwind CSS styling
- Backdrop blur effects
- Smooth animations

---

## 🎮 How to Play

### 1. Login/Register
- Open http://localhost:5173
- Create account or login
- Test credentials: `player@game.com` / `password123`

### 2. Create Character
- Click "Create New Character"
- Choose name (3-20 characters)
- Select race: Human, Luminar, Mochi, or Darkan
- Select compatible class: Paladin, Cleric, Mage, Fighter, or Ranger
- Character stats are calculated automatically

### 3. Enter Game
- Select your character
- Click "Enter World"
- You spawn in the starter zone

### 4. Controls
- **WASD / Arrow Keys** - Move
- **SPACE** - Attack (coming soon)
- **1-3** - Abilities (coming soon)
- **R** - Ultimate (coming soon)
- **I** - Inventory (coming soon)
- **C** - Character sheet (coming soon)
- **ENTER** - Chat

---

## 🌐 Connecting to Backend

The frontend automatically connects to the backend running on `http://localhost:3000`.

**Make sure the backend is running:**
```bash
# In the backend directory
cd ../
npm run dev
```

---

## 🔧 Development

### Build for Production
```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

### Type Checking
```bash
npx tsc --noEmit
```

---

## 🎨 Architecture

### React + Phaser Integration

The app uses a **hybrid architecture**:

1. **Phaser Canvas** - Full-screen game world (bottom layer)
2. **React Overlays** - UI elements on top (pointer-events-none parent, pointer-events-auto children)

```
┌─────────────────────────────────────┐
│  React: HUD, Chat, Inventory        │  ← UI Layer
├─────────────────────────────────────┤
│  Phaser: Game World, Players        │  ← Game Layer
└─────────────────────────────────────┘
```

### State Management

- **Zustand** - Global app state (user, character, UI toggles)
- **Socket.IO** - Real-time game state
- **Phaser Scene Data** - Game-specific state

### Data Flow

```
Backend API → Axios → Zustand Store → React Components
Backend WS  → Socket.IO → Phaser Scenes → Game Objects
```

---

## 🚧 Coming Soon

### Phase 2 Features
- [ ] Mobile touch controls (virtual joystick)
- [ ] Combat system
- [ ] Ability casting
- [ ] Inventory UI
- [ ] Equipment system
- [ ] Character stats sheet
- [ ] Monster spawns
- [ ] Item drops
- [ ] Marketplace UI

### Phase 3 Features
- [ ] Party system
- [ ] Guild system
- [ ] Quest UI
- [ ] World map
- [ ] Different zones
- [ ] Boss fights

---

## 📝 Race-Class Combinations

| Race | Available Classes |
|------|------------------|
| **Human** | Paladin, Cleric, Fighter, Ranger |
| **Luminar** | Cleric, Mage, Fighter |
| **Mochi** | Paladin, Cleric, Ranger |
| **Darkan** | Paladin, Mage, Fighter |

---

## 🎮 Game Classes

| Class | Role | Damage | Survivability |
|-------|------|--------|---------------|
| **Paladin** | Tank | Medium | Very High |
| **Cleric** | Healer | Low | Medium |
| **Mage** | Magic DPS | Very High | Low |
| **Fighter** | Melee DPS | Very High | Medium |
| **Ranger** | Ranged DPS | High | Medium |

---

## 🛠️ Troubleshooting

### Backend Not Connected
- Ensure backend is running on port 3000
- Check `.env` file for correct API_URL and WS_URL
- Open browser console for connection errors

### Phaser Not Loading
- Clear browser cache
- Check console for asset loading errors
- Ensure PreloadScene completed

### Socket.IO Issues
- Check network tab for WebSocket connection
- Verify JWT token is being sent in auth
- Backend must be running with Socket.IO enabled

---

## 📖 Documentation

- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [React Docs](https://react.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎉 Status

**Frontend Status:** ✅ Core systems complete and playable!

**What Works:**
- Full authentication flow
- Character creation/selection
- Real-time multiplayer movement
- Chat system
- Game HUD

**Ready for:** Gameplay expansion, combat system, items, and content!
