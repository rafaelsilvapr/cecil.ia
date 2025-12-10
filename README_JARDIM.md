# Jardim das Sílabas

A gamified literacy web app for kids, featuring a Duolingo-style map and custom vector characters.

## 🚀 How to Run

I have set up a complete Vite + React project for you.

1. **Navigate to the project folder:**
   ```bash
   cd jardim-das-silabas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Click the link in the terminal (usually `http://localhost:5173`).

## 📂 Project Structure

- **`src/App.tsx`**: This is the **Single File Component** containing all the logic, styles (Tailwind classes), and SVG assets. You can copy this file into any React project.
- **`src/index.css`**: Contains the Tailwind directives.

## ✨ Features

- **Custom Avatars**: 
  - **Girl**: Bob hair, bangs, expressive eyes. Changes posture based on plant weight.
  - **Dad**: Glasses, beard, curly hair. Appears in the celebration screen.
- **Interactive Map**: Vertical scrolling path with level locking.
- **Game Mechanics**: 
  - Syllable unscrambling.
  - Watering can physics (tilts based on progress).
  - Plant growth system (Seedling -> Bush -> Tree).
- **Audio**: Built-in synthesized sounds (no external files needed).

Enjoy the learning journey! 🌿
