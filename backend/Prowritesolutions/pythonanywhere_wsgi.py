import sys
import os

# Add your project directory to the Python path
path = '/home/Prowrite/prowrite/backend'
if path not in sys.path:
    sys.path.append(path)

# Set the working directory
os.chdir(path)

# Import your Flask app
from app import app as application

if __name__ == "__main__":
    application.run()
