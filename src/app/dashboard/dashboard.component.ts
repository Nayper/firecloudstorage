import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FileService } from '../file-explorer/services/file.service';
import { FileElement } from '../file-explorer/model/file-element';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  user = this.authService.user;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress: Observable<number>;
  downloadURL : Observable<string>;
  isUploadInProgress: boolean;

  itemValue = '';
  items: Observable<any[]>;


  public fileElements: Observable<FileElement[]>;
  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp = false;


  constructor(
    private storage: AngularFireStorage,
    private authService: AuthService,
    private fileService: FileService
  ) {}

  
  upload(event) {
    this.isUploadInProgress = true;
    const file = event.target.files[0];
    this.ref = this.storage.ref(file.name);
    this.task = this.ref.put(file);
    this.uploadProgress = this.task.percentageChanges();
    this.task.snapshotChanges().pipe(
      finalize(
        () => {
          this.isUploadInProgress = false;
          return this.downloadURL = this.ref.getDownloadURL();
        }
      )
      ).subscribe();
  }

  ngOnInit() {
    //Mocks
    //  const folderA = this.fileService.add({ name: 'Folder A', isFolder: true, parent: 'root', url:'' });
    //  this.fileService.add({ name: 'File A', isFolder: false, parent: 'root', url:'' });

    this.fileService.refreshUserFiles().subscribe(() => {
      this.updateFileElementQuery();
    });
  }

  refreshView() {
    this.fileService.refreshUserFiles().subscribe(() => {
      this.updateFileElementQuery();
     });
  }

  addFolder(folder: { name: string }) {
    this.fileService.add({ isFolder: true, name: folder.name, parent: this.currentRoot ? this.currentRoot.id : 'root', url:'' });
    this.updateFileElementQuery();
  }

  removeElement(element: FileElement) {
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
  }

  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.fileService.setCurrentDirectory(element.name);
    this.canNavigateUp = true;
  }

  navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
    this.fileService.setCurrentDirectory("root");
  }

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileElementQuery();
  }

  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

  updateFileElementQuery() {
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.name : 'root');
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }
}
