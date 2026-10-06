# How to Push QuickSave Ghana to Your GitHub 🚀

The project is already initialized with Git and committed on branch `main` with proper `.gitignore`, `.gitattributes`, MIT `LICENSE`, and GitHub Actions CI workflow.

---

### Step 1: Create a New Repository on GitHub
1. Open your browser and go to: **[github.com/new](https://github.com/new)**
2. Set **Repository name**: e.g., `quicksave-ghana`
3. Choose **Public** or **Private**
4. ⚠️ **Important**: Leave "Add a README file", "Add .gitignore", and "Choose a license" **UNCHECKED** (we already created them).
5. Click **"Create repository"**.

---

### Step 2: Push Your Code from Your PC Terminal

Open PowerShell or Command Prompt in this folder (`QuickSave-Mobile App`) and run:

```bash
# 1. Link your GitHub repository (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/quicksave-ghana.git

# 2. Push to GitHub
git push -u origin main
```

*(If you use SSH keys, replace the URL with `git@github.com:YOUR_USERNAME/quicksave-ghana.git`)*

---

### What Has Been Configured for GitHub:
- ✅ **`.gitignore`**: Ignores `node_modules/`, `dist/`, `.expo/`, debug logs, and build files.
- ✅ **`.gitattributes`**: Normalizes line endings across Windows, macOS, and Linux.
- ✅ **`LICENSE`**: Open-source MIT License.
- ✅ **`README.md`**: Complete documentation covering features, architecture, and running instructions.
- ✅ **`.github/workflows/ci.yml`**: Automatic GitHub Actions workflow that runs type checks and verifies Android export on every push.
