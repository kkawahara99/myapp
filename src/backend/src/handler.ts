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
    console.log(`event: ${event}`);

    // Use serverless-http to proxy requests to Express
    const response = await handler(event, context);

    const result: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response),
    };
    console.log(`result: ${result}`);

    return result;
  } catch (error) {
    console.error('Error handling request:', error);

    // Return an error response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
