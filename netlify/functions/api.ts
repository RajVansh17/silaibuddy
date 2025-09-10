import serverless from "serverless-http";

// Use dynamic import to handle the server creation
export const handler = async (event: any, context: any) => {
  try {
    // In development, try to use the local server
    if (process.env.NODE_ENV !== 'production') {
      // For development, forward to local vite server
      const response = await fetch(`http://localhost:5000${event.path}`, {
        method: event.httpMethod,
        headers: event.headers,
        body: event.body
      });
      
      const data = await response.text();
      
      return {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: data
      };
    }
    
    // For production, use the normal serverless function
    const { createServer } = await import("../../server");
    const app = createServer();
    const serverlessHandler = serverless(app);
    
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
