# Vibe Coding Workshop - February 2026

Welcome to the Vibe Coding Workshop! This repository contains interactive coding demos and projects showcasing the power of AI-assisted development, web technologies, and modern front-end engineering practices.

## 📚 Workshop Overview

This workshop demonstrates practical applications of:
- Interactive algorithm visualization
- Web mapping and geospatial data visualization
- Professional portfolio website development
- AI-powered prompt engineering for web development

Each demo folder includes sample prompts that were used to generate the projects, providing insight into effective AI-assisted coding techniques.

## 📦 Sample Folders Available

### Demo 1: Dijkstra's Algorithm Interactive Visualizer

**Path:** `demo_1/`

An interactive, educational web application for learning and visualizing Dijkstra's shortest-path algorithm.

**Features:**
- Interactive graph canvas (add/edit/delete nodes and edges)
- Step-by-step algorithm execution with visual feedback
- Real-time display of internal algorithm states (distance table, priority queue, visited set)
- Built-in lesson mode with guided learning
- Multiple pre-built scenarios
- Dark/light mode toggle
- Fully responsive design

**Quick Start:**
```bash
cd demo_1
# Open index.html directly in your browser
# Or run a local server:
python -m http.server 8000
```

**Sample Prompt:** See `demo_1/sample_prompt_dijkstra.txt` for the AI prompt used to create this demo.

**Tech Stack:** Vanilla JavaScript, HTML5, CSS3 (no build tools required)

---

### Demo 2: Calgary Webmap Studio

**Path:** `demo_2/`

A full-featured web mapping application using Leaflet, showcasing geospatial data from the City of Calgary Open Data portal.

**Features:**
- Full-screen interactive map with Leaflet.js
- Basemap switcher (OpenStreetMap and alternate views)
- Real-time GeoJSON data loading from Calgary Open Data
- Layer toggles with opacity controls
- Collapsible sidebar interface
- Popup displays with attribute information

**Quick Start:**
```bash
cd demo_2
# Run a local server to avoid CORS issues:
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Sample Prompts:** See `demo_2/sample_prompt_1.txt` and `demo_2/sample_prompt_2.txt` for the AI prompts used.

**Tech Stack:** Leaflet.js (CDN), Socrata Open Data API, HTML5, CSS3, JavaScript

**Data Source:** City of Calgary Open Data (data.calgary.ca)

---

### Demo 3: Professional Portfolio Website

**Path:** `demo_3/`

A clean, professional personal website designed for academic and professional job searching, with integrated portfolio demos.

**Features:**
- Responsive, mobile-first design
- Multiple pages (Home, About, CV, Portfolio, Contact)
- Print-optimized CV page
- Portfolio filtering by category
- SEO optimized (meta tags, sitemap, robots.txt)
- Embedded live demo iframes
- Structured data management with JSON
- Accessible navigation

**Quick Start:**
```bash
cd demo_3
# Run a local server:
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Sample Prompt:** See `demo_3/promp_sample.txt` for the AI prompt used to create this demo.

**Tech Stack:** Semantic HTML5, Modern CSS3, Vanilla JavaScript, GitHub Pages ready

**Documentation:** See `demo_3/README.md` for detailed setup and customization instructions.

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Python 3.x (for running local servers) or any other static file server

### Running the Demos

Each demo is self-contained and can be run independently:

1. **Clone this repository:**
   ```bash
   git clone https://github.com/safarzadeh-reza/Vibe_Coding_Feb2026.git
   cd Vibe_Coding_Feb2026
   ```

2. **Navigate to any demo folder:**
   ```bash
   cd demo_1  # or demo_2, or demo_3
   ```

3. **Start a local server:**
   ```bash
   python -m http.server 8000
   ```
   
4. **Open your browser:**
   Navigate to `http://localhost:8000`

### Alternative: Direct File Opening

For `demo_1` and `demo_3`, you can simply open the `index.html` file directly in your browser. However, `demo_2` requires a local server due to CORS restrictions when loading external geospatial data.

## 📝 Learning from Sample Prompts

Each demo folder includes sample prompt files that showcase effective AI-assisted development:

- **demo_1/sample_prompt_dijkstra.txt** - Comprehensive prompt for educational algorithm visualizer
- **demo_2/sample_prompt_1.txt** - Prompt for web mapping application with real data
- **demo_2/sample_prompt_2.txt** - Additional refinements and features
- **demo_3/promp_sample.txt** - Detailed prompt for portfolio website generation

These prompts demonstrate:
- Clear specification of requirements and constraints
- Effective communication of technical stack preferences
- Detailed feature descriptions
- UX/accessibility considerations
- Deliverable expectations

## 🎯 Workshop Goals

By exploring these demos, you will learn:

1. **AI-Assisted Development**: How to write effective prompts for code generation
2. **Modern Web Development**: Best practices in HTML, CSS, and JavaScript
3. **Interactive Visualizations**: Techniques for creating engaging educational content
4. **Geospatial Web Applications**: Working with mapping libraries and open data
5. **Professional Presentation**: Building portfolio-ready projects

## 📄 License

© 2026 Reza Safarzadeh. All rights reserved.

## 🤝 Contributing

This repository is for workshop demonstration purposes. Feel free to fork and adapt these demos for your own learning and projects.

## 📧 Contact

For questions about the workshop or demos, please reach out through the contact information in `demo_3`.

---

**Happy Coding! 🚀**
