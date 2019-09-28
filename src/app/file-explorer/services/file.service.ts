import { Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { BehaviorSubject,Observable } from 'rxjs';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from 'src/app/auth/services/auth.service';
import { finalize, map, tap } from 'rxjs/operators';
import { FileElement } from '../model/file-element';
import { FileUpload } from '../model/file-upload';

export interface IFileService {
  add(fileElement: FileElement);
  addMass(files: FileUpload[]);
  delete(id: string);
  update(id: string, update: Partial<FileElement>);
  queryInFolder(folderId: string): Observable<FileElement[]>;
  get(id: string): FileElement;
}

@Injectable()
export class FileService implements IFileService {
 
  public map = new Map<string, FileElement>();
  userUid = this.authService.user.uid;
  elements: any[];
  currentDirectory: string = "root";
  
  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage, private authService: AuthService) {}

  refreshUserFiles(): Observable<FileUpload[]> {
    return this.getFileUploads().snapshotChanges().pipe(
      map(changes => changes.map(c => ({ key: c.payload.key, ...c.payload.val() } as FileUpload))),
      tap(payload => this.addMass(payload))
    );
  }

  getFileUploads(): AngularFireList<FileUpload> {
    return this.db.list(this.userUid, ref =>
    ref.limitToLast(100));
  }

  pushFileToStorage(fileUpload: FileUpload) 
  {
      const filePath = `${this.userUid}/${fileUpload.file.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, fileUpload.file);
  
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          storageRef.getDownloadURL().subscribe(downloadURL => {
            fileUpload.url = downloadURL;
            fileUpload.name = fileUpload.file.name;
            fileUpload.parent = this.currentDirectory;
            this.saveFileData(fileUpload);
          });
        })
      ).subscribe();
  
      return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload) {
    this.db.list(this.userUid).push(fileUpload);
  }

  deleteFileUpload(file: FileElement) {
    
    if(file.isFolder)
    {
        let parent = file.name;
        for (let temp of this.map.values()) {
          if (temp.parent === parent)
            this.deleteFileUpload(temp);
        }
    }
    else
    {
    this.deleteFileDatabase(file.id)
      .then(() => {
        this.deleteFileStorage(file.name);
      })
      .catch(error => console.log(error));
    }
  }

  private deleteFileDatabase(key: string) {
    return this.db.list(this.userUid).remove(key);
  }

  private deleteFileStorage(name: string) {
    const storageRef = this.storage.ref(this.userUid);
    storageRef.child(name).delete();
  }

  addMass(fileElements: FileUpload[]) {
    
    fileElements.forEach(file => {
      let fileElement = new FileElement();
      fileElement.id = file.key;
      fileElement.name = file.name;
      fileElement.isFolder = false;
      fileElement.url = file.url;
      fileElement.parent = !file.parent ? 'root' : file.parent;

      let parentFolderExists = false;
      for (let temp of this.map.values()) {
        if (temp.isFolder && temp.name === fileElement.parent)
          parentFolderExists = true;
      }
      if (!parentFolderExists && fileElement.parent !=='root') {
        this.add({ isFolder: true, name: fileElement.parent, parent: 'root', url: '' });
      }

      this.map.set(fileElement.id, this.clone(fileElement));
    });
  }

  add(fileElement: FileElement) {
    fileElement.id = v4();
    this.map.set(fileElement.id, this.clone(fileElement));
    return fileElement;
  }


  delete(id: string) {
    this.map.delete(id);
  }

  update(id: string, update: Partial<FileElement>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  private querySubject: BehaviorSubject<FileElement[]>;
  queryInFolder(folderId: string) {
    
    const result: FileElement[] = [];
    this.map.forEach(element => {
      if (element.parent === folderId) {
        result.push(this.clone(element));
      }
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  get(id: string) {
    return this.map.get(id);
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }

  setCurrentDirectory(currentPath: string) {
    this.currentDirectory = currentPath;
  }
}
