import { RequestHandler, Router } from "express"; // Import Router

const authRouter = Router(); // Define authRouter

// Add routes to it
authRouter.post('/login', (req, res) => {
    // ... login logic
});

export const handleDemo: RequestHandler = (req, res) => {
  // ...
};

export { authRouter }; // Export authRouter