# Reza Safarzadeh - Personal Website

A clean, professional personal website for PhD job searching, built with semantic HTML, modern CSS, and minimal JavaScript.

## 🚀 Quick Start

### Run Locally

**Option 1: Python (recommended)**
```bash
cd c:\Users\rezas\Desktop\Vibe_coding
python -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

**Option 2: VS Code Live Server**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"

**Option 3: Node.js**
```bash
npx serve .
```

## 📦 Deploy to GitHub Pages

1. **Create a GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it `safarzadeh-reza.github.io` (or any name)
   - Keep it public

2. **Push your code**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Personal website"
   git branch -M main
   git remote add origin https://github.com/safarzadeh-reza/safarzadeh-reza.github.io.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` → `/ (root)`
   - Click Save

4. **Access your site**
   - Your site will be live at: `https://safarzadeh-reza.github.io/`

## 📁 Project Structure

```
├── index.html              # Home page
├── about.html              # About page
├── cv.html                 # CV page (print-optimized)
├── contact.html            # Contact page
├── portfolio/
│   └── index.html          # Portfolio page
├── assets/
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   └── main.js         # JavaScript (navigation, filters, form)
│   └── images/
│       └── profile.png     # Profile photo
├── data/
│   └── profile.json        # Centralized profile data
├── demos/                  # Interactive demos folder
│   ├── webmap/             # Webmap demo (add your files here)
│   └── dijkstra/           # Dijkstra demo (add your files here)
├── Reza_Safarzadeh_CV.pdf  # Downloadable CV
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots file
└── README.md               # This file
```

## ✏️ How to Update Content

### Update Profile Information

Edit `data/profile.json` to update:
- Personal info (name, tagline, summary, contact)
- Education entries
- Work experience
- Skills
- Projects
- Awards

### Add New Portfolio Items

1. Open `data/profile.json`
2. Add a new entry to the `projects` array:
   ```json
   {
     "title": "Project Name",
     "category": "Research",
     "problem": "What problem does this solve?",
     "solution": "What did you build?",
     "stack": ["Python", "PyTorch"],
     "outcomes": "Results and impact",
     "link": "https://your-project-link.com",
     "featured": false
   }
   ```
3. Add the corresponding card to `portfolio/index.html`

### Add Interactive Demos

1. Create a folder under `/demos/` (e.g., `/demos/webmap/`)
2. Add your demo files with an `index.html` entry point
3. The portfolio page already has placeholder links pointing to these folders

### Update CV

1. Edit `cv.html` directly for the web version
2. Replace `Reza_Safarzadeh_CV.pdf` with your updated PDF

## 🎨 Customization

### Colors
Edit CSS custom properties in `assets/css/styles.css`:
```css
:root {
  --color-primary: #2563eb;      /* Main blue */
  --color-accent: #06b6d4;       /* Cyan accent */
  --color-secondary: #0f172a;    /* Dark background */
}
```

### Typography
The site uses [Inter](https://fonts.google.com/specimen/Inter) from Google Fonts. Change in the `<head>` of each HTML file.

## 📱 Features

- ✅ Responsive design (mobile-first)
- ✅ Print-optimized CV page
- ✅ Portfolio filtering by category
- ✅ SEO meta tags and OpenGraph
- ✅ Accessible navigation
- ✅ No tracking by default
- ✅ Fast loading (no heavy dependencies)

## 📄 License

© 2025 Reza Safarzadeh. All rights reserved.
