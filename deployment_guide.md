3.  Access to your **Domain Registrar** (where you bought your domain, e.g., GoDaddy, Namecheap).

---

## Step 1: Push Your Code to GitHub
First, we need to get your code into a GitHub repository.

1.  Create a new repository on GitHub (e.g., `reward-site`).
2.  Run these commands in your terminal (I can help you run these if you want):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/reward-site.git
    git push -u origin main
    ```

## Step 2: Deploy to Vercel
1.  Go to [Vercel.com](https://vercel.com) and log in.
2.  Click **"Add New..."** > **"Project"**.
3.  Select your GitHub repository (`reward-site`).
4.  Configure the project:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Environment Variables**: You need to add your `DATABASE_URL` and `SESSION_SECRET` (if you have one) here.
        *   *Note: Since we are using SQLite (`dev.db`), it won't work permanently on Vercel because Vercel is "serverless" and doesn't keep local files. For a real deployment, you should use a cloud database like **Postgres** (Vercel provides one) or **MySQL**.*
5.  Click **"Deploy"**.

## Step 3: Connect Your Domain
Once deployed:
1.  Go to your Project Dashboard on Vercel.
2.  Click **"Settings"** > **"Domains"**.
3.  Enter your custom domain (e.g., `www.your-casino.com`) and click **"Add"**.
4.  Vercel will show you **DNS Records** (usually an `A Record` and a `CNAME Record`).

## Step 4: Update DNS Records
1.  Log in to your Domain Registrar (e.g., GoDaddy).
2.  Find the **DNS Settings** or **DNS Management** for your domain.
3.  Add the records Vercel gave you:
    *   **Type**: `A` | **Name**: `@` | **Value**: `76.76.21.21` (example)
    *   **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`
4.  Save changes. It may take a few minutes to an hour to propagate.

---

## Important Note on Database (SQLite)
Currently, your app uses **SQLite** (`file:./dev.db`).
*   **Problem**: On Vercel, the filesystem is read-only/ephemeral. Your database changes (new users, rewards) will **disappear** or reset frequently.
*   **Solution**: For a live site, you should switch to **Vercel Postgres** or **PlanetScale**.
    *   I can help you migrate the database configuration if you decide to go live!
