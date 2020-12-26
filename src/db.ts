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

  static async setUsername(username: string) {
    return this.state.update(DB_KEYS.username, username);
  }

  static getUsername(): string {
    return this.state.get(DB_KEYS.username) || '';
  }

  static async setUserId(key: string) {
    return this.state.update(DB_KEYS.userId, key);
  }

  static getUserId(): string {
    return this.state.get(DB_KEYS.userId) || '';
  }

  static async setApiKey(key: string) {
    return this.state.update(DB_KEYS.apiKey, key);
  }

  static getApiKey(): string {
    return this.state.get(DB_KEYS.apiKey) || '';
  }

  static async setAccessKey(key: any) {
    return this.state.update(DB_KEYS.accessKey, key);
  }

  static getAccessKey(): any {
    return this.state.get(DB_KEYS.accessKey) || {};
  }

  static isLoggedIn(): boolean {
    return !!LocalDB.getUserId();
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

  static getSnippetsSent(): LocalStoreSnippet[] {
    return this.state.get(DB_KEYS.snippetsSent) || [];
  }

  static setSnippetsSent(snippets: LocalStoreSnippet[]) {
    return this.state.update(DB_KEYS.snippetsSent, snippets);
  }

}