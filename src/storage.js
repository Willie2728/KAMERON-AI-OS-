import fs from 'node:fs';
import path from 'node:path';

export class JsonCheckpointStorage {
  constructor(dir = './data/checkpoints') {
    this.dir = path.resolve(dir);
    fs.mkdirSync(this.dir, { recursive: true });
  }

  _path(id) {
    return path.join(this.dir, `${id}.json`);
  }

  put(capsule) {
    if (!capsule?.capsule_id) throw new Error('capsule_id required');
    fs.writeFileSync(this._path(capsule.capsule_id), JSON.stringify(capsule, null, 2));
    return capsule;
  }

  get(id) {
    const file = this._path(id);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  list() {
    return fs.readdirSync(this.dir)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(this.dir, f), 'utf8')))
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  remove(id) {
    const file = this._path(id);
    if (!fs.existsSync(file)) return false;
    fs.unlinkSync(file);
    return true;
  }
}

export class StorageFabric {
  constructor(provider) {
    if (!provider || typeof provider.put !== 'function' || typeof provider.get !== 'function') {
      throw new Error('Storage provider must implement put() and get()');
    }
    this.provider = provider;
  }

  put(capsule) { return this.provider.put(capsule); }
  get(id) { return this.provider.get(id); }
  list() { return this.provider.list ? this.provider.list() : []; }
  remove(id) { return this.provider.remove ? this.provider.remove(id) : false; }
}
