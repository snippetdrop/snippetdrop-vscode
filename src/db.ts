import * as vscode from "vscode";
import { LocalStoreSnippet } from './interfaces';
import { DB_KEYS } from './config';

export class LocalDB {

  // state is assigned on extension activate
  static state: vscode.Memento;

  static async clear() {
    for (const key of Object.values(DB_KEYS)) {
      await this.state.update(key, '');
    }
  }

  static async setAccessKey(key: string) {
    return this.state.update(DB_KEYS.accessKey, key);
  }

  static getAccessToken(): string {
    return this.state.get(DB_KEYS.accessKey) || "";
  }

  static isLoggedIn(): boolean {
    return !!this.state.get(DB_KEYS.accessKey);
  }

  static setEncryptionKeys(publicKey: string, privateKey: string) {
    return this.state.update(DB_KEYS.encryptionKeys, { publicKey, privateKey });
  }

  static getEncryptionPrivateKey(): string {
    const keys: any = this.state.get(DB_KEYS.encryptionKeys) || {};
    return keys.privateKey;
  }

  static setEncryptionHash(hash: string) {
    return this.state.update(DB_KEYS.encryptionPubKeyHash, hash);
  }

  static getEncryptionHash(): string {
    return this.state.get(DB_KEYS.encryptionPubKeyHash) || "";
  }

  static getRecentContacts(): string[] {
    return this.state.get(DB_KEYS.recentContacts) || [];
  }

  static setRecentContacts(contacts: string[]) {
    return this.state.update(DB_KEYS.recentContacts, contacts);
  }

  static getSnippets(): LocalStoreSnippet[] {
    return this.state.get(DB_KEYS.snippets) || [];
  }

  static setSnippets(snippets: LocalStoreSnippet[]) {
    return this.state.update(DB_KEYS.snippets, snippets);
  }

}