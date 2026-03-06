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
export interface LocalAd {
    id: string;
    durationDays: bigint;
    linkUrl: string;
    tagline: string;
    businessName: string;
    isActive: boolean;
    imageUrl: string;
    startDate: bigint;
}
export type UserId = bigint;
export interface backendInterface {
    addContent(_userId: UserId, name: string, description: string, blob: ExternalBlob): Promise<void>;
    addEducation(_userId: UserId, _education: string): Promise<void>;
    addLocalAd(_userId: UserId, businessName: string, imageUrl: string, linkUrl: string, tagline: string, durationDays: bigint, startDate: bigint, isActive: boolean): Promise<void>;
    adminAddAvatar(_userId: UserId, _avatar: string): Promise<void>;
    adminAddUser(userId: UserId, username: string): Promise<void>;
    getActiveLocalAds(): Promise<Array<LocalAd>>;
    getAllLocalAds(): Promise<Array<LocalAd>>;
    getUser(_userId: UserId): Promise<Array<UserId>>;
    sendOtp(_userId: UserId): Promise<void>;
}
