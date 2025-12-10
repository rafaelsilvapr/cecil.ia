# How to Deploy Your Website to GitHub Pages

Follow these steps to publish your website for free using GitHub Pages.

## Prerequisites
- A GitHub account (sign up at [github.com](https://github.com) if you don't have one).
- Git installed on your computer.

## Step 1: Create a New Repository
1. Go to [github.com/new](https://github.com/new).
2. **Repository name**: `portfolio` (or any name you like).
3. **Public/Private**: Choose **Public** (required for free GitHub Pages).
4. **Initialize**: Do **not** check any boxes (Add README, .gitignore, etc.).
5. Click **Create repository**.

## Step 2: Push Your Code
Open your terminal (or command prompt) and navigate to the `personal_website` folder where your files are located. Run the following commands one by one:

```bash
# Initialize a new git repository
git init

# Add all files to the staging area
git add .

# Commit the files
git commit -m "Initial commit - My Portfolio"

# Link your local repo to the GitHub repo you just created
# REPLACE 'YOUR_USERNAME' WITH YOUR ACTUAL GITHUB USERNAME
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git

# Push the code to GitHub
git push -u origin main
```

> [!NOTE]
> If `git push -u origin main` fails because the branch is called `master`, try `git push -u origin master` instead.

## Step 3: Enable GitHub Pages
1. Go to your repository page on GitHub.
2. Click on **Settings** (top right tab).
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5. Under **Branch**, select **main** (or master) and folder **/(root)**.
6. Click **Save**.

## Step 4: View Your Website
- Wait a minute or two for GitHub to build your site.
- Refresh the Pages settings page. You will see a message at the top: "Your site is live at..."
- Click the link to see your new portfolio!

## Customizing Your Site
- Edit `index.html` to add your real name, bio, and project details.
- Replace the placeholder images in the code or add real `<img>` tags.
- Modify `style.css` if you want to change colors or fonts.
