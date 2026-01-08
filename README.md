# DoroLabs Website

Static presentation website for [dorolabs.eu](https://www.dorolabs.eu)

## Tech Stack

- Pure HTML5 + CSS3 + vanilla JavaScript
- No build step required
- Mobile-first responsive design
- SEO optimized

## Project Structure

```
presentation_site/
├── index.html           # Home page
├── services.html        # Services overview
├── how-it-works.html    # Process explanation
├── about.html           # About page
├── contact.html         # Contact form
├── privacy.html         # Privacy policy (GDPR)
├── css/
│   └── styles.css       # All styles
├── js/
│   └── main.js          # Interactions
├── assets/
│   ├── favicon.svg      # Favicon
│   ├── logo.svg         # Logo
│   └── apple-touch-icon.svg
├── sitemap.xml          # SEO sitemap
├── robots.txt           # Crawler rules
├── _headers             # Security headers (Cloudflare)
├── _redirects           # Redirect rules
└── CNAME                # Custom domain
```

## Local Development

```bash
# Option 1: Using npx serve
npx serve . -p 3000

# Option 2: Using Python
python -m http.server 3000

# Option 3: Using PHP
php -S localhost:3000
```

Then open http://localhost:3000

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

### Quick Deploy to Cloudflare Pages

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Set build output directory to `/` (root)
4. Deploy

### Quick Deploy to GitHub Pages

1. Push to GitHub
2. Go to Settings → Pages
3. Select branch and root folder
4. Enable HTTPS

## Contact Form Setup

The contact form uses [Formspree](https://formspree.io) (free tier: 50 submissions/month).

1. Create account at formspree.io
2. Create new form
3. Replace `yourformid` in contact.html with your form ID

## DNS Configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for DNS setup instructions.

## License

Proprietary - DoroLabs
