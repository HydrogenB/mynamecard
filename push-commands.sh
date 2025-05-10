# Navigate to your project root directory if you're not already there
cd c:\Jirad-python\mynamecard

# Initialize Git repository (skip if already initialized)
git init

# Add the remote repository
git remote add origin https://github.com/HydrogenB/mynamecard.git

# Stage all files
git add .

# Commit your changes with a message
git commit -m "Initial commit" 

# Push to the main branch
# If this is your first push, you might need to set the upstream branch
git push -u origin main
