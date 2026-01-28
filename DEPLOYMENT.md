# DoroLabs Website - Deployment Guide

Complete step-by-step instructions to deploy the DoroLabs website and connect the dorolabs.eu domain.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option A: Cloudflare Pages (Recommended)](#option-a-cloudflare-pages-recommended)
3. [Option B: GitHub Pages](#option-b-github-pages)
4. [DNS Configuration for dorolabs.eu](#dns-configuration-for-dorolabseu)
5. [Contact Form Setup (Resend API)](#contact-form-setup-resend-api)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Future Integrations](#future-integrations)

---

## Prerequisites

- Git installed locally
- GitHub account
- Access to dorolabs.eu DNS settings (your domain registrar)
- (For Cloudflare Pages) Cloudflare account

---

## Option A: Cloudflare Pages (Recommended)

Cloudflare Pages offers better performance, built-in CDN, automatic HTTPS, and easy DNS management.

### Step 1: Push Code to GitHub

```bash
cd presentation_site

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: DoroLabs website"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/dorolabs-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Create Cloudflare Account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up (free)
3. Verify email

### Step 3: Connect to Cloudflare Pages

1. In Cloudflare dashboard, click **Pages** in left sidebar
2. Click **Create a project**
3. Click **Connect to Git**
4. Authorize Cloudflare to access GitHub
5. Select your `dorolabs-website` repository
6. Configure build settings:
   - **Project name:** `dorolabs`
   - **Production branch:** `main`
   - **Build command:** (leave empty - no build needed)
   - **Build output directory:** `/` (root)
7. Click **Save and Deploy**

### Step 4: Wait for Deployment

- Initial deployment takes 1-2 minutes
- You'll get a temporary URL like `dorolabs.pages.dev`
- Test the site thoroughly

### Step 5: Add Custom Domain

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter `www.dorolabs.eu`
4. Click **Continue**
5. Repeat for `dorolabs.eu` (apex domain)

---

## Option B: GitHub Pages

Free hosting directly from GitHub repository.

### Step 1: Push Code to GitHub

```bash
cd presentation_site

git init
git add .
git commit -m "Initial commit: DoroLabs website"
git remote add origin https://github.com/YOUR_USERNAME/dorolabs-website.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** in left sidebar
4. Under "Source", select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your site will be at `https://YOUR_USERNAME.github.io/dorolabs-website/`

### Step 3: Configure Custom Domain

1. In repository **Settings** → **Pages**
2. Under "Custom domain", enter `www.dorolabs.eu`
3. Click **Save**
4. Check "Enforce HTTPS" (after DNS propagates)

---

## DNS Configuration for dorolabs.eu

### If Using Cloudflare (Full Setup - Recommended)

Transfer DNS management to Cloudflare for best results:

1. In Cloudflare dashboard, click **Add a Site**
2. Enter `dorolabs.eu`
3. Select Free plan
4. Cloudflare scans existing DNS records
5. Update nameservers at your domain registrar to:
   ```
   Nameserver 1: [assigned by Cloudflare, e.g., ada.ns.cloudflare.com]
   Nameserver 2: [assigned by Cloudflare, e.g., bob.ns.cloudflare.com]
   ```
6. Wait for DNS propagation (up to 24 hours, usually faster)

Once DNS is on Cloudflare, the custom domain setup in Pages will auto-configure.

### If Keeping DNS at Current Registrar

Add these DNS records at your domain registrar:

#### For Cloudflare Pages:

| Type  | Name  | Value                                | TTL  |
|-------|-------|--------------------------------------|------|
| CNAME | www   | dorolabs.pages.dev                   | Auto |
| CNAME | @     | dorolabs.pages.dev                   | Auto |

*Note: Some registrars don't allow CNAME on apex (@). Use ALIAS if available, or transfer DNS to Cloudflare.*

#### For GitHub Pages:

| Type  | Name  | Value                                | TTL  |
|-------|-------|--------------------------------------|------|
| CNAME | www   | YOUR_USERNAME.github.io              | Auto |
| A     | @     | 185.199.108.153                      | Auto |
| A     | @     | 185.199.109.153                      | Auto |
| A     | @     | 185.199.110.153                      | Auto |
| A     | @     | 185.199.111.153                      | Auto |

### Verify DNS Propagation

Check DNS status:
```bash
# Check www subdomain
nslookup www.dorolabs.eu

# Check apex domain
nslookup dorolabs.eu

# Or use online tool
# https://dnschecker.org
```

---

## Contact Form Setup (Resend API)

The contact form uses a Cloudflare Pages Function with Resend API for email delivery.

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Verify your account

### Step 2: Verify Domain

1. In Resend dashboard, go to **Domains**
2. Add `dorolabs.eu`
3. Add the required DNS records (SPF, DKIM)
4. Wait for verification (usually instant)

### Step 3: Get API Key

1. Go to **API Keys** in Resend dashboard
2. Create a new API key named "DoroLabs Website"
3. Copy the key (starts with `re_`)

### Step 4: Add Environment Variable

In Cloudflare Pages dashboard:
1. Go to your project settings
2. Navigate to **Environment variables**
3. Add variable:
   - Name: `RESEND_API_KEY`
   - Value: your Resend API key
4. Add to both Production and Preview environments

### Step 5: Deploy the Function

The `functions/contact.ts` file will be automatically deployed by Cloudflare Pages.

### Step 6: Test the Form

1. Submit a test message through your live site
2. Check `dorolabs.ac@gmail.com` for the notification
3. Verify all fields are captured correctly

---

## Post-Deployment Checklist

### Verify Everything Works

- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] Mobile menu functions
- [ ] All pages render properly
- [ ] Images and icons display
- [ ] Contact form submits successfully
- [ ] HTTPS is active (padlock icon)
- [ ] www.dorolabs.eu redirects properly
- [ ] dorolabs.eu redirects to www (or vice versa)

### SEO Verification

- [ ] Submit sitemap to Google Search Console
  1. Go to [search.google.com/search-console](https://search.google.com/search-console)
  2. Add property `https://www.dorolabs.eu`
  3. Verify ownership (DNS or HTML file)
  4. Submit sitemap: `https://www.dorolabs.eu/sitemap.xml`

- [ ] Test with Google's tools:
  - [PageSpeed Insights](https://pagespeed.web.dev/)
  - [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
  - [Rich Results Test](https://search.google.com/test/rich-results)

### Security Check

- [ ] All pages load over HTTPS
- [ ] No mixed content warnings
- [ ] Security headers are applied (check at [securityheaders.com](https://securityheaders.com))

---

## Future Integrations

### Adding AI Agents or Chat

To add an AI chatbot later:

1. **Tidio** (free tier available):
   ```html
   <!-- Add before </body> -->
   <script src="//code.tidio.co/YOUR_KEY.js" async></script>
   ```

2. **Crisp** (free tier):
   ```html
   <script type="text/javascript">
     window.$crisp=[];window.CRISP_WEBSITE_ID="YOUR_ID";
     (function(){d=document;s=d.createElement("script");
     s.src="https://client.crisp.chat/l.js";s.async=1;
     d.getElementsByTagName("head")[0].appendChild(s);})();
   </script>
   ```

3. **Custom AI Agent**: Build with OpenAI API + serverless function (Cloudflare Workers)

### Adding Appointment Booking

For appointment scheduling integration:

1. **Calendly** (free tier):
   ```html
   <!-- Embed widget -->
   <div class="calendly-inline-widget" 
        data-url="https://calendly.com/YOUR_LINK" 
        style="min-width:320px;height:630px;">
   </div>
   <script src="https://assets.calendly.com/assets/external/widget.js" async></script>
   ```

2. **Cal.com** (open source, free self-hosted):
   - Similar embed approach
   - More customizable

### Adding Analytics

```html
<!-- Google Analytics 4 - Add to <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Or use privacy-friendly alternatives:
- **Plausible** (paid, GDPR-compliant)
- **Umami** (free, self-hosted)
- **Cloudflare Web Analytics** (free, built into Cloudflare)

---

## Troubleshooting

### DNS Not Propagating

- Wait up to 48 hours (usually 1-4 hours)
- Clear local DNS cache: `ipconfig /flushdns` (Windows)
- Check propagation: [dnschecker.org](https://dnschecker.org)

### HTTPS Certificate Error

- Cloudflare: Auto-issued, wait 15 minutes
- GitHub Pages: Enable "Enforce HTTPS" after DNS propagates

### Form Not Working

- Check Cloudflare Pages deployment logs
- Verify `RESEND_API_KEY` is set in environment variables
- Ensure domain is verified in Resend dashboard
- Check browser console for JavaScript errors
- Test with different browser

### Site Not Updating

- Clear Cloudflare cache: Dashboard → Caching → Purge Everything
- GitHub Pages: Check Actions tab for build status
- Hard refresh browser: Ctrl+Shift+R

---

## Support

For issues with this deployment:
- Check the troubleshooting section above
- Review Cloudflare/GitHub Pages documentation
- Contact: contact@dorolabs.eu
