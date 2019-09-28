import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { NewFolderDialogComponent } from './modals/newFolderDialog/newFolderDialog.component';
import { RenameDialogComponent } from './modals/renameDialog/renameDialog.component';
import { FileService } from './services/file.service';
import { FileUpload } from './model/file-upload';
import { FileElement } from './model/file-element';

@Component({
  selector: 'file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent{
  
  constructor(public dialog: MatDialog, private fileService : FileService) {}

  selectedFiles: FileList;
  percentage: number;
  currentFileUpload: FileUpload;
  isInProgress: boolean = false;

  @Input() fileElements: FileElement[];
  @Input() canNavigateUp: string;
  @Input() path: string;

  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<FileElement>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement; moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<FileElement>();
  @Output() navigatedUp = new EventEmitter();


  deleteElement(element: FileElement) {
    this.fileService.deleteFileUpload(element);
    this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element.isFolder) {
      this.navigatedDown.emit(element);
    }
  }

  navigateUp() {
    this.navigatedUp.emit();
  }

  moveElement(element: FileElement, moveTo: FileElement) {
    this.elementMoved.emit({ element: element, moveTo: moveTo });
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }

  selectFile() {
    document.getElementById('selectNewFile').click();
  }

  uploadNewFile(event) {
    this.isInProgress = true;
    this.selectedFiles = event.target.files;
    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;

    this.currentFileUpload = new FileUpload(file);
    this.fileService.pushFileToStorage(this.currentFileUpload).subscribe(
      percentage => {
        this.percentage =  Math.round(percentage);
        if(this.percentage==100)
          this.isInProgress = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        this.elementRenamed.emit(element);
      }
    });
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }

  downloadFile(element: FileElement) {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', element.url);
    link.setAttribute('download', element.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }


}
