export interface IResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
export interface IResourceMetadata {
    created?: Date;
    updated?: Date;
    tags?: string[];
    [key: string]: any;
}
export interface IResourceProvider {
    listResources(): Promise<IResource[]>;
    readResource(uri: string): Promise<any>;
    subscribeToResource?(uri: string, callback: (data: any) => void): () => void;
}
//# sourceMappingURL=resources.d.ts.map