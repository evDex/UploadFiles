import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  droppedFiles: File[] = [];
  isOverDropZone: boolean = false;
  uploadUrl: string = 'https://localhost:7104/api/upload'; 
  uploadResponse: any[] = [];

  allowedExtensions: string[] = ['.mp4', '.mkv', '.avi', '.mov', '.wmv']; 
  errorMessage: string = ''; 
  constructor(private http: HttpClient) { }

  openFilePicker(): void {
    this.fileInput.nativeElement.click(); 
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  private processFiles(files: File[]): void {
    files.forEach(file => {
      const fileExtension = this.getFileExtension(file.name).toLowerCase();
      if (this.allowedExtensions.includes(fileExtension)) {
        this.droppedFiles.push(file);
      } else {
        this.errorMessage = `Invalid file type: ${file.name}. Allowed types are ${this.allowedExtensions.join(', ')}`;
        console.log('Invalid file type:', file.name);
      }
    });
  }
  uploadFiles(): void {
    if (this.droppedFiles.length > 0) {
      const formData = new FormData();
      this.droppedFiles.forEach(file => formData.append('files', file, file.name));

      this.http.post(this.uploadUrl, formData).subscribe({
        next: (response: any) => {
          console.log('Files uploaded successfully:', response);
          this.uploadResponse = response;
        },
        error: (error) => {
          if (error.status === 413) {
            alert('The uploaded file exceeds the allowed size of 50 MB.');
          } else {
            console.error('Upload failed:', error);
          }
        }
      });
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isOverDropZone = false;
    this.errorMessage = ''; 

    const files = event.dataTransfer?.files;
    if (files) {
      Array.from(files).forEach(file => {
        const fileExtension = this.getFileExtension(file.name).toLowerCase();
        if (this.allowedExtensions.includes(fileExtension)) {
          this.droppedFiles.push(file);
          console.log('File dropped: ', file);
        }
        else {
          this.errorMessage = `Invalid file type: ${file.name}. Allowed types are ${this.allowedExtensions.join(', ')}`;
          console.log('Invalid file type:', file.name);
        }
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isOverDropZone = true;
  }

  onDragLeave(): void {
    this.isOverDropZone = false;
  }
  
  private getFileExtension(fileName: string): string {
    return fileName.substring(fileName.lastIndexOf('.'));
  }
}
