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
export type VideoId = bigint;
export interface ContentData {
    id: string;
    blob: ExternalBlob;
    name: string;
    description: string;
}
export interface backendInterface {
    addContent(_userId: UserId, name: string, description: string, blob: ExternalBlob): Promise<void>;
    addEducation(_userId: UserId, _education: string): Promise<void>;
    adminAddAvatar(_userId: UserId, _avatar: string): Promise<void>;
    adminAddUser(userId: UserId, username: string): Promise<void>;
    getContent(_userId: UserId, id: VideoId): Promise<ContentData | null>;
    getUser(_userId: UserId): Promise<Array<UserId>>;
    sendOtp(_userId: UserId): Promise<void>;
}
