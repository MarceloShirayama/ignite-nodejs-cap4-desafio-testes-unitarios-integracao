import { createConnection, Connection } from "typeorm";

export default async (): Promise<Connection> => {
  const connection = await createConnection();

  return connection
};
