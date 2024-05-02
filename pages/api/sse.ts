import { NextApiRequest, NextApiResponse } from 'next';
import { ServerResponse } from 'http';
import { latestMindfulMinutesData } from './auto-export/mindful-minutes';

interface SSEClient extends Pick<ServerResponse, 'write'>, NextApiResponse {}

let clients: SSEClient[] = [];

const addClient = (res: SSEClient) => {
  clients.push(res);
};

const removeClient = (res: SSEClient) => {
  clients = clients.filter(client => client !== res);
};

const sendEventToAllClients = (data: unknown) => {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  addClient(res as SSEClient);

  // Send the latest data immediately if available
  if (latestMindfulMinutesData) {
    sendEventToAllClients(latestMindfulMinutesData);
  }

  // Cleanup when the client disconnects
  req.on('close', () => {
    removeClient(res as SSEClient);
  });
};

export const notifyClients = (data: unknown) => {
  sendEventToAllClients(data);
};
