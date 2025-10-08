// TODO: Install ipfs-http-client dependency
// import { create } from 'ipfs-http-client';
import { Buffer } from "buffer";

export class IPFSService {
  private static client: any;

  static initialize() {
    // TODO: Uncomment when ipfs-http-client is installed
    // this.client = create({
    //   host: process.env.IPFS_HOST || 'localhost',
    //   port: parseInt(process.env.IPFS_PORT || '5001'),
    //   protocol: process.env.IPFS_PROTOCOL || 'http',
    // });
    console.warn("IPFS service not available - install ipfs-http-client");
    this.client = null;
  }

  static async uploadToIPFS(data: any): Promise<string> {
    try {
      const file = Buffer.from(JSON.stringify(data));
      const added = await this.client.add(file);
      return added.path;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw error;
    }
  }

  static async getFromIPFS(hash: string): Promise<any> {
    try {
      const stream = this.client.cat(hash);
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error("Error retrieving from IPFS:", error);
      throw error;
    }
  }
}
