# Tiled Map Editor Setup Guide

## 1. Download and Install Tiled

### Windows Installation
1. Visit https://www.mapeditor.org/
2. Click "Download" in the navigation menu
3. Download the Windows installer (`.msi` file)
4. Run the installer and follow the installation wizard
5. Launch Tiled from the Start Menu or desktop shortcut

### Alternative: Portable Version
- Download the portable ZIP version if you prefer not to install
- Extract to a folder and run `tiled.exe`

## 2. First Time Setup

### Configure Preferences
1. Open Tiled
2. Go to **Edit → Preferences**
3. Set the following:
   - **Interface Language**: English (or your preference)
   - **Theme**: Choose your preferred theme
   - **Grid Color**: Adjust for visibility

### Set Project Directory
1. Go to **File → New → New Project**
2. Set project folder to: `C:\Users\lasha\arcania_mmo\arcania-client\public\assets`
3. This will make it easier to reference tilesets and export maps

## 3. Creating Your First Map

### Step 1: Create a New Tileset
1. **File → New → New Tileset**
2. Set:
   - **Name**: `arcania_ground`
   - **Type**: Based on Tileset Image
   - **Tile width**: `64` pixels
   - **Tile height**: `64` pixels
   - **Image**: Browse to your tileset image (PNG file)
3. Click **Save As** and save to `public/assets/tilesets/arcania_ground.tsx`

### Step 2: Create a New Map
1. **File → New → New Map**
2. Configure:
   - **Orientation**: Orthogonal
   - **Tile layer format**: Base64 (zlib compressed)
   - **Tile render order**: Right Down
   - **Map size**:
     - Width: `50` tiles
     - Height: `50` tiles
   - **Tile size**:
     - Width: `64` px
     - Height: `64` px
3. Click **Save As** and save to `public/assets/maps/starter_zone.json`

### Step 3: Add Layers
Create these layers (in order from bottom to top):
1. **Ground** - Base terrain layer
2. **Decorations** - Trees, rocks, etc.
3. **Collisions** - Object layer for collision boxes
4. **Spawns** - Object layer for spawn points

### Step 4: Draw Your Map
1. Select the **Ground** layer
2. Choose a tile from the Tilesets panel
3. Use the Stamp Brush (B) to paint tiles
4. Use Fill tool (F) for large areas

### Step 5: Add Collision Objects
1. Select the **Collisions** layer
2. Use Rectangle tool (R) to draw collision boxes
3. Add custom property: `collides = true`

### Step 6: Add Spawn Points
1. Select the **Spawns** layer
2. Insert → Insert Tile (T)
3. Add custom properties:
   - `type = player_spawn` or `enemy_spawn`
   - `name = spawn_point_1`

## 4. Export Settings

### JSON Export (Recommended for Phaser)
1. **File → Export As**
2. Choose **JSON map files (*.json)**
3. Save to `public/assets/maps/`

### Important Export Options
- **Embed tilesets**: Unchecked (use external tilesets)
- **Detach templates**: Unchecked
- **Resolve object types**: Checked

## 5. Tileset Resources

### LPC Tilesets (Compatible with your character sprites)
- Download from: https://lpc.opengameart.org/
- Look for terrain/ground tilesets that match your 64x64 format

### Creating Custom Tilesets
1. Create PNG image with tiles in a grid
2. Each tile should be 64x64 pixels
3. No spacing or margin between tiles
4. Recommended size: 512x512 (8x8 tiles) or 1024x1024 (16x16 tiles)

## 6. Phaser Integration

Your maps will be loaded in `MainGameScene.ts` using:

```typescript
// In PreloadScene
this.load.tilemapTiledJSON('starter_zone', 'assets/maps/starter_zone.json');
this.load.image('arcania_ground', 'assets/tilesets/arcania_ground.png');

// In MainGameScene
const map = this.make.tilemap({ key: 'starter_zone' });
const tileset = map.addTilesetImage('arcania_ground', 'arcania_ground');
const groundLayer = map.createLayer('Ground', tileset, 0, 0);
```

## 7. Useful Keyboard Shortcuts

- **B** - Stamp Brush
- **E** - Eraser
- **F** - Fill tool
- **R** - Rectangle tool
- **T** - Insert Tile
- **S** - Select tool
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+D** - Duplicate selection
- **Space+Drag** - Pan view

## 8. Tips and Best Practices

1. **Layer Organization**: Keep layers organized and named clearly
2. **Collision Layer**: Use a dedicated object layer for collisions
3. **Custom Properties**: Use object properties for gameplay logic
4. **Grid Snap**: Keep "Snap to Grid" enabled (View → Snapping)
5. **Regular Saves**: Save frequently (Ctrl+S)
6. **Version Control**: Commit map changes to git regularly

## 9. Troubleshooting

### Map doesn't load in Phaser
- Check that paths in JSON match your file structure
- Verify tileset image paths are relative to the map JSON
- Ensure JSON is valid (use a JSON validator)

### Tileset appears broken
- Verify tile size matches (64x64)
- Check for spacing/margin in tileset image
- Ensure PNG is in the correct location

### Collisions not working
- Verify collision layer is an **Object Layer** not a Tile Layer
- Check object properties are set correctly
- Ensure collision setup code in Phaser scene is correct

## Next Steps

1. Download and install Tiled Map Editor
2. Create your first tileset using LPC assets
3. Design your starter zone map
4. Test the map in your game

For more help, visit the Tiled documentation: https://doc.mapeditor.org/
