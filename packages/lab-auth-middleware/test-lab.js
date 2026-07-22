const http = require('http');
const { createLabAuthMiddleware } = require('./index.js');

const authMiddleware = createLabAuthMiddleware({
  centralAuthUrl: "http://localhost:3000/api/auth/authorize-lab",
  loginUrl: "http://localhost:3000/login",
  labId: "cognicore-ai" // A standard lab ID that new users can access
});

const server = http.createServer((req, res) => {
  // Wrap the request in the middleware
  authMiddleware(req, res, () => {
    // If middleware calls next(), it means the user is AUTHORIZED!
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Secret Premium Lab</title></head>
      <body style="background: #111; color: #0f0; font-family: monospace; padding: 2rem;">
        <h1>ACCESS GRANTED: Welcome to the Premium Secret Lab (ws-025)!</h1>
        <p>You have successfully authenticated via the central server.</p>
        <p>User Email: ${req.labUser?.email}</p>
      </body>
      </html>
    `);
  });
});

server.listen(3001, () => {
  console.log('Test Lab Server running on http://localhost:3001');
});
