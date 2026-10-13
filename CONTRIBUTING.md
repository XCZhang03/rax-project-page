# Contributing to the RAX Project Page

## Architecture

- **Website** (`index.html`): hosted on Cloudflare Pages, auto-deploys on `git push`
- **Large assets** (videos, high-res images): hosted on Cloudflare R2, served from `https://assets.robot-agent-exploration.com/`

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/XCZhang03/rax-project-page.git
   cd rax-project-page
   ```

2. Install Node.js (needed for the upload tool):
   ```bash
   brew install node
   ```

3. Set the Cloudflare API token (ask Xiangcheng for the token):
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   ```
   Add this to your `~/.zshrc` or `~/.bashrc` so it persists.

## Editing the Website

Edit `index.html` directly, then push:
```bash
git add index.html
git commit -m "Description of changes"
git push
```
Cloudflare Pages auto-deploys within ~30 seconds. The site is live at https://robot-agent-exploration.com.

## Uploading Assets (Videos, Images, etc.)

Use `upload.sh` to push large files to R2:

```bash
./upload.sh <local-file> <remote-path> [content-type]
```

### Examples

```bash
# Videos
./upload.sh demo.mp4 static/demo.mp4 video/mp4

# Images
./upload.sh teaser.png figures/teaser.png image/png
./upload.sh result.jpg figures/result.jpg image/jpeg

# PDFs
./upload.sh paper.pdf static/paper.pdf application/pdf
```

The file will be available at `https://assets.robot-agent-exploration.com/<remote-path>`.

### Reference it in the HTML

```html
<!-- Video -->
<video controls>
    <source src="https://assets.robot-agent-exploration.com/static/demo.mp4" type="video/mp4">
</video>

<!-- Image -->
<img src="https://assets.robot-agent-exploration.com/figures/teaser.png" alt="Description">
```

### Common content types

| Extension | Content-Type |
|-----------|-------------|
| `.mp4` | `video/mp4` |
| `.png` | `image/png` |
| `.jpg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.pdf` | `application/pdf` |
| `.svg` | `image/svg+xml` |
| `.webm` | `video/webm` |

## Recommended folder structure on R2

```
static/          # videos, paper PDF, main assets
figures/         # result figures, plots
```

## Links

- **Live site**: https://robot-agent-exploration.com
- **Assets CDN**: https://assets.robot-agent-exploration.com
- **GitHub repo**: https://github.com/XCZhang03/rax-project-page
- **Cloudflare dashboard**: https://dash.cloudflare.com (Xiangcheng's account)
