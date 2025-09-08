BlueSparrow Labs — Portfolio Website

Professional, responsive, accessible portfolio site for a mobile app developer. Built as a static HTML5 site optimized for GitHub Pages.

Features
- Semantic HTML5 with ARIA and keyboard accessibility
- Modern responsive CSS (Grid/Flex) with mobile-first design
- Vanilla JS interactions: sticky header, smooth scrolling, active nav, modals
- SEO: meta tags, Open Graph, Twitter, JSON-LD, sitemap, robots
- Performance: preconnects, minimal JS, minified build
- Ready for GitHub Pages with CI/CD

Project Structure
assets/
- css/styles.css
- js/main.js
- images/ (favicons, og-image, logo placeholders)
- fonts/
index.html
404.html
robots.txt
sitemap.xml

Local Development
No build is required to view the site locally:
python3 -m http.server 8080
# visit http://localhost:8080

Build & Deploy
This repo includes optional npm scripts for minification and a GitHub Actions workflow that publishes dist/ to GitHub Pages.
npm install
npm run build
Outputs to dist/ and updates asset files. On push to main, CI builds/tests/deploys.

Customization
- Update content in index.html sections (hero, about, apps, contact)
- Replace placeholder images in assets/images/
- Adjust theme variables in assets/css/styles.css under :root

Accessibility
- Proper headings, focus styles, and keyboard navigation
- Color contrast meets WCAG AA (>= 4.5:1)

License
Copyright © BlueSparrow Labs.

