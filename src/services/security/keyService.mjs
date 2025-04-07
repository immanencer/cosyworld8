
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

export class KeyService {
  constructor() {
    this.keyPath = './.keys';
    this.privateKeyPath = path.join(this.keyPath, 'private.key');
    this.publicKeyPath = path.join(this.keyPath, 'public.key');
  }

  async ensureKeys() {
    if (!fs.existsSync(this.keyPath)) {
      fs.mkdirSync(this.keyPath);
    }

    if (!fs.existsSync(this.privateKeyPath) || !fs.existsSync(this.publicKeyPath)) {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      fs.writeFileSync(this.privateKeyPath, privateKey);
      fs.writeFileSync(this.publicKeyPath, publicKey);
    }

    return {
      privateKey: fs.readFileSync(this.privateKeyPath, 'utf8'),
      publicKey: fs.readFileSync(this.publicKeyPath, 'utf8')
    };
  }
}
