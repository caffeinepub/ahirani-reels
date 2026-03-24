import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type UserId = bigint;
export interface backendInterface {
    addContent(_userId: UserId, name: string, description: string, blob: ExternalBlob): Promise<void>;
    adminAddUser(userId: UserId, username: string): Promise<void>;
    getAdminPaymentSettings(): Promise<string>;
    getAppVersion(): Promise<string>;
    getUser(_userId: UserId): Promise<Array<UserId>>;
    setAdminPaymentSettings(json: string): Promise<void>;
    setAppVersion(version: string): Promise<void>;
}
