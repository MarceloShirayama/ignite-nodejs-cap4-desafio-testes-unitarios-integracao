import { createConnection, Connection } from "typeorm";

// (async () => await createConnection())();

export default async (): Promise<Connection> => {
  const connection = await createConnection();

  return connection
};
