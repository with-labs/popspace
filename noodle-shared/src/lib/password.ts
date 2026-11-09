import crypto from 'crypto';

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

const scrypt = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derived) => {
      if (err) return reject(err);
      resolve(derived);
    });
  });

export class Password {
  /*
    Hashes are stored as `scrypt$<salt>$<hash>` so the algorithm
    can be changed later without breaking existing rows.
  */
  async hash(password: string) {
    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    const derived = await scrypt(password, salt);
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }

  async verify(password: string, stored: string | null) {
    if (!password || !stored) {
      return false;
    }
    const [algorithm, salt, hash] = stored.split('$');
    if (algorithm !== 'scrypt' || !salt || !hash) {
      return false;
    }
    const expected = Buffer.from(hash, 'hex');
    const derived = await scrypt(password, salt);
    return (
      derived.length === expected.length &&
      crypto.timingSafeEqual(derived, expected)
    );
  }

  // constant-time comparison of two plain strings, e.g. env credentials
  safeEqual(a: string, b: string) {
    const digestA = crypto.createHash('sha256').update(a || '').digest();
    const digestB = crypto.createHash('sha256').update(b || '').digest();
    return crypto.timingSafeEqual(digestA, digestB);
  }
}

export default new Password();
