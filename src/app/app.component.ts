import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  selectedGroup: any;
  newGroupName = '';
  newGroupDescription = '';
  isPreviewMode: boolean = false;
  searchTerm: any;
  selectedField: any = null;
  showFields: boolean = false;

  availableElementGroups = [
    {
      category: 'Text Fields',
      elements: [
        { type: 'Single Line Text', displayName: 'Single Line Text', icon: 'format_size' },
        { type: 'Multi Line Text', displayName: 'Multi Line Text', icon: 'segment' }
      ]
    },
    {
      category: 'Date/Time Fields',
      elements: [
        { type: 'Date', displayName: 'Date', icon: 'calendar_month' },
        { type: 'Time', displayName: 'Time', icon: 'schedule' },
        { type: 'Date & Time', displayName: 'Date & Time', icon: 'work_history' }
      ]
    },
    {
      category: 'Selection Fields',
      elements: [
        { type: 'Dropdown', displayName: 'Dropdown', icon: 'adjust' },
        { type: 'Single Selection', displayName: 'Single Selection', icon: 'check_circle' },
        { type: 'Multi Selection', displayName: 'Multi Selection', icon: 'checklist' }
      ]
    },
    {
      category: 'Media Fields',
      elements: [
        { type: 'Upload', displayName: 'Upload Field', icon: 'upload_file' }
      ]
    }
  ];

  fieldGroups: {
    id: number;
    name: string;
    description: string;
    fields: {
      id: number;
      type: string;
      label: string;
      placeholder: string;
      required: boolean;
      options?: string;
      maxLength?: number;
      validation?: 'email' | 'text';
      value?: any;
      previewUrl?: string | null;
    }[];
  }[] = [];

  ngOnInit(): void {
    const savedGroups = localStorage.getItem('fieldGroups');
    if (savedGroups) {
      this.fieldGroups = JSON.parse(savedGroups);
      if (this.fieldGroups.length > 0) {
        this.selectedGroup = this.fieldGroups[0];
      }
    }
  }

  flattenAvailableElements() {
    return this.availableElementGroups.flatMap(group => group.elements);
  }

  saveGroups() {
    localStorage.setItem('fieldGroups', JSON.stringify(this.fieldGroups));
  }

  openFileds() {
    this.showFields = true;
  }

  cancelNewGroup() {
    this.showFields = false;
  }

  addGroup() {
    this.showFields = true;
    if (this.newGroupName.trim()) {
      const newGroup = {
        id: new Date().getTime(),
        name: this.newGroupName,
        description: this.newGroupDescription,
        fields: []
      };
      this.fieldGroups.push(newGroup);
      this.saveGroups();
      this.newGroupName = '';
      this.newGroupDescription = '';
      this.showFields = false;
    }
  }

  onInputChange(field: any) {
    if (field.maxLength && field.value?.length > field.maxLength) {
      field.value = field.value.slice(0, field.maxLength);
    }
  }

  deleteGroup(group: any) {
    this.fieldGroups = this.fieldGroups.filter(g => g.id !== group.id);
    if (this.selectedGroup?.id === group.id) {
      this.selectedGroup = null;
      this.selectedField = null;
    }
    this.saveGroups();
  }

  selectGroup(group: any) {
    setTimeout(() => {
      this.selectedGroup = group;
      this.selectedField = null;
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (!this.selectedGroup) return;

    if (event.previousContainer !== event.container) {
      const draggedElement = event.previousContainer.data[event.previousIndex];
      const newField = {
        id: new Date().getTime(),
        type: draggedElement.type,
        label: draggedElement.displayName,
        placeholder: '',
        required: false,
        maxLength: draggedElement.type === 'Single Line Text' ? 20 : undefined,
        options: draggedElement.type === 'Dropdown' ? 'Option 1, Option 2' : '',
        value: ''
      };
      this.selectedGroup.fields.splice(event.currentIndex, 0, newField);
      this.saveGroups();
    } else {
      moveItemInArray(this.selectedGroup.fields, event.previousIndex, event.currentIndex);
      this.saveGroups();
    }
  }

  selectField(field: any) {
    this.selectedField = field;
  }

  removeField(field: any) {
    if (this.selectedGroup) {
      this.selectedGroup.fields = this.selectedGroup.fields.filter((f: any) => f.id !== field.id);
      this.saveGroups();
      if (this.selectedField?.id === field.id) {
        this.selectedField = null;
      }
    }
  }

  closeProperties() {
    this.selectedField = null;
  }

  onFileSelect(event: any, field: any) {
    const file = event.target.files?.[0];
    if (file) {
      field.value = file;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          field.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        field.previewUrl = undefined;
      }
    }
  }

  enforceMaxLength(field: any) {
    if (field.maxLength && field.value?.length > field.maxLength) {
      field.value = field.value.substring(0, field.maxLength);
    }
  }

  exportForm() {
    const data = JSON.stringify(this.fieldGroups, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
