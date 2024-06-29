import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import serverless from 'serverless-http';
import app from './app';

// Express app
const handler = serverless(app);

// Lambda handler function
export const appHandler = async (
  event: APIGatewayProxyEvent,
  context: any
): Promise<APIGatewayProxyResult> => {
  try {
    // Ensure app is initialized before handling requests
    if (!app) {
      throw new Error('Express app initialization failed');
    }

    // Use serverless-http to proxy requests to Express
    const response = await handler(event, context);

    const result: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Headers": "Cache-Control",
      },
      body: JSON.stringify(response),
    };

    return result;
  } catch (error) {
    console.error('Error handling request:', error);

    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
