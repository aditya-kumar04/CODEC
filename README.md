Codec: AI-Powered Academic Repository
Codec is a secure, full-stack cloud repository designed exclusively for university professors and faculty. It provides a centralized digital library to store, manage, and collaborate on academic documents, research papers, and course materials with advanced AI integrations.

Key Features
Privacy-First Architecture: All uploaded documents are strictly private by default. Faculty members must explicitly opt-in to make their materials public to the university network.

Integrated AI Summarization: Powered by the Google Gemini 1.5 Flash API. Faculty can instantly generate beautifully formatted Markdown summaries of lengthy research papers, PDFs, and data files with a single click.

Advanced Deep Search & OCR: It doesn't just search file titles—it reads them. Codec extracts text from PDFs, Office Documents, Images, and Code files, allowing users to search for specific keywords inside the documents.

Granular Filtering: Find exact materials instantly by combining deep text search with custom manual tags, document type filters, and time-based parameters.

Faculty Directory: A built-in community page where professors can discover their peers, view academic designations, and explore public research shared by other faculty members.

Tech Stack
Frontend: React.js, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB & Mongoose

AI Engine: @google/generative-ai (Gemini 1.5 Flash)

Document Parsing: pdf-parse, tesseract.js, officeparser

Authentication: JSON Web Tokens (JWT)

Local Setup & Installation
1. Clone the repository

Bash
git clone https://github.com/Suyash19-tech/Codec.git
cd Codec
2. Install Dependencies
You will need to install dependencies for both the server and the client.

Bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
3. Environment Variables
Create a .env file in your server directory and add the following keys:

Code snippet
PORT=5051
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_google_ai_studio_key
4. Run the Application

Bash
# Start the backend server (from the /server directory)
npm run dev

# Start the React frontend (from the /client directory)
npm run dev
How to add this to your GitHub right now:

Create a new file in your main project folder and name it exactly README.md.

Paste all that text into it and save.

Open your terminal and run these three commands to push the new write-up to your repo:

git add README.md

git commit -m "docs: Added comprehensive README for V2.0"

git push origin main
