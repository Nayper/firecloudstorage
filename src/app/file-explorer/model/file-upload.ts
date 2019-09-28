export class FileUpload {
  key: string;
  name: string;
  url: string;
  parent: string;
  file: File;

  constructor(file: File) {
    this.file = file;
  }
}
