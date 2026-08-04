import { LocalObjectStorageAdapter } from "@infrastructure/storage/local-object-storage.adapter";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalEvidenceStorageAdapter extends LocalObjectStorageAdapter {}
